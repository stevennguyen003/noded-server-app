import mongoose from "mongoose";
import model from "./model.js";
import quizSchema from "../Quizzes/schema.js";
import { createQuiz } from "../Quizzes/dao.js";

const Quiz = mongoose.model('Quiz', quizSchema);

export const createNote = (note) => {
    delete note._id
    return model.create(note);
}
export const findAllNotes = () => model.find();
export const findNoteById = (noteId) => model.findById(noteId);
export const updateNote = (noteId, note) => model.updateOne({ _id: noteId }, { $set: note });
export const deleteNote = (noteId) => model.deleteOne({ _id: noteId });
export const updateNoteWithQuiz = async (noteId, quizzes) => {
    console.log("Hit Update");
    const quizIds = [];
    for (const quiz of quizzes) {
        const newQuiz = new Quiz(quiz);
        await newQuiz.save();
        quizIds.push(newQuiz._id);
    }
    await model.findByIdAndUpdate(noteId, { $set: { quizIds: quizIds } });
};

