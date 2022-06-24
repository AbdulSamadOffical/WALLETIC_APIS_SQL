const Account = require("../Models/Account");
const db = require("../DB/connection");
const { validationResult } = require("express-validator");
const res = require("express/lib/response");
const pusher = require('../socket/pusher');

module.exports.accountInfo = async (req, res, next) => {
  const id = req.params.id;
  const result = parseInt(id);
  console.log(typeof (typeof result) , "result");

  if (typeof result != 'number') {
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
  let userid = 1;
  try {
   const balances = await Account.withdraw(walleticAccountNo, amount, bankAccountNo);
   //data pusher for sender 
    pusher(walleticAccountNo,balances?.walleticBalance?.balance )
    // data pusher for reciever

    pusher(bankAccountNo, balances?.bankBalance?.balance)
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

//  wallet to wallect transaction
module.exports.p2pHistoryController = async(req, res) => {
  try {
    const p2pHistory = await Account.p2pHistory(req.params.user_id)
    res.status(200).json(p2pHistory);
  } catch(err) {
    res.status(400).send(err.message);
  }
}

// bank to wallet transaction
module.exports.bankTrxHistoryController = async(req, res) => {
  try {
    const transaction = await Account.bankTrxHistory(req.params.user_id);
    res.status(200).json(transaction);
  } catch(err) {
    res.status(400).send(err.message);
  }
}

module.exports.accountVerifyController = async(req, res) => {
  const queryRes = await Account.userAccountInfo(req.params.user_id);
    if(queryRes.length == 0) {
      res.status(400).json({message: "user not found"});
    } else {
      res.status(200).json({message: "user exist", data: queryRes});
  }
}

module.exports.qrTrxController = async (req, res) => {
  const user_id = 1;
  const data = req.body.data
  try{
  const balances = await Account.qrTransactionModel(data.reciever_id, data.sender_id, data.amount);
  // const [accountRecord, fields] = await Account.userAccountInfo(data.sender_id);
  // console.log(accountRecord, 'data')
  // let io = require("../socket/socket").getIo();
  // const socketInfo = require("../socket/activeClient").getClients(user_id); // get the info from the client
  // console.log(socketInfo);
  // io.to(socketInfo?.socket_id).emit("data", { balance: accountRecord[0]?.balance });
     //data pusher for sender 
     pusher(data.reciever_id,balances?.reciverBalance?.balance )
     // data pusher for sender
 
     pusher(data.sender_id, balances?.walleticBalance_sender?.balance)
  res.status(200).json({message: "success", data: "sucess"});
} 
  catch(err) {
    res.status(400).json({message: err.message, status: 400});
  }
}

module.exports.userVerifyController = async(req, res) => {
  const phoneNo = req.params.phoneNo;
  const userData = await Account.user_verify(phoneNo);
  if(userData[0].length > 0) {
    res.status(200).json({message: "success", data: userData[0][0]})
  } else {
    res.status(400).json({message: "user doesnot exist"})
  };
}

