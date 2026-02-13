const express = require('express');
const router = express.Router();
const { sql, conectarDB } = require('../db'); // Asegúrate de que la ruta a db.js sea correcta

// READ - Obtener registros de SQL Server
router.get('/', async (req, res) => {
    try {
        const pool = await conectarDB();
        const result = await pool.request().query('SELECT * FROM Usuarios');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE - Guardar en SQL Server
router.post('/', async (req, res) => {
    try {
        const { Nombre, ApellidoP, ApellidoM, Usuario, Password, Correo, Telefono, FechaNacimiento } = req.body;
        const pool = await conectarDB();
        await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('ApellidoP', sql.NVarChar, ApellidoP)
            .input('ApellidoM', sql.NVarChar, ApellidoM)
            .input('Usuario', sql.NVarChar, Usuario)
            .input('Password', sql.NVarChar, Password)
            .input('Correo', sql.NVarChar, Correo)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .query(`INSERT INTO Usuarios (Nombre, ApellidoP, ApellidoM, Usuario, Password, Correo, Telefono, FechaNacimiento)
                    VALUES (@Nombre, @ApellidoP, @ApellidoM, @Usuario, @Password, @Correo, @Telefono, @FechaNacimiento)`);
        
        res.status(201).json({ mensaje: "Creado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar de SQL Server
router.delete('/:id', async (req, res) => {
    try {
        const pool = await conectarDB();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Usuarios WHERE id = @id');
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;