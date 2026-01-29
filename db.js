const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // EjemploExpress.mssql.somee.com
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

let pool;

async function conectarDB() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = {
    sql,
    conectarDB
};
