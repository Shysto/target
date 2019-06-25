// connexion à la base de données (similaire au fichier config en php)
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'web',
  password: 'motdepasse',
  database: 'target'
});

module.exports = {connection};
