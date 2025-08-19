const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // or your MySQL password
  database: 'pet_adoption'
});
module.exports = db;
