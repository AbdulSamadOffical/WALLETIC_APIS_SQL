const db = require("../DB/connection");
const mysql = require("mysql2/promise"); // creating manual connection connections due to transactions
const config = require("../config");
const res = require("express/lib/response");
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

  static async p2pHistory(user_id) {
    let query = "Select * from user as u join p2ptransaction as p2p on u.user_id = p2p.sender_id || u.user_id = p2p.reciver_id where u.user_id = ? order by id desc"
    let queryRes = await db.execute(query, [user_id]) 
    return queryRes[0];
  }

  static async bankTrxHistory(user_id) {
    let query =  "select * from transaction as t join banks as b on t.bank_account_id_fk = b.bank_account_id where t.walletic_account_id = ? order by transaction_id desc"
    let queryRes = await db.execute(query, [user_id]) 
    return queryRes[0] ;
  }


  static async qrTransactionModel(reciever_id, sender_id, invoiceAmt) {
    const connection = await mysql.createConnection(config);
    await connection.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await connection.beginTransaction();

    try{
      await Account.isWalleticAccountExist(reciever_id)
      await Account.isWalleticAccountExist(sender_id);

      const res = await connection.execute(
        "SELECT * FROM account WHERE account_id = ?",
        [sender_id]
      );
      console.log(res[0][0])

      if(res[0][0].balance < invoiceAmt) {
         throw new Error("balance insufficient"); 
      }

      await connection.execute(
        `UPDATE account SET balance = balance - ? WHERE account_id = ?`,
        [invoiceAmt, sender_id]
      );

      await connection.execute(
        `UPDATE account SET balance = balance + ? WHERE account_id = ?`,
        [invoiceAmt, reciever_id]
      );

      await connection.execute(
        `INSERT INTO p2ptransaction( amount, sender_id, reciver_id)
      VALUES( ? , ?, ?)`,
        [invoiceAmt, sender_id, reciever_id]
      );

      await connection.commit();

      await connection.end();

      return "success";
    
    } catch(err) {
      await connection.rollback();
      console.log("Rollback Successfull");
      console.log(err.message)
      // close the connection
      await connection.end();
      throw new Error(err.message);
    }
  }


  static userAccountInfo(user_id) {
    let sql =
      "SELECT fullname, phoneNo, email, role,balance, account.account_id FROM user JOIN  account on account.user_id_fk = user.user_id where user.user_id  = ?";
    return db.execute(sql, [user_id]);
  }

  static async user_verify(phoneNo) {
    let sql = "SELECT phoneNo, fullname, a.account_id from user as u join account as a on u.user_id = a.user_id_fk where u.phoneNo = ?";
    return db.execute(sql, [phoneNo])
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
        // walleticBalance = walleticBalance - amount;
        await connection.execute(
          `UPDATE account SET balance = balance - ? WHERE account_id = ?`,
          [amount, account_id]
        );

        // deposite money into bank

        await connection.execute(
          `UPDATE banks SET balance = balance + ? WHERE bank_account_id = ?`,
          [amount, bank_account_id]
        );

        await connection.execute(
          `INSERT INTO transaction(typeOfTransaction, amount, walletic_account_id, bank_account_id_fk)
        VALUES(?, ? , ?, ?)`,
          ["withdraw", amount, account_id, bank_account_id]
        );
        const [reciverBalance, field] = await connection.execute(
          "SELECT balance FROM banks WHERE bank_account_id = ?",
          [bank_account_id]
        );
        const [senderBalance, fields] = await connection.execute(
          "SELECT balance FROM account WHERE user_id_fk = ?",
          [account_id]
        );


        const balances = {
          walleticBalance: senderBalance[0],
          bankBalance: reciverBalance[0]
        }
        
        await connection.commit();
        console.log("Transaction completed Successfully!");
        // close the connection
        await connection.end();
        return balances;
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

  static deposite = async (account_id, amount, bank_account_id) => {
    const connection = await mysql.createConnection(config);
    await connection.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await connection.beginTransaction();
    console.log(account_id);

    try {
      // it will check does the bank account exists or not
      await Account.isBankAccountExists(bank_account_id);
      // it will check does the walletic account exist or not
      await Account.isWalleticAccountExist(account_id);

      await connection.execute(
        "UPDATE account SET balance = balance + ? WHERE account_id = ?",
        [amount, account_id]
      );

      const [bankRecord, fields] = await connection.execute(
        "SELECT * FROM banks WHERE bank_account_id = ?",
        [bank_account_id]
      );
      const bankBalance = bankRecord[0]?.balance;
      if (bankBalance >= amount) {
        await connection.execute(
          "UPDATE banks SET balance = balance - ? WHERE bank_account_id = ?",
          [amount, bank_account_id]
        );

        await connection.execute(
          `INSERT INTO transaction(typeOfTransaction, amount, walletic_account_id, bank_account_id_fk)
        VALUES(?, ? , ?, ?)`,
          ["deposit", amount, account_id, bank_account_id]
        );
        await connection.commit();
        await connection.end();
      } else {
        await connection.rollback();
        await connection.end();
        throw new Error("Unsufficient bank balance for this transaction");
      }
    } catch (err) {
      await connection.rollback();
      await connection.end();
      throw new Error(err);
    }
  };

  static isBankAccountExists = async (bank_account_id) => {
    const [bank_account, fields] = await db.execute(
      `SELECT * FROM banks WHERE bank_account_id = ?`,
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
