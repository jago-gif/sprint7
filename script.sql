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

    INSERT INTO
    usuarios (nombre, balance)
VALUES ('Juan Pérez', 1000.50), ('María Rodríguez', 500.75), ('Luis García', 200.00), ('Ana Martínez', 1500.25);

INSERT INTO
    transferencias (emisor, receptor, monto, fecha)
VALUES (1, 2, 200.50, NOW()), (2, 3, 50.25, NOW()), (3, 1, 100.00, NOW()), (4, 2, 300.75, NOW()), (2, 4, 150.25, NOW());