import express from "express";
import { createPool } from "mysql2/promise";
import hbs from "hbs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("view engine", "hbs");
//configuración rutas de partials
hbs.registerPartials(__dirname + "/views/partials");


const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })) // envio de post
app.use(express.json()) // envío de post

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

///////// INICIO  TRANSFERENCIAS


// Ruta para realizar una nueva transferencia (con transacción)
app.post("/transferencia", async (req, res) => {
  try {
    const { emisor, receptor, monto } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Actualizar el balance del emisor y receptor
    await connection.query('UPDATE usuarios SET balance = balance - ? WHERE id = ?', [monto, emisor]);
    await connection.query('UPDATE usuarios SET balance = balance + ? WHERE id = ?', [monto, receptor]);

    // Registrar la transferencia
    await connection.query('INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES (?, ?, ?, NOW())', [emisor, receptor, monto]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Transferencia realizada exitosamente' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error(error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
});

// Ruta para obtener todas las transferencias
app.get("/transferencias", async (req, res) => {
  try {
    const [transferencias] = await db.query('SELECT * FROM transferencias');
    res.json(transferencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las transferencias' });
  }
});


///////// FIN TRANSFERENCIAS



app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});


app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
