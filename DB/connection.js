const mysql = require("mysql2");

// Server: sql5.freemysqlhosting.net
// Name: sql5498470
// Username: sql5498470
// Password: 8QYBG97z2s
// Port number: 3306

// Create the connection pool. The pool-specific settings are the defaults

const pool = mysql.createPool({
  // host: process.env.HOST,
  // user: process.env.NAME,
  // database: process.env.NAME,
  // password: process.env.PASSWORD,
  host:'localhost',
  user: 'root',
  database:'walletic',
  password: 'karachi123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

});

pool.getConnection(function(err, conn) {
  
console.log(err)

})
module.exports = pool.promise();
