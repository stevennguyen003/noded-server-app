import mongoose from "mongoose";

// Represents how the user collection is structure in the database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // profilePicture: String,
},
    { collection: "users" });
export default userSchema;