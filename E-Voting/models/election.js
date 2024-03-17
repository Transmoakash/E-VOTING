import mongoose from 'mongoose';


const electionSchema = new mongoose.Schema({
    u_id:String,
    electionType:String,
    candidates:[
      {

        name:String,
        dno:String,
      }
    ],
    votes:Array,
  });



  const Election = new mongoose.model("Election",electionSchema);

  export default Election;