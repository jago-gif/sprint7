import express from "express";
import { createPool } from "mysql2/promise";
import hbs from "hbs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import axios from 'axios'; // Importa Axios

import dotenv from "dotenv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); // envio de post
app.use(express.json()); // envío de post
app.set("view engine", "hbs");
//configuración rutas de partials
hbs.registerPartials(__dirname + "/views/partials");
const PORT = 3000;
dotenv.config();
app.use(express.json());

const db = createPool({
  host: "localhost",
  user: "root",
  password: "Daniel92.",
  database: "bancosolar",
});

// GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba.

app.get("/", (req, res) => {
  res.render("index");
});

// usuario POST: Recibe los datos de un nuevo usuario y los almacena en MySQL.
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




// usuarios GET: Devuelve todos los usuariosregistrados con sus balances.
app.get("/usuarios", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM usuarios");
    console.log(results);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error al listar los usuarios" });
  }
});

// usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.

app.put("/usuario", async (req, res) => {
  try {
    const { id, nombre, balance } = req.body;
    const [results] = await db.query(
      "update usuarios set nombre = ?, balance = ? where id = ?",
      [nombre, balance, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({ mensaje: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

// usuario DELETE: Recibe el id de un usuario registrado y lo elimina.

app.delete("/usuario", async (req, res) => {
  try {
    const { id } = req.body;
    const [results] = await db.query("DELETE FROM usuarios where id= ?", [id]);
    console.log(results);

    if (results.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({ mensaje: "Usuario Eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
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
// app.get("/transferencias", async (req, res) => {
//   try {
//     const [transferencias] = await db.query('SELECT * FROM transferencias');
//     res.json(transferencias);
//     console.log(transferencias)
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al obtener las transferencias' });
//   }
// });

app.get("/transferencias", async (req, res) => {
  try {
    const query = `
      SELECT
        t.*,
        emisor.nombre AS nombre_emisor,
        receptor.nombre AS nombre_receptor
      FROM
        transferencias t
        INNER JOIN usuarios emisor ON t.emisor = emisor.id
        INNER JOIN usuarios receptor ON t.receptor = receptor.id
    `;
    const [transferencias] = await db.query(query);
    res.json(transferencias);
    console.log(transferencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las transferencias' });
  }
});


///////// FIN TRANSFERENCIAS



app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
