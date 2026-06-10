import express from "express";
import app from "./src/app.js";
import { envCofig } from "./src/config/envConfig.js";

const port = envCofig.PORT;

app.listen(port,()=>{
       console.log(`MERN Server Running on PORT : ${port}`); 
});