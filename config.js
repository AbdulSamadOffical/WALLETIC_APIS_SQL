module.exports = {
  host: process.env.HOST,
  user: process.env.NAME,
  database: process.env.NAME,
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
