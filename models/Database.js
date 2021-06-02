require('dotenv').config();
const mysql = require('mysql');

exports.conn = function conn() {
  let conn = mysql.createConnection({
    host     : process.env["DB_HOST"],
    user     : process.env["DB_USERNAME"],
    password : process.env["DB_PASSWORD"],
    database : process.env["DB_DATABASE"],
  });

  return conn;
};
