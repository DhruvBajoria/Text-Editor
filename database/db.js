import mongoose from "mongoose";
 
const Connection = async(URL)=>{
    try{
        await mongoose.connect(URL);
        console.log("successfully connected to database");
    } catch(error){
        console.log("Error while connecting to database", error);
    }
}
export default Connection;