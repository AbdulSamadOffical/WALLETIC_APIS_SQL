const express = require("express");
const router = express.Router();
const accountController = require("../Controllers/Account");
router.get("/user/:id", accountController.accountInfo);
router.post("/withdraw", accountController.withdraw);

module.exports = router;
