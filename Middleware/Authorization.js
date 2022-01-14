var jwt = require("jsonwebtoken");
// this middleware will denied the access for protected routes if token is not given
module.exports = (req, res, next) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ message: "Access Denied" });
  }
  try {
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error("Something went wrong or Your token is invalid");
    return next(error);
  }
};
