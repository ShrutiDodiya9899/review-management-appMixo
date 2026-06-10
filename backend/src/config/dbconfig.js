import mongoose from "mongoose";
import { envCofig } from "./envConfig.js";


export const dbConnection = async() => {
  try {
    const mongodbUrl = envCofig.MONGODB_URL;
    const connectDb = await mongoose.connect(mongodbUrl);
    console.log("Mongodb connected Successfully on host:", connectDb.connection.host);
  } catch (error) {
    console.log("error while connect db", error.message);
  }
};
