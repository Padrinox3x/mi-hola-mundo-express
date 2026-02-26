const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { sql, conectarDB } = require('./db');
const upload = require('./middlewares/upload');
const cloudinary = require('./config/cloudinary');
const personalRoutes = require('./routes/personal.routes');
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
app.use('/api/formulario', require('./routes/formulario'));
app.use('/api/personal', personalRoutes);
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

//CRUD
// Vista del CRUD de Personal
app.get('/personal', (req, res) => {
    res.render('personal');
});

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
        const pool = await conectarDB();

        const result = await pool.request().query(`
            SELECT Titulo, UrlImagen
            FROM dbo.ImagenesCarrusel
            WHERE Activo = 1
        `);

        res.render('carrusel', {
            imagenes: result.recordset
        });

    } catch (error) {
        console.error('🔥 ERROR REAL:', error);
        res.status(500).send(error.message);
    }
});

// =======================
// Subir a Somme el formulario 
// =======================

app.post('/formulario', async (req, res) => {
    try {
        const {
            Nombre,
            ApellidoP,
            ApellidoM,
            Usuario,
            Password,
            Correo,
            Telefono,
            FechaNacimiento
        } = req.body;

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
            .query(`
                INSERT INTO Usuarios
                (Nombre, ApellidoP, ApellidoM, Usuario, Password, Correo, Telefono, FechaNacimiento)
                VALUES
                (@Nombre, @ApellidoP, @ApellidoM, @Usuario, @Password, @Correo, @Telefono, @FechaNacimiento)
            `);

        res.send(`
            <h1>✅ Registro guardado</h1>
            <a href="/">Volver</a>
        `);

    } catch (error) {
        console.error('🔥 Error al guardar:', error);
        res.status(500).send('Error al guardar datos');
    }
});


// =======================
// Subir imagen al carrusel (Cloudinary)
// =======================
app.post(
    '/carrusel/upload',
    upload.single('imagen'),
    async (req, res) => {
        try {
            const { titulo } = req.body;

            if (!req.file) {
                return res.status(400).send('❌ No se subió ninguna imagen');
            }

            // Convertir buffer a base64
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            // Subir a Cloudinary
            const result = await cloudinary.uploader.upload(base64Image, {
                folder: 'carrusel'
            });

            const pool = await conectarDB();

            await pool.request()
                .input('Titulo', sql.NVarChar, titulo)
                .input('UrlImagen', sql.NVarChar, result.secure_url)
                .query(`
                    INSERT INTO dbo.ImagenesCarrusel (Titulo, UrlImagen, Activo)
                    VALUES (@Titulo, @UrlImagen, 1)
                `);

            res.redirect('/carrusel');

        } catch (error) {
            console.error('🔥 Error al subir imagen a Cloudinary:', error);
            res.status(500).send('Error al subir imagen');
        }
    }
);

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
