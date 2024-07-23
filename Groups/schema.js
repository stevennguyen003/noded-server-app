import mongoose from "mongoose";
import crypto from 'crypto';

// Function to generate a random invite link
function generateInviteCode() {
    return crypto.randomBytes(4).toString('hex');
}

// Represents how the group collection is structured in the database
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    users: {
        type: Map,
        of: {
            type: String,
            enum: ['admin', 'editor', 'user'],
            default: 'user'
        }
    },
    inviteCode: { 
        type: String, 
        default: generateInviteCode,
        unique: true,
        required: true
    },
    profilePicture: String,
    noteIds: [{ type: String }]
}, { collection: "groups" });

// Middleware to ensure uniqueness of invite link
groupSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Group = mongoose.model('Group', groupSchema);
        let isUnique = false;
        while (!isUnique) {
            const existingGroup = await Group.findOne({ inviteCode: this.inviteCode });
            if (!existingGroup) {
                isUnique = true;
            } else {
                this.inviteCode = generateInviteCode();
            }
        }
    }
    next();
});

export default groupSchema;