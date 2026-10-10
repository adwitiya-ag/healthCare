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

import companyRouter from "./src/routes/company.routes.js";

import productRouter from "./src/routes/product.routes.js";

import cityRouter from "./src/routes/City.routes.js";

import areaRouter from "./src/routes/Area.routes.js";

import masterDataRouter from "./src/routes/Masterdata.routes.js";

import doctorRouter from "./src/routes/Doctor.routes.js";

import chemistRouter from "./src/routes/Chemist.routes.js";

import tourPlanRouter from "./src/routes/Tourplan.routes.js";

import doctorProductPreferenceRouter from "./src/routes/doctorProductPreference.routes.js";

import locationRouter from "./src/routes/Location.route.js"

import visitProofRouter from "./src/routes/visitProof.route.js";

import sampleDistributionRouter from "./src/routes/SampleDistribution.routes.js";

import { errorHandler } from "./src/middleware/error.middleware.js";

//routes decralation
//write according to healthcare project 
app.use("/api/v1/users", userRouter); //Any request starting with /api/v1/users goes to userRouter

app.use("/api/v1/company", companyRouter);

app.use("/api/v1/products", productRouter);

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
app.use("/api/v1/preference", doctorProductPreferenceRouter);

app.use("/api/v1/location", locationRouter)

app.use("/api/v1/visit-proof", visitProofRouter)

//which sample to which doctor by which MR
app.use("/api/v1/sample-distribution", sampleDistributionRouter);


app.use(errorHandler);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Healthcare API is running"
    });
});

export default app; //Exporting App so it can be used in another file