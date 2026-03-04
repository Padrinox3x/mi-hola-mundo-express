const express = require('express');
const router = express.Router();
const { sql, conectarDB } = require('../db');

/* =======================
   LISTAR (búsqueda + paginación)
======================= */
router.get('/', async (req, res) => {
    try {
        const buscar = req.query.buscar || '';
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);
        const offset = (page - 1) * limit;

        const pool = await conectarDB();

        const query = `
            SELECT *
            FROM Personal
            WHERE Nombre LIKE @buscar
               OR Nempleado LIKE @buscar
            ORDER BY Fecha DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS total
            FROM Personal
            WHERE Nombre LIKE @buscar
               OR Nempleado LIKE @buscar;
        `;

        const result = await pool.request()
            .input('buscar', sql.NVarChar, `%${buscar}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(query);

        res.json({
            data: result.recordsets[0],
            total: result.recordsets[1][0].total
        });

    } catch (error) {
        console.error('🔥 Error al listar personal:', error);
        res.status(500).json({ error: error.message });
    }
});

/* =======================
   CREAR
======================= */
router.post('/', async (req, res) => {
    try {
        const { Nombre, Apmaterno, Appaterno, Nempleado } = req.body;

        const pool = await conectarDB();

        await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Apmaterno', sql.NVarChar, Apmaterno)
            .input('Appaterno', sql.NVarChar, Appaterno)
            .input('Nempleado', sql.NVarChar, Nempleado)
            .query(`
                INSERT INTO Personal
                (Nombre, Apmaterno, Appaterno, Nempleado, Fecha)
                VALUES (@Nombre, @Apmaterno, @Appaterno, @Nempleado, GETDATE())
            `);

        res.json({ ok: true });

    } catch (error) {
        console.error('🔥 Error al crear personal:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

/* =======================
   ACTUALIZAR
======================= */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, Apmaterno, Appaterno, Nempleado } = req.body;

        const pool = await conectarDB();

        await pool.request()
            .input('Id', sql.Int, id)
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Apmaterno', sql.NVarChar, Apmaterno)
            .input('Appaterno', sql.NVarChar, Appaterno)
            .input('Nempleado', sql.NVarChar, Nempleado)
            .query(`
                UPDATE Personal
                SET Nombre = @Nombre,
                    Apmaterno = @Apmaterno,
                    Appaterno = @Appaterno,
                    Nempleado = @Nempleado
                WHERE Id = @Id
            `);

        res.json({ ok: true });

    } catch (error) {
        console.error('🔥 Error al actualizar personal:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

/* =======================
   ELIMINAR
======================= */
router.delete('/:id', async (req, res) => {
    try {
        const pool = await conectarDB();

        await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('DELETE FROM Personal WHERE Id = @Id');

        res.json({ ok: true });

    } catch (error) {
        console.error('🔥 Error al eliminar personal:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

module.exports = router;