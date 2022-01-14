const Account = require("../Models/Account");

module.exports.accountInfo = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const [row, fields] = await Account.userAccountInfo(id);
  console.log(row);
  const userInfo = row[0];
  res.json(userInfo);
};

module.exports.withdraw = async (req, res, next) => {
  try {
    await Account.withdraw(1, 100, 2);
  } catch (err) {
    console.log(err.message);
  }
  res.json({ message: "withdraw" });
};
