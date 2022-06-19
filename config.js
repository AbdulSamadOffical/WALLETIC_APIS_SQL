module.exports = {
  host: process.env.HOST,
  user: process.env.NAME,
  database: "walletic",
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
