//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
const bcrypt =require("bcrypt");
const saltRounds=8;

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});

const userSchema= new mongoose.Schema({
  email:String,
  password:String
});


const User=new mongoose.model("user",userSchema)

app.get("/",function(req,res){
  res.render("home");
});

app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  User.findOne(
    {email:username},
    function(err,foundUser){
      if(!err){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result){
            res.render("secrets");
          }
        });
      }
      else{
          console.log(err);
      }
    });
});
app.route("/register")
.get(function(req,res){
  res.render("register",{alreadyExists:""});
})
.post(function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({email:username},function(err,foundUser){
    if(foundUser){
      res.render("register",{alreadyExists:"This email is already registered. Please try logging in instead."})
    }
    else{
      bcrypt.hash(password, saltRounds, function(err, hash) {
        const newUser=new User({
          email:username,
          password:hash
        });
        newUser.save(function(err){
          if(err){
            console.log(err);
          }
          else{
            res.render("secrets");
          }
        });
      });
    }
  });
});

app.listen(3000,()=>{
  console.log("Server up and running on port 3000.");
})
