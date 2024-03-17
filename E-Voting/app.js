import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";
import session from "express-session";
import jwt from "jsonwebtoken";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import connectDB from './config/db.js';


import Election from "./models/election.js";
import Nominator from "./models/nomination.js";
import User from "./models/user.js";
;
;
;
;

import uploadToCloudinary from './utils/cloudinaryUpload.js';
import { upload } from './utils/uploadImage.js';

const app = express();


dotenv.config();
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




app.get("/",(req,res)=>{
    res.render("index");


    const user = new User({
        u_id:uuidv4(),
    name:"Nanda",
    });

    // user.save();

});

app.get("/login",(req,res)=>{
   
    res.render("login");
})


// app.get("/home",asyncHandler(async(req,res)=>{
//     // Election.find({}).then((result)=>{
//         // console.log(result);
//         res.render("home",{data:result});
//     // })
// }));

app.get("/home", asyncHandler(async(req,res)=>{
    res.render("home");
})
);

app.get("/admin/:admin_id",(req,res)=>{
    
    
    // Nominator.find({}).then((result)=>{
        // console.log(result);
        User.find({u_id:req.params.admin_id}).then((admin)=>{
            console.log(admin);
            res.render("admin",{admin:admin[0]})
        })
    // })
});
app.get("/adminForm/:admin_id",(req,res)=>{
    
    
    Nominator.find({}).then((result)=>{
        // console.log(result);
        // User.find({u_id:req.params.admin_id}).then((admin)=>{
           +
            res.render("adminForm",{data:result,msg:"empty"})
       
        })
    // })
});



app.get("/users",(req,res)=>{
    
    
        User.find({isAdmin:{$exists:false}}).then((users)=>{

            res.render("users",{data:users})
        })
 
});


app.get("/nomination/:uid",(req,res)=>{
    // console.log(req.params.uid)
    User.find({u_id:req.params.uid}).then((user)=>{
            console.log(user);
        res.render("nominationForm",{user:user,msg:"empty"})
    }).catch((error)=>{
        console.log(error);
    })
});



app.get("/election/:eid/:uid",(req,res)=>{

    Election.find({u_id:req.params.eid}).then((result)=>{
        console.log(result[0].candidates);
        var list = [];
        result.map((candidate)=>{
            // console.log(candidate.candidates);
            candidate.candidates.map((one)=>{
                list.push(one.dno);
                // console.log(one.dno);
            })
        });
        console.log(list);
        Nominator.find({dno:list}).then((nominators)=>{
            console.log(nominators);
            res.render("singleElection",{data:result,user:req.params.uid,nominators:nominators,msg:"Empty"})
        })
    })

})

app.get("/voteCount",(req,res)=>{
    // int i = 0;
    var totalResult = [];
    var voteCount = [];
    Election.find({}).then((elections)=>{
        console.log(elections[0].candidates);
        console.log(elections[0].votes);
        res.render("voteCount",{elections:elections});
    });
});


app.post("/login",asyncHandler(async (req, res) => {
    // res.send("Hello")

    console.log("Logging");

    const username = req.body.username;
    const password = req.body.password;
    const user = new User({
      username: username,
      password: password,
    });
    
    
    req.login(user, async function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      } else {
        //   console.log("ebfurdsvrfre");
        await passport.authenticate("local")(req, res,  function () {
          var accessToken = jwt.sign({ user }, process.env.SECRETKEY, {expiresIn:"14m"});
        //   var refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRETKEY, {expiresIn:"10d"});
       
          
           User.findOne({ username: username }).then((currentUser)=>{
            // console.log(currentUser);

            // const electionData = await Election.find({});
            if(currentUser.isAdmin){
                res.redirect("/admin/"+currentUser.u_id);
            }else{

                Election.find({}).then((electionData)=>{
                    console.log(electionData);
                    res.render("home",{data:electionData,token:accessToken,user:currentUser});
                })
            }
            // res.json({token:accessToken});
          }).catch((error)=>{
            console.log(error);
          })
          
        });
      }
    });
  }));


app.get("/register",(req,res)=>{

    // console.log("hello")
    User.register(
        { u_id: uuidv4(), 
            // isAdmin:true,
            dno:"21ucs618",
            username:'dhanush'},
        'asdf',
        function (err, user) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          } else {
            passport.authenticate("local")(req, res, function () {
              jwt.sign({ user }, process.env.SECRETKEY, (err, token) => {
                res.json({ token: token, user: user });
              });
            });
          }
        }
      );
})

app.post("/home",(req,res)=>{
    console.log(req.body);
});


