import express from "express"
import cors from "cors" 
import cookieParser from "cookie-parser" 

const app = express(); //This creates our Express application instance

app.use(cors({ 
    //options
    origin : process.env.CORS_ORIGIN, 
    credentials: true
}))

app.use(express.json({limit: "16kb"})) //Parsing JSON Data
app.use(express.urlencoded({extended: true,limit:"16kb"})) //Parsing URL-Encoded Data
app.use(cookieParser()) //Using Cookie Parser Enables reading cookies in requests
app.use(express.static("public")) //Serving Static Files


//import routes here
import userRouter from "./src/routes/user.routes.js";

//routes decralation
//write according to healthcare project 
app.use("/api/v1/users", userRouter); //Any request starting with /api/v1/users goes to userRouter

export {app}; //Exporting App so it can be used in another file
