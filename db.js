const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const conectarDB = async () => {
    try {
        await sql.connect(config);
        console.log('✅ Conectado a SQL Server');
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
    }
};

module.exports = { sql, conectarDB };
