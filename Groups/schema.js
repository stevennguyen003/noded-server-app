import mongoose from "mongoose";

// Represents how the group collection is structured in the database
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    users: {
        type: Map,
        of: {
            type: String,
            enum: ['admin', 'editor', 'user'],
            default: 'user'
        }
    },
    profilePicture: String,
},
    { collection: "groups" });
export default groupSchema;