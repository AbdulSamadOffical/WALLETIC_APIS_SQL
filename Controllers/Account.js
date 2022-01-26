const Account = require("../Models/Account");
const { validationResult } = require("express-validator");
module.exports.accountInfo = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const [row, fields] = await Account.userAccountInfo(id);
  console.log(row);
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

  try {
    await Account.withdraw(walleticAccountNo, amount, bankAccountNo);
    res.status(200).json({ message: "Transaction sucessfull" });
  } catch (err) {
    console.log("This transaction is failed!");
    return next(err);
  }
  // res.json({ message: "withdraw" });
};
