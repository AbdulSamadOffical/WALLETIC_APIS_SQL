const { body } = require("express-validator");
const express = require("express");
const router = express.Router();
const authController = require("../Controllers/Auth");

router.post(
  "/verify/phone",
  body("phoneNo").trim().notEmpty().withMessage("Enter a valid phone number"),
  authController.verifyPhone
);

router.post(
  "/verify/code",
  body("phoneNo").trim().notEmpty().withMessage("Enter a valid phone number"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Enter a valid code")
    .custom((value) => {
      if (value.length != 4) {
        return Promise.reject("enter a 4 digit otp");
      }
      return true;
    }),
  authController.verifyCode
);

router.post(
  "/signup",
  body("fullname").trim().notEmpty().withMessage("fullname can not be empty"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email can not be empty")
    .normalizeEmail()
    .isEmail()
    .withMessage("email address is not valid"),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone No can not be empty")
    .custom((val) => {
      if (val.length !== 10) {
        return Promise.reject("PhoneNumber should be 10 digits long");
      }
      return true;
    }),
  body("password").trim().notEmpty().withMessage("Password can not be empty"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role can not be empty")
    .custom((value) => {
      const options = ["business", "consumer"];
      const result = options.some((option) => {
        return option === value;
      });
      if (!result) {
        return Promise.reject("Role should be either business or consumer");
      } else {
        return true;
      }
    }),
  authController.signUp
);

router.post(
  "/login",
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Your username cannot be empty"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Your password can not be empty"),
  authController.login
);

module.exports = router;
