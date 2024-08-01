import mongoose from "mongoose";
import model from "./model.js";
import quizSchema from "../Quizzes/schema.js";
import { findQuizById } from "../Quizzes/dao.js";

const Quiz = mongoose.model('Quiz', quizSchema);
// Create a note
export const createNote = (note) => {
    delete note._id
    return model.create(note);
}
// Find all notes in the database
export const findAllNotes = () => model.find();
// Find a note object given its ID
export const findNoteById = (noteId) => model.findById(noteId);
// Update a note
export const updateNote = (noteId, note) => model.updateOne({ _id: noteId }, { $set: note });
// Delete a note
export const deleteNote = (noteId) => model.deleteOne({ _id: noteId });
// Given an array of quizzes, save them into the database and store their ID's with the note's array
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
// Get all quiz objects based on the note's array of IDs
export const getAllQuizzes = async (noteId) => {
    try {
        const note = await model.findById(noteId);
        if (!note) {
            throw new Error('Note not found');
        }
        // Use Promise.all to fetch all quizzes in parallel
        const quizzes = await Promise.all(
            note.quizIds.map(id => Quiz.findById(id))
        );
        // Filter out any null results (in case a quiz was deleted)
        return quizzes.filter(quiz => quiz !== null);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
};

