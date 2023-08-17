CREATE DATABASE bancosolar;

use bancosolar;

CREATE TABLE
    usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50),
        balance FLOAT CHECK (balance >= 0)
    );

CREATE TABLE
    transferencias(
        id INT AUTO_INCREMENT PRIMARY KEY,
        emisor INT,
        receptor INT,
        monto FLOAT,
        fecha TIMESTAMP,
        FOREIGN KEY (emisor) REFERENCES usuarios(id),
        FOREIGN KEY (receptor) REFERENCES usuarios(id)
    );