const db = require("../DB/connection");

class User {
  constructor(fullname, phoneNumber, email, password, role) {
    this.fullname = fullname;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.password = password;
    this.role = role;
  }
  create() {
    let sql =
      "INSERT INTO user(fullname, phoneNo, email, password, role) VALUES (?,?,?,?,?)";
    return db.execute(sql, [
      this.fullname,
      this.phoneNumber,
      this.email,
      this.password,
      this.role,
    ]);
  }
  isUserExists() {
    let sql = "SELECT * FROM user WHERE email=? OR phoneNo=? LIMIT 1";
    return db.execute(sql, [this.email, this.phoneNumber]);
  }
  static isUserExists(username) {
    let sql = "SELECT * FROM user WHERE email=? OR phoneNo=? LIMIT 1";
    return db.execute(sql, [username, username]);
  }
}

module.exports = User;
