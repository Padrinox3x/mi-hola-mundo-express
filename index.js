const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { sql, conectarDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Middlewares
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// =======================
// Conexión a SQL Server (SOMEE)
// =======================
(async () => {
    try {
        await conectarDB();
        console.log('✅ Conectado a SQL Server (SOMEE)');
    } catch (err) {
        console.error('❌ Error al conectar a la DB:', err.message);
        process.exit(1); // ⛔ corta el servidor si no conecta
    }
})();

// =======================
// Rutas
// =======================

// Página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta de prueba
app.get('/test-db', async (req, res) => {
    try {
        const result = await sql.query`SELECT GETDATE() AS Fecha`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Formulario
app.get('/formulario', (req, res) => {
    res.sendFile(__dirname + '/public/formulario.html');
});

// =======================
// Verificación reCAPTCHA
// =======================
app.post('/verificar', async (req, res, next) => {
    try {
        const token = req.body['g-recaptcha-response'];
        const nombre = req.body.nombre?.trim();
        const secretKey = process.env.RECAPTCHA_SECRET;

        // Validaciones
        if (!nombre) {
            return res.status(400).send(`
                <h1>❌ Nombre inválido</h1>
                <a href="/">Volver</a>
            `);
        }

        if (!token) {
            return res.status(400).send(`
                <h1>❌ reCAPTCHA obligatorio</h1>
                <a href="/">Volver</a>
            `);
        }

        // Verificar reCAPTCHA
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        if (!response.data.success) {
            return res.status(400).send(`
                <h1>❌ Falló la verificación</h1>
                <a href="/">Volver</a>
            `);
        }

        // Guardar en SOMEE (SQL Server)
        await sql.query`
            INSERT INTO Verificaciones (Nombre, Fecha)
            VALUES (${nombre}, GETDATE())
        `;

        res.send(`
            <h1>✅ Verificación correcta</h1>
            <p>Hola <strong>${nombre}</strong></p>
            <a href="/">Volver</a>
        `);

    } catch (error) {
        next(error);
    }
});

// =======================
// Carrusel (desde SOMEE)
// =======================
app.get('/carrusel', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT Titulo, UrlImagen
            FROM CarruselImagenes
            WHERE Activo = 1
        `);

        res.render('Carrusel', {
            imagenes: result.recordset
        });

    } catch (error) {
        console.error('❌ Error carrusel:', error);
        res.status(500).sendFile(__dirname + '/public/500.html');
    }
});

// =======================
// 404
// =======================
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// =======================
// 500
// =======================
app.use((err, req, res, next) => {
    console.error('💥 Error:', err);
    res.status(500).sendFile(__dirname + '/public/500.html');
});

// =======================
// Servidor
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
