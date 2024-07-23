import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true, unique: true },
    choices: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true }
    },
    answer: { type: String, required: true, enum: ['a', 'b', 'c', 'd'] }
},
    { collection: "quizzes" });
export default quizSchema;