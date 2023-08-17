import express from "express";
import { createPool } from "mysql2/promise";

const app = express();
const PORT = 3000;

app.use(express.json());

const db = createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "bancosolar",
});

app.post("/usuario", async (req, res) => {
  try {
    const { nombre, balance } = req.body;
    const [results] = await db.query(
      `INSERT INTO usuarios (nombre, balance) VALUES (?, ?)`,
      [nombre, balance]
    );
    res.status(200).json({ id: results.insertId, nombre, balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
