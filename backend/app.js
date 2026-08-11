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
import cityRouter from "./src/routes/city.routes.js";
import areaRouter from "./src/routes/area.routes.js";
import masterDataRouter from "./src/routes/masterData.routes.js";
import doctorRouter from "./src/routes/doctor.routes.js";
import chemistRouter from "./src/routes/chemist.routes.js";
import tourPlanRouter from "./src/routes/Tourplan.routes.js";

//routes decralation
//write according to healthcare project 
app.use("/api/v1/users", userRouter); //Any request starting with /api/v1/users goes to userRouter

// city.routes.js already defines full paths internally (/city, /cities, /city/:id)
app.use("/api/v1", cityRouter);

// area.routes.js already defines full paths internally (/area, /areas, /area/:id)
app.use("/api/v1", areaRouter);

// masterData.routes.js handles /doctor-qualification(s) and /doctor-specialization(s)
app.use("/api/v1", masterDataRouter);

// doctor.routes.js already defines full paths internally (/doctor, /doctors)
app.use("/api/v1", doctorRouter);

// chemist.routes.js already defines full paths internally (/chemist, /chemists)
app.use("/api/v1", chemistRouter);

// tourPlan.routes.js already defines full paths internally (/upload, /export)
 app.use("/api/v1/tour", tourPlanRouter);

export {app}; //Exporting App so it can be used in another file