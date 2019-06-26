/*************************************************************************/
/*    YOU MUST CHANGE THIS FILE ACCORDING TO YOUR OWN DATABASE SERVER    */
/*           CHANGE FIELDS user, password, port and database             */
/*************************************************************************/

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "web",
    password: "motdepasse",
    database: "target"
});

module.exports = { connection };