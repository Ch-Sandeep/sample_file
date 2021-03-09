const bcrypt = require("bcryptjs");
const User = require("../models/userschema");
const Task = require("../models/tasks");
const jwt = require("jsonwebtoken");

module.exports.signup = async (req, res) => {
  let img;
  if (req.file == undefined) {
    img = null;
  } else {
    img = req.file.path;
  }
  if (req.body.password.length == 0) {
    return res.send("Password cannot be empty...");
  }
  if (req.body.password.toLowerCase().includes("password")) {
    return res.send("Password cannot contain 'password'!!");
  }
  if (req.body.password.length < 7) {
    return res.send("password should be atleast 7 characters...");
  }
  try {
    const hashedpass = await bcrypt.hash(req.body.password, 10);
    const newuser = {
      name: req.body.name,
      age: req.body.age,
      email: req.body.email,
      username: req.body.username,
      password: hashedpass,
      image: img,
    };
    const fetchuser = await User.findOne({ username: req.body.username });
    if (fetchuser != null) {
      return res.send("User already exists.please login...");
    } else {
      const userdata = User(newuser);
      await userdata.save();
      res.redirect("/login");
    }
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.login = async (req, res) => {
  try {
    const fetchuser = await User.findOne({ username: req.body.username });
    //console.log(fetchuser);
    if (fetchuser == null) {
      return res.send("No User exists.Please signup...");
    }
    if (await bcrypt.compare(req.body.password, fetchuser.password)) {
      const loginuser = {
        username: req.body.username,
        password: req.body.password,
      };
      const accesstoken = jwt.sign(loginuser, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "50m",
      });
      await User.updateOne(
        { username: req.body.username },
        { $set: { token: accesstoken } }
      );
      res.cookie("jwt", accesstoken, {
        expires: new Date(Date.now() + 3000000),
        httpOnly: true,
      });
      res.redirect("/home");
    } else {
      res.send("Wrong password...");
    }
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.listusers = async (req, res) => {
  const allusers = [];
  try {
    const users = await User.find();
    for (user of users) {
      const nuser = {
        name: user.name,
        age: user.age,
        email: user.email,
        username: user.username,
      };
      allusers.push(nuser);
    }
    res.json(allusers);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.getuser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
      return res.send("No User exists with the given username...");
    }
    const requser = {
      name: user.name,
      age: user.age,
      email: user.email,
      username: user.username,
    };
    res.json(requser);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.updateuser = async (req, res) => {
  if (req.body.password != undefined) {
    if (req.body.password.length == 0) {
      return res.send("password cannot be empty...");
    }
    if (req.body.password.toLowerCase().includes("password")) {
      return res.send("Password cannot contain 'password'!!");
    }
    const npass = await bcrypt.hash(req.body.password, 10);
    await User.updateOne(
      { username: req.dbuser.username },
      { $set: { password: npass } }
    );
  }
  try {
    const user = req.dbuser;
    Object.keys(req.body).forEach(async (element) => {
      if (element != "password") {
        user[element] = req.body[element];
      }
    });
    await user.save();
    res.send("User updated successfully...");
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.deleteuser = async (req, res) => {
  try {
    const u = await User.findOne({ username: req.dbuser.username });
    await User.deleteOne({ username: req.dbuser.username });
    await Task.deleteMany({ owner: u._id });
    res.send("User and tasks related to him are deleted successfully...");
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.logout = async (req, res) => {
  try {
    const pruser = await User.findOne({ username: req.dbuser.username });
    if (pruser.token != undefined) {
      await User.updateOne(
        { username: pruser.username },
        { $set: { token: undefined } }
      );
      req.cookies.jwt= null;
      res.redirect("/login");
    } else {
      res.send("User already logged out...");
    }
  } catch (err) {
    res.send(err.message);
  }
};
