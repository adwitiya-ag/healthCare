import dotenv from "dotenv" //we have to congif dotenv
import connectDB from "../backend/src/db/index.js";
import {app} from "./app.js";


dotenv.config({ //configuring dotenv
    path: './.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo db connection failed", err);
})


/*When this file runs:
dotenv loads environment variables.
connectDB is imported.
connectDB() is executed.
MongoDB connection is established.
App is ready to use DB. */



