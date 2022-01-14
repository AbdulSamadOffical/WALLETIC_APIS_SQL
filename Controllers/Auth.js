const { validationResult } = require("express-validator");
require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const Account = require("../Models/Account");
var jwt = require("jsonwebtoken");
const saltRounds = 10;

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

// verify phone number
module.exports.verifyPhone = (req, res, next) => {
  const phoneNo = req?.body?.phoneNo;
  const errors = validationResult(req);
  const values = errors.errors[0];

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: `${values.msg}` });
  }

  client.verify
    .services(process.env.SERVICE_ID)
    .verifications.create({
      to: phoneNo,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send({
        message: "Verification is sent!!",
        data,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong!");
      return next(error);
    });
};

//verify code
module.exports.verifyCode = (req, res, next) => {
  console.log("reached");
  const phoneNo = req?.body?.phoneNo;
  const code = req?.body?.code;
  const errors = validationResult(req);
  const values = errors.errors[0];

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: `${values.msg}` });
  }

  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({ to: phoneNo, code: code })
    .then((verification_check) => {
      res.status(200).send({
        verification_check,
      });
    })
    .catch((err) => {
      const error = new Error("Something went wrong!");
      return next(error);
    });
};
module.exports.signUp = async (req, res, next) => {
  try {
    const fullname = req.body.fullname;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const errors = validationResult(req);
    const values = errors.errors[0];

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: `${values.msg}` });
    }
    // generating hash password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    const user = new User(fullname, phoneNumber, email, hash, role);

    // isUser already exist
    const [users, fields] = await user.isUserExists();
    if (users.length >= 1) {
      return res
        .status(400)
        .json({ error: "User already exists with this email/phoneno" });
    }
    // create user
    const [newUser] = await user.create();
    const userId = newUser.insertId;
    let token = jwt.sign({ id: userId }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const info = jwt.verify(token, process.env.TOKEN_SECRET);
    // default 50 rupees balance
    const account = new Account(userId, 50);
    const [accountInfo] = await account.createAccount();
    console.log(accountInfo);
    return res.status(200).json({
      message: "User created successfully",
      token: token,
      exp: info.exp,
      user_id: info.id,
    });
  } catch (err) {
    console.log(err.message);
    return next(err);
  }
};

module.exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = validationResult(req);
  const values = errors.errors[0];

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: `${values.msg}` });
  }
  try {
    // isUser already exist
    const [users, fields] = await User.isUserExists(username);
    if (users.length == 1) {
      const isValidPass = bcrypt.compareSync(password, users[0]?.password);
      if (!isValidPass) {
        return res.status(400).json({ error: "your password is not matched" });
      } else {
        let token = jwt.sign(
          { id: users[0]?.user_id },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "1h",
          }
        );
        const info = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(info, "login");
        return res.status(200).json({
          message: "loggedin successfully",
          token: token,
          exp: info.exp,
          user_id: info.id,
        });
      }
    }
  } catch (err) {
    return next(err);
  }
};
