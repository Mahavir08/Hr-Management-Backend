import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/cpf_calculator";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to MongoDB.");

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
