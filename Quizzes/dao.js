import model from "./model.js";
export const createQuiz = () => {
    delete quiz._id
    return model.create(quiz);
}

export const uploadPDF = (groupId, url) =>
    model.updateOne({ _id: groupId }, { $set: { profilePicture: url } });