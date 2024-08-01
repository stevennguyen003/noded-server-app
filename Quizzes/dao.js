import model from "./model.js";

// Create a quiz
export const createQuiz = (quiz) => {
    delete quiz._id;
    return model.create(quiz);
};
// Find a quiz given its ID
export const findQuizById = (quizId) => model.findById(quizId);