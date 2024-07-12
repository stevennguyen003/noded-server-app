import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("GroupModel", schema);
export default model;