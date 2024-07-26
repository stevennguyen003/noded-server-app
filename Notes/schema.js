import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    quizIds: [{ type: String, }]
},
    { collection: "notes" });
export default noteSchema;