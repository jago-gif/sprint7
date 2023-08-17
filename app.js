import express from "express";
import { createPool } from "mysql2/promise";
import hbs from "hbs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })) // envio de post
app.use(express.json()) // envío de post
app.set("view engine", "hbs");
//configuración rutas de partials
hbs.registerPartials(__dirname + "/views/partials");
const PORT = 3000;

app.use(express.json());

const db = createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "bancosolar",
});

app.get("/", (req, res) => {
res.render("index");
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
