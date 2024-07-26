import model from "./model.js";
import { addQuizToNote, createNote } from "../Notes/dao.js";
export const createGroup = (group) => {
    delete group._id
    return model.create(group);
}
export const findAllGroups = () => model.find();
export const findGroupById = (groupId) => model.findById(groupId);
export const findGroupByInviteCode = (inviteCode) => model.findOne({ inviteCode: inviteCode });
export const updateGroup = (groupId, group) => model.updateOne({ _id: groupId }, { $set: group });
export const deleteGroup = (groupId) => model.deleteOne({ _id: groupId });
export const uploadProfilePicture = (groupId, url) =>
    model.updateOne({ _id: groupId }, { $set: { profilePicture: url } });
export const addNoteToGroup = async (groupId, noteData) => {
    try {
        // Create the note
        const newNote = await createNote(noteData);

        // Generate quiz questions using the note's PDF URL
        // const quizData = await generateQuestions(newNote.url);
        
        // Create the quiz and add it to the note
        // const newQuiz = await addQuizToNote(newNote._id, quizData);

        // Add the note ID to the group's noteIds array
        await model.findByIdAndUpdate(
            groupId,
            { $push: { noteIds: newNote._id } },
            { new: true, runValidators: true }
        );

        // return { note: newNote, quiz: newQuiz };
        return newNote;
    } catch (error) {
        console.error("Error adding note to group and generating quiz:", error);
        throw error;
    }
};