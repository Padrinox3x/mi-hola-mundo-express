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

// =======================
// Conexión a SQL Server
// =======================
(async () => {
    try {
        await conectarDB();
        console.log('✅ Conectado a SQL Server');
    } catch (err) {
        console.error('❌ Error al conectar a la DB:', err);
    }
})();

// =======================
// Rutas
// =======================

// Página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta de prueba de error
app.get('/error-test', (req, res) => {
    throw new Error('Error de prueba');
});

// Verificación reCAPTCHA
app.post('/verificar', async (req, res, next) => {
    try {
        const token = req.body['g-recaptcha-response'];
        const nombre = req.body.nombre?.trim();

        const secretKey = process.env.RECAPTCHA_SECRET;

        // Validaciones
        if (!nombre) {
            return res.status(400).send(`
                <h1>❌ Nombre inválido</h1>
                <p>El nombre es obligatorio.</p>
                <a href="/">Volver</a>
            `);
        }

        if (!token) {
            return res.status(400).send(`
                <h1>❌ Verificación incompleta</h1>
                <p>Marca la casilla "No soy un robot".</p>
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
                <h1>❌ Error de verificación</h1>
                <p>Inténtalo de nuevo.</p>
                <a href="/">Volver</a>
            `);
        }

        // Guardar en SQL Server
        await sql.query`
            INSERT INTO Verificaciones (Nombre, Fecha)
            VALUES (${nombre}, GETDATE())
        `;

        res.send(`
            <h1>✅ Verificación correcta</h1>
            <p>Hola <strong>${nombre}</strong>, el sistema confirma que eres humano.</p>
            <a href="/">Volver</a>
        `);

    } catch (error) {
        next(error);
    }
});

// =======================
// 404 - Página no encontrada
// =======================
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// =======================
// 500 - Error del servidor
// =======================
app.use((err, req, res, next) => {
    console.error('💥 Error:', err);
    res.status(500).sendFile(__dirname + '/public/500.html');
});

// =======================
// Levantar servidor
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
