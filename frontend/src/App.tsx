import { useEffect, useState } from "react";
import { api, type Item } from "./api";

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listItems().then(setItems).catch((e: Error) => setError(e.message));
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      const item = await api.createItem(name);
      setItems((prev) => [...prev, item]);
      setName("");
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>HackYeah 2026</h1>
      <form onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New item" />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <ul>
        {items.map((i) => (
          <li key={i.id}>{i.name}</li>
        ))}
      </ul>
    </main>
  );
}
