const request  = require("supertest");
const app = require("./app");
const User= require("./models/userschema");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
describe("Signup For User",()=>{
    afterEach(async()=>{
        await User.deleteOne({username:"new user"})
    })
    test("Signup for user",async()=>{
        await request(app).post('/signup')
        .send({
            username:"new user",
            email:"newuser1234@gmail.com",
            password:"newuser123",
            name:"user for testing",
            age:20
        }).expect(200);
    })
})
describe("Login For User",()=>{
    beforeEach(async () => {
        try{
        const user = new User();
        user.Username= "rambo"
        user.Password = bcrypt.hashSync("rambo123", 10);
        user.Email="rambo1234@gmail.com"
        user.Name="Rambo"
        user._id=mongoose.Types.ObjectId();
      await user.save();
    }
    catch(err){
        console.log(err.message);
    }
  });
  afterEach(async()=>{
    await User.deleteOne({Username:"rambo"})
})
    test("Login for user",async()=>{
        await request(app).post("/login")
        .send({
            Username:"rambo",
            Password:"rambo123"
        })
        .expect(200);
    })
})