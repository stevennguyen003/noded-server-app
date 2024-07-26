import model from "./model.js";
import { createQuiz } from "../Quizzes/dao.js";

export const createNote = (note) => {
    delete note._id
    return model.create(note);
}
export const findAllNotes = () => model.find();
export const findNoteById = (noteId) => model.findById(noteId);
export const updateNote = (noteId, note) => model.updateOne({ _id: noteId }, { $set: note });
export const deleteNote = (noteId) => model.deleteOne({ _id: noteId });
export const addQuizToNote = async (noteId, quizData) => {
    try {
        // Create the quiz
        const newQuiz = await createQuiz(quizData);
        // Add the quiz ID to the note's quizIds array
        await model.findByIdAndUpdate(
            noteId,
            { $push: { quizIds: newQuiz._id } },
            { new: true, runValidators: true }
        );
        return newQuiz;
    } catch (error) {
        console.error("Error adding quiz to note:", error);
        throw error;
    }
};

