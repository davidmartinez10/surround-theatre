import style from "./App.module.css";

const cells = Array.from({ length: 4 }, (_, index) => `Cell ${index + 1}`);

function App() {
  return (
    <main class={style.app}>
      <section class={style.grid}>
        {cells.map((label) => (
          <div class={style.cell}>
            <span>{label}</span>
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;
