import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: {
        type: Map,
        of: String,
        validate: {
            validator: function (v) {
                return ['a', 'b', 'c', 'd'].every(key => v.has(key));
            },
            message: props => `Options must include all keys: a, b, c, d`
        }
    },
    correctAnswer: { type: String, required: true }
},
    { collection: "quizzes" });

export default quizSchema;
