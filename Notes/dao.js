import model from "./model.js";
export const createNote = (note) => {
    delete note._id
    return model.create(note);
}
export const findAllNotes = () => model.find();
export const findNoteById = (noteId) => model.findById(noteId);
export const updateGroup = (noteId, note) => model.updateOne({ _id: noteId }, { $set: note });
export const deleteGroup = (noteId) => model.deleteOne({ _id: noteId });
