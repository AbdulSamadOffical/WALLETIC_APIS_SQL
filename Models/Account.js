const db = require("../DB/connection");
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
      "SELECT fullname, phoneNo, email, role, account.account_id FROM user JOIN  account on account.user_id_fk = user.user_id where user.user_id  = ?";
    return db.execute(sql, [user_id]);
  }
  static withdraw = async (account_id, amount, bank_account_id) => {
    try {
      const [walleticAccount, fields] = await db.execute(
        "SELECT * FROM account WHERE account_id = ?",
        [account_id]
      );
      let walleticBalance = walleticAccount[0]?.balance;

      if (walleticBalance >= amount) {
        // deduct money from walletic account
        walleticBalance = walleticBalance - amount;
        await db.execute(
          `UPDATE account SET balance = ? WHERE account_id = ?`,
          [walleticBalance, account_id]
        );

        // deposite money into bank
        let [bank_account, fields] = await db.execute(
          `SELECT * FROM banks WHERE bank_account_id = ?`,
          [bank_account_id]
        );
        // console.log(bank_account);
        let bank_account_balance = bank_account[0]?.balance;
        bank_account_balance = bank_account_balance + amount;
        await db.execute(
          `UPDATE banks SET balance = ? WHERE bank_account_id = ?`,
          [bank_account_balance, bank_account_id]
        );
        console.log("Transaction completed Successfully!");
      } else {
        throw new Error("Unsufficient balance for this transaction");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };
}

module.exports = Account;
