import mongoose from "mongoose";

// Represents how the user collection is structure in the database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ["USER", "ADMIN", ""],
        default: "USER",
    },
    // profilePicture: String,
  },
  { collection: "users" });
export default userSchema;