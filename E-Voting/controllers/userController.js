import express from "express";
import path,{dirname} from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from '../config/db.js'
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import session from "express-session";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";


import Nominator from "../models/nomination.js";
import Election from "../models/election.js";
import User from "../models/user.js";


const app = express();


dotenv.config()
connectDB();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));


app.use(express.json());

app.use(passport.initialize());
app.use(session({
    secret:process.env.SECRETKEY ,
    resave:false,
    saveUninitialized:false
  }));
app.use(passport.session());


const handleLogin = asyncHandler(async(req,res)=>{

    try{

        const username = req.body.username;
        const password = req.body.password;
        const user = new User({
      username: username,
      password: password,
    });

    // console.log(user);
    var token;
    var currentUser;
    
 req.login(user, function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      } else {
        passport.authenticate("local")(req, res, function () {
            
            jwt.sign({ user }, process.env.SECRETKEY, (err, token) => {
                // console.log(token);
                token = token;
                 currentUser = User.findOne({ username: username })
                
                // console.log(currentUser);
              });
            });
          }
        });
        console.log(currentUser)
        const electionData = await Election.find({});
        res.render("home",{data:electionData,token:token,user:currentUser});
      }catch(err){
        console.log(err)
};
})


export {handleLogin};