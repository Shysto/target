// connexion à la base de données (similaire au fichier config en php)
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "8889",
    database: "target"
});

module.exports = { connection };