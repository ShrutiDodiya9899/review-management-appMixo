import express from "express";
import cors from "cors";
import { dbConnection } from "./config/dbconfig.js";
import { reviewRoute } from "./routes/reviewRoutes.js";

const app = express();
app.use(express.json())
app.use(cors())

dbConnection();

app.use("/api/reviews",reviewRoute)

export default app