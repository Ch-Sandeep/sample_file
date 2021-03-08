require("dotenv").config();

const User = require("../models/userschema");

const jwt = require("jsonwebtoken");

async function authenticateToken(req, res, next) {
  // const authheader = req.headers["authorization"];
  //const token = authheader && authheader.split(" ")[1];
  const acctoken = req.cookies.jwt;
  try {
    const user = await User.findOne({ token: acctoken });
    if (user == undefined) {
      return res.send("Session expired.Please login again...");
    }
    if (acctoken == null) {
      return res.send("Something went wrong...");
    }
    jwt.verify(
      acctoken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decodeduser) => {
        if (err) {
          if (err.message == "jwt expired") {
            return res.send("Token expired.Please login again...");
          }
          return res.send(err.message);
        }
        req.user = decodeduser;
        req.dbuser = user;
        next();
      }
    );

    //console.log(token);
  } catch (err) {
    res.send(err.message);
  }
}

module.exports = authenticateToken;
