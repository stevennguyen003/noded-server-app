import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("NoteModel", schema);
export default model;