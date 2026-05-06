import {createStore, produce} from "solid-js/store";

function all_docs_transform<T extends {}>(
  documents: PouchDB.Core.AllDocsResponse<T>,
) {
  if (! documents.total_rows) return [];
  return documents.rows.map(function map(e) { return e.doc; }) as
         PouchDB.Core.ExistingDocument<T>[];
}

export function use_collection<T extends {}>(database: PouchDB.Database<T>) {
  const [docs, set_docs] = createStore(
    [] as PouchDB.Core.ExistingDocument<T>[],
  );

  database.allDocs({ include_docs: true })
    .then(all_docs_transform)
    .then(function onfulfilled(value) {
      set_docs(
        produce(function fn(state) { state.push(...value); }),
      );
    });

  database.changes({ since: "now", include_docs: true, live: true })
    .on("change", function(change) {
      if (change.deleted) {
        set_docs(
          produce(function fn(state) {
            const i
              = docs.findIndex(function(v) { return v._id === change.id; });
            state.splice(i, 1);
          }),
        );
      } else {
        set_docs(
          produce(function fn(state) {
            if (change.doc) {
              const i
                = docs.findIndex(function(v) { return v._id === change.id; });

              if (i === -1) {
                state.push(change.doc);
              } else {
                const old           = state[i];
                (state as any[])[i] = undefined;
                state[i]            = Object.assign(old, change.doc);
              }
            }
          }),
        );
      }
    });

  function upsert(o: Partial<PouchDB.Core.Document<T>>) {
    if (! o._id) { o._id = new Date().toJSON() as (typeof o)["_id"]; }
    return database.put({...o } as T).catch(console.error);
  }

  function remove(
    o: Partial<T>&PouchDB.Core.IdMeta&PouchDB.Core.RevisionIdMeta,
  ) {
    return database.remove(o);
  }

  return [docs, upsert, remove] as const;
}

export type SingleDocumentCollection<T> = keyof T extends infer U
  ? U extends keyof                                             T
  ? {
  _id: U;
  value: T[U]
}
    : never
  : never;

    export function use_single_document_collection<T extends {}>(
      database: PouchDB.Database<SingleDocumentCollection<T>>,
    ) {
      const [document, set_document] = createStore<T>({} as T);

      database.allDocs({ include_docs: true })
        .then(all_docs_transform)
        .then(function onfulfilled(value) {
          set_document(
            produce(function fn(state) {
              Object.assign(
                state,
                Object.fromEntries(
                  value.map(function(v) { return [v._id, v.value]; }),
                  ),
              );
            }),
          );
        });

      database.changes({ since: "now", include_docs: true, live: true })
        .on("change", function(change) {
          if (change.deleted) {
            set_document(
              produce(function fn(state) {
                (state as { [k: string]: any })[change.id] = undefined;
              }),
            );
          } else {
            set_document(change.id as keyof{}, change?.doc?.value as any);
          }
        });

      async function upsert(object: Partial<T>) {
        const entries = Object.entries(object).filter(function filter(
          [k, v]) { return v !== document[k as keyof T]; });

        for (const [k, v] of entries) {
          const d = (await database.get(k).catch(console.error)) || { _id: k };
          await database
            .put({...d, value: v } as
                 PouchDB.Core.PutDocument<SingleDocumentCollection<T>>)
            .catch(console.error);
        }
      }

      async function remove(
        doc: (PouchDB.Core.ExistingDocument<T>|keyof T)&{ _id: string },
      ) {
        const d = await database.get(typeof doc === "string" ? doc : doc._id);
        return database.remove(d);
      }

      return [document, upsert, remove] as const;
    }
