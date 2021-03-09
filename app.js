require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const userfun = require("./controllers/user");

const cookieParser = require("cookie-parser");

const taskfun = require("./controllers/task");

const multer = require("multer");

const https = require("https");

const fs = require("fs");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const authenticateToken = require("./middleware/authorization");

const app = express();

const path = require("path");

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use(cors());

app.use(cookieParser());

app.set("views", path.join(__dirname, "/views"));

app.set("view engine", "hbs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

mongoose
  .connect("mongodb://localhost:27017/usersdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Mydb connected successfully...");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home",authenticateToken, (req, res) => {
  res.render("home");
});

app.post("/signup", upload.single("image"), userfun.signup);

app.post("/login", userfun.login);

app.get("/listusers", authenticateToken, userfun.listusers);

app.get("/getuser",authenticateToken,(req,res)=>{
  res.render("getuser")
})

app.get("/updateuser",authenticateToken,(req,res)=>{
  res.render("updateuser")
})

app.get("/deleteuser",authenticateToken,(req,res)=>{
  res.render("deleteuser")
})

app.get("/logout",authenticateToken,(req,res)=>{
  res.render("logout")
})

app.post("/getuser", authenticateToken, userfun.getuser);

app.patch("/updateuser", authenticateToken, userfun.updateuser);

app.post("/deleteuser", authenticateToken, userfun.deleteuser);

app.post("/logout", authenticateToken, userfun.logout);

//...........CRUD OPERATIONS ON TASK................

app.get("/createtask",authenticateToken,(req,res)=>{
  res.render("createtask")
})

app.post("/createtask", authenticateToken, taskfun.createtask);

app.get("/listtasks", authenticateToken, taskfun.listtasks);

app.get("/gettask",authenticateToken,(req,res)=>{
  res.render("gettask")
})

app.post("/gettask", authenticateToken, taskfun.gettask);

app.get("/updatetask",authenticateToken,(req,res)=>{
  res.render("updatetask")
})

app.post("/updatetask", authenticateToken, taskfun.updatetask);

app.get("/deletetask",authenticateToken,(req,res)=>{
  res.render("deletetask")
})

app.post("/deletetask", authenticateToken, taskfun.deletetask);

app.get("*", (req, res) => {
  res.sendStatus(404);
});

const port = process.env.PORT || 4000;

https.createServer(options, app).listen(port);

module.exports=app;