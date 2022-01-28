const Account = require("../Models/Account");
const db = require("../DB/connection");
const { validationResult } = require("express-validator");
const res = require("express/lib/response");
module.exports.accountInfo = async (req, res, next) => {
  const id = req.params.id;
  const result = parseInt(id);
  console.log(result, "result");

  if (result != "number") {
    // console.log(typeof result);
    return res.json({ error: "pass a valid request params in url" });
  }
  const [row, fields] = await Account.userAccountInfo(id);
  // console.log(row);
  const userInfo = row[0];
  res.json(userInfo);
};

module.exports.withdraw = async (req, res, next) => {
  const errors = validationResult(req);
  const values = errors.errors[0];
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: `${values.msg}` });
  }

  const walleticAccountNo = req.body.account_id;
  const bankAccountNo = req.body.bank_account_id;
  const amount = req.body.amount;
  let userid = 2;
  try {
    // await Account.withdraw(walleticAccountNo, amount, bankAccountNo);
    let io = require("../socket/socket").getIo();
    const socketInfo = require("../socket/activeClient").getClients(userid); // get the info from the client
    console.log(socketInfo);
    io.to(socketInfo?.socket_id).emit("data", { balance: 6000 }); // send the message to specfic user
    res.status(200).json({ message: "Transaction sucessfull" });
  } catch (err) {
    console.log("This transaction is failed!");
    return next(err);
  }
  // res.json({ message: "withdraw" });
};

module.exports.deposit = async (req, res, next) => {
  const errors = validationResult(req);
  const values = errors.errors[0];

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: `${values.msg}` });
  }

  const walleticAccountNo = req.body.account_id;
  const bankAccountNo = req.body.bank_account_id;
  const amount = req.body.amount;

  io.to(socket.id).emit("event", data);

  try {
    await Account.deposite(walleticAccountNo, amount, bankAccountNo);
    res.json({ message: "Amount deposited successfully" });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

module.exports.bank = async (req, res) => {
  const [banks, fields] = await db.execute("SELECT * FROM banks");
  res.json(banks);
};

module.exports.account = async (req, res) => {
  const [accounts, fields] = await db.execute("SELECT * FROM account");
  res.json(accounts);
};

module.exports.transaction = async (req, res) => {
  const [transaction, fields] = await db.execute("SELECT * FROM transaction");
  res.json(transaction);
};
