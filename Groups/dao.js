import model from "./model.js";
import { createNote } from "../Notes/dao.js";
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
        // Add the note ID to the group's noteIds array
        await model.findByIdAndUpdate(
            groupId,
            { $push: { noteIds: newNote._id } },
            { new: true, runValidators: true }
        );
        return newNote;
    } catch (error) {
        console.error("Error adding note to group:", error);
        throw error;
    }
};