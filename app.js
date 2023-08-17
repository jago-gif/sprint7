import exprees from 'express';
import { createPool } from 'mysql2';

const app = exprees();
const PORT = 3000;

app.use(exprees.json());

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'bancosolar',
});

app.post('/usuario', async(req, res) => {
    try {
        const {nombre, balance} = req.body;
        const [results] = await db.query(`INSERT INTO usuario (nombre, balance) VALUES ('${nombre}', ${balance})`);
        res.status(200).send(results);
        
    
    } catch (error) {
        console.error(error);
        res.status(500).send(error)
    }
});

app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto ', PORT);
});