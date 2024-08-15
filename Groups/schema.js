import mongoose from "mongoose";
import crypto from 'crypto';

// Function to generate a random invite link
function generateInviteCode() {
    return crypto.randomBytes(4).toString('hex');
}

// Represents how the group collection is structured in the database
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userRoles: {
        type: Map,
        of: {
            type: String,
            enum: ['admin', 'editor', 'user'],
            default: 'user'
        }
    },
    userScores: {
        type: Map,
        of: Number
    },
    userProgress: {
        type: Map,
        of: Number
    },
    userStreak: {
        type: Map,
        of: Number
    },
    userWeeklyProgress: {
        type: Map,
        of: {
            Mon: { type: Boolean, default: false },
            Tue: { type: Boolean, default: false },
            Wed: { type: Boolean, default: false },
            Thu: { type: Boolean, default: false },
            Fri: { type: Boolean, default: false }
        }
    },
    lastResetDate: {
        type: Date,
        default: Date.now
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
groupSchema.pre('save', async function (next) {
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

// Static method to reset all group's quiz progress when a new day starts
groupSchema.statics.resetAllProgress = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.updateMany(
        { lastResetDate: { $lt: today } },
        {
            $set: {
                userProgress: {},
                lastResetDate: today
            }
        }
    );
    return result;
};