const db = require("../DB/connection");
const mysql = require("mysql2/promise"); // creating manual connection connections due to transactions
const config = require("../config");
// console.log(config);
class Account {
  constructor(user_id, balance) {
    this.user_id = user_id;
    this.balance = balance;
  }

  createAccount() {
    let sql = "INSERT INTO account(user_id_fk, balance) VALUES (?,?)";
    return db.execute(sql, [this.user_id, this.balance]);
  }

  static userAccountInfo(user_id) {
    let sql =
      "SELECT fullname, phoneNo, email, role,balance, account.account_id FROM user JOIN  account on account.user_id_fk = user.user_id where user.user_id  = ?";
    return db.execute(sql, [user_id]);
  }

  static withdraw = async (account_id, amount, bank_account_id) => {
    const connection = await mysql.createConnection(config);
    await connection.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await connection.beginTransaction();

    try {
      // it will check does the bank account exists or not
      await Account.isBankAccountExists(bank_account_id);
      // it will check does the walletic account exist or not
      await Account.isWalleticAccountExist(account_id);
      const [walleticAccount, fields] = await connection.execute(
        "SELECT * FROM account WHERE account_id = ?",
        [account_id]
      );
      let walleticBalance = walleticAccount[0]?.balance;

      if (walleticBalance >= amount) {
        // deduct money from walletic account
        walleticBalance = walleticBalance - amount;
        await connection.execute(
          `UPDATE account SET balance = ? WHERE account_id = ?`,
          [walleticBalance, account_id]
        );

        // deposite money into bank
        let [bank_account, fields] = await connection.execute(
          `SELECT * FROM banks WHERE bank_account_id = ?`,
          [bank_account_id]
        );
        // console.log(bank_account);
        let bank_account_balance = bank_account[0]?.balance;
        bank_account_balance = bank_account_balance + amount;
        await connection.execute(
          `UPDATE banks SET balance = ? WHERE bank_account_id = ?`,
          [bank_account_balance, bank_account_id]
        );

        await connection.execute(
          `INSERT INTO transaction(typeOfTransaction, amount, walletic_account_id, bank_account_id_fk)
        VALUES(?, ? , ?, ?)`,
          ["withdraw", amount, account_id, bank_account_id]
        );
        await connection.commit();
        console.log("Transaction completed Successfully!");
        // close the connection
        await connection.end();
      } else {
        await connection.rollback();
        console.log("Rollback Successfull");
        // close the connection
        await connection.end();
        throw new Error("Unsufficient balance for this transaction");
      }
    } catch (err) {
      await connection.rollback();
      console.log("Rollback Successfull");
      // close the connection
      await connection.end();
      throw new Error(err.message);
    }
  };

  static isBankAccountExists = async (bank_account_id) => {
    const [bank_account, fields] = await db.execute(
      `SELECT * FROM bank WHERE bank_account_id = ?`,
      [bank_account_id]
    );
    if (bank_account.length < 1) {
      throw new Error("This Bank account doesn't exists");
    }
    if (bank_account_id != bank_account[0]?.bank_account_id) {
      throw new Error("This Bank account doesn't exists");
    }
  };
  static isWalleticAccountExist = async (walletic_account_id) => {
    const [walletic_account, fields] = await db.execute(
      `SELECT * FROM account WHERE account_id = ?`,
      [walletic_account_id]
    );
    if (walletic_account.length < 1) {
      throw new Error("This Walletic account doesnot exist");
    }
    if (walletic_account_id != walletic_account[0]?.account_id) {
      throw new Error("This Walletic account doesnot exist");
    }
  };
}

module.exports = Account;
