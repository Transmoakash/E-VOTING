import mongoose from 'mongoose';


const nominationSchema = new mongoose.Schema({
    u_id:String,
    electionType:String,
    nominator_name:String,
    banner_url:String,
    dno:String,
  });



  const Nominator = new mongoose.model("Nominator",nominationSchema);

  export default Nominator;