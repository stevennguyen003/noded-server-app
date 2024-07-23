import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    groupId: { type: String, required: true },
    questionIds: [{ type: String, }]
},
    { collection: "notes" });
export default noteSchema;