const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // sql.somee.com
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

const conectarDB = async () => {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
};

module.exports = {
    sql,
    conectarDB
};