app.post("/voting/:eid/:uid",(req,res)=>{
   
    var selectedElection = req.body.electionType;
     const query = {
        $set:{}
        // $set:{selectedElection:true}
    };
   
    // query[`$set`] = { `selectedElection` : true }
    
    if(req.body.electionType==="class-rep"){
        selectedElection = "rep_election";
        query[`$set`] = { 'rep_election' : true }
    }
    else 
    if(req.body.electionType==="department-sec"){
        
        selectedElection = "sec_election";
        query[`$set`] = { 'sec_election' : true }
    }
    else 
    if(req.body.electionType==="stud-council"){
        
        selectedElection = "coun_election";
        query[`$set`] = { 'coun_election' : true }
    }
    else 
    if(req.body.electionType==="clg-chairman"){
        selectedElection = "chair_election";
        query[`$set`] = { 'chair_election' : true }
        
    }else{
        console.log("Nothing Matches")
    }

    // console.log(req.body.electionType);
    // console.log(String(selectedElection));
    
    User.findOne({u_id:req.params.uid}).then((user)=>{
        console.log(user);
        console.log(selectedElection);
        console.log(user[selectedElection]);
        
        Election.find({u_id:req.params.eid}).then((election)=>{
            if(user[selectedElection]){
                console.log("Already Voted raa Ambii");
                // res.json({msg:"Already Voted"})
                res.render("singleElection",{data:election,user:req.params.uid,msg:"already voted"});
        }else{

            Election.findOneAndUpdate({u_id:req.params.eid},
                { $push:{ votes: req.body.voting }},).then((result)=>{
                // console.log(result);
            });
            
            
            // console.log(query);
            
            User.findOneAndUpdate({u_id:req.params.uid},
                query,
                { new: true, useFindAndModify: false },).then((result2)=>{
                    // console.log(result2);
                }).catch((err)=>{
                    console.log(err);
                });
                // res.json({msg:"Voted"});

                    res.render("singleElection",{data:election,user:req.params.uid,msg:"voted"});
                }
            })
            
        })
    })
        
        

app.post("/nomination/:uid/:dno",upload.single("banner"),async(req,res)=>{
    // console.log(req.body);
    // console.log(req.params.uid);

    console.log("start");

    var locaFilePath = req.file.path;
    console.log(locaFilePath);
    var result = await uploadToCloudinary(locaFilePath);
  
    console.log(result);
  

    const nominator = new Nominator({
        u_id:req.params.uid,
        electionType:req.body.electionType,
        nominator_name:req.body.candidateName,
        banner_url:result.url,
        dno:req.params.dno,
    });

    console.log(nominator);
    nominator.save().then((result)=>{
        console.log(result);
        // res.json({msg:"Success"});
        User.find({u_id:req.params.uid}).then((user)=>{
            console.log(user);
            res.render("nominationForm",{user:user,msg:"success"})
        }).catch((error)=>{
            console.log((error));
        })
    }).catch((err)=>{
        console.log(err);
        })
})


app.post("/adminForm/electionUpload",(req,res)=>{
    console.log(req.body);


   var candidatesList = [];
   req.body.candidates.map((candidate)=>{
    // console.log(candidate.split("-")[0]);
    // console.log(candidate.split("-")[1]);
    candidatesList.push({
        "name":candidate.split("-")[0],
        "dno":candidate.split("-")[1],
    });
   });
//    console.log(candidatesList)
    const election = new Election({
        u_id:uuidv4(),
        electionType:req.body.electionType,
        candidates:candidatesList
    });

    console.log(election);

    election.save().then((result)=>{
        console.log(result);
        // res.json({msg:"Success"});
      
            res.render("adminForm",{data:result,msg:"success"})
       
    }).catch((err)=>{
        console.log(err);
        })
});


app.listen(3000,()=>{
    console.log("started at port 3000")
})



//   // int i = 0;
//   var totalResult = [];
//   var voteCount = [];
//   Election.find({}).then((elections)=>{
//       elections.map((election)=>{
//       var candidateLength = election.candidates.length;
//       for( var i = 0 ; i< candidateLength ;  i++ ){
//           voteCount[i] = {
//              no: "candidate" +  i,
//              name:election.candidates[i],
//              votes:0,
//           }
//       }
//       // console.log(voteCount);
//       // console.log(candidateLength)
//       election.votes.map((vote)=>{
//           // console.log(vote);
//           voteCount.map((count)=>{

//               if(vote === count.name){
//                   count.votes ++;
//               }
//           });
//       });
//   });
//   console.log(voteCount);
//       res.render("voteCount",{elections:elections,countedData:voteCount});
//   });