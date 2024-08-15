import mongoose from "mongoose";
import model from "./model.js";
import schedule from 'node-schedule';
import { createNote } from "../Notes/dao.js";
import noteSchema from "../Notes/schema.js";
import groupSchema from "./schema.js";

const Note = mongoose.model('Note', noteSchema);
const Group = mongoose.model('Group', groupSchema);

// Create a new group
export const createGroup = (group) => {
    delete group._id
    return model.create(group);
}
// Find all groups in the collection
export const findAllGroups = () => model.find();
// Find the group given an ID
export const findGroupById = (groupId) => model.findById(groupId);
// Find a group given its invite code
export const findGroupByInviteCode = (inviteCode) => model.findOne({ inviteCode: inviteCode });
// Update a group
export const updateGroup = (groupId, group) => model.updateOne({ _id: groupId }, { $set: group });
// Delete a group
export const deleteGroup = (groupId) => model.deleteOne({ _id: groupId });
// Upload a picture for the group
export const uploadProfilePicture = (groupId, url) =>
    model.updateOne({ _id: groupId }, { $set: { profilePicture: url } });
// Given the data for a note, create the note object and store the ID in the group's array
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
        console.error("Error adding note to group and generating quiz:", error);
        throw error;
    }
};
// Find all note objects from the array of IDs
export const getAllNotes = async (groupId) => {
    try {
        const group = await model.findById(groupId);
        if (!group) {
            throw new Error('Note not found');
        }
        // Use Promise.all to fetch all notes in parallel
        const notes = await Promise.all(
            group.noteIds.map(id => Note.findById(id))
        );
        // Filter out any null results (in case a note was deleted)
        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
};
// Function to execute daily group reset
const dailyReset = schedule.scheduleJob('0 0 * * *', async function () {
    try {
        const result = await Group.resetAllProgress();
        console.log(`Reset progress for ${result.modifiedCount} groups`);
    } catch (error) {
        console.error('Error resetting progress:', error);
    }
});