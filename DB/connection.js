const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.NAME,
  database: "walletic",
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

});





module.exports = pool.promise();
