import type pouch from "pouchdb-browser";

const pouchdb: typeof pouch = nw.require("pouchdb-browser");

pouchdb.plugin(require("pouchdb-adapter-memory"));
pouchdb.defaults({ auto_compaction: true });

export const PouchDB = pouchdb;
