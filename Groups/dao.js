import model from "./model.js";
export const createGroup = (group) => {
    delete group._id
    return model.create(group);
}
export const findAllGroups = () => model.find();
export const findGroupById = (groupId) => model.findById(groupId);
export const updateGroup = (groupId, group) => model.updateOne({ _id: groupId }, { $set: group });
export const deleteGroup = (groupId) => model.deleteOne({ _id: groupId });
export const uploadProfilePicture = (groupId, url) =>
    model.updateOne({ _id: groupId }, { $set: { profilePicture: url } });