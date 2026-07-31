import mongoose from "mongoose";
//import { DB_NAME } from "";
import DB_NAME from "../../constants.js";
//creating a function which we will export
//database connection
const connectDB = async () => { //async func will return a promise
    try{
        const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //connecting
        //mongoose.connect() this func returns connection object which is then stored in connectionIntances
        console.log(`\n mongoDB connected !! DB HOST: ${connectionIntance.connection.host}`);
    }catch(error) {
        console.log("MONGODB connection error", error);
        //learn process from node js
        process.exit(1);
        /*Stops the Node.js application immediately.
        1 means: Exit with failure.
        (0 means success, 1 means error)*/ 
    }
}

export default connectDB //exporting func Makes this function available in other files.