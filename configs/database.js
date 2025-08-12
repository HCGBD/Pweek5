const mongo = require("mongoose")
require("dotenv").config();


const  connectDb = async ()=>{
    try {
        mongo.connect(process.env.MONGO_URL)
        console.log("DB connect");
        
    } catch (error) {
        console.log(error);
        
    }
}


module.exports =  connectDb
