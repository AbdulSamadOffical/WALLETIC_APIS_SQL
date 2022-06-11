const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const accountController = require("../Controllers/Account");
const auth = require('../Middleware/Authorization')
router.post("/user/:id", auth,accountController.accountInfo);
router.post(
  "/withdraw",
  body("account_id")
    .notEmpty()
    .withMessage("Invalid walletic account_id/accountno"),
  body("bank_account_id")
    .notEmpty()
    .withMessage("Invalid bank_account_id/accountno"),
  body("amount")
    .notEmpty()
    .withMessage("Enter a amount less than 500 ")
    .custom((value) => {
      if (value > 500 || value < 1) {
        return Promise.reject("Minimum transaction amount is 500 Rs");
      } else if (typeof value != "number") {
        return Promise.reject("Amount should be in integer type");
      }
      return true;
    }),
  accountController.withdraw
);

router.post(
  "/deposit",
  body("account_id")
    .notEmpty()
    .withMessage("Invalid walletic account_id/accountno"),
  body("bank_account_id")
    .notEmpty()
    .withMessage("Invalid bank_account_id/accountno"),
  body("amount")
    .notEmpty()
    .withMessage("Enter a amount less than 500 ")
    .custom((value) => {
      if (value > 500 || value < 1) {
        return Promise.reject("Minimum transaction amount is 500 Rs");
      } else if (typeof value != "number") {
        return Promise.reject("Amount should be in integer type");
      }
      return true;
    }),
  accountController.deposit
);

router.get("/bank", accountController.bank);
router.get("/account", accountController.account);
router.get("/transaction", accountController.transaction);
module.exports = router;
