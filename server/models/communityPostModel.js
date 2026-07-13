import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
        trim: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    author: {
        type: String,
        ref: 'User', 
        required: true
    },
    authorName: {
        type: String,
        default: "Community Member"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Array of Firebase UIDs who liked the post — length gives the like count,
    // and .includes(uid) tells you if the current user has liked it.
    likes: [
        {
            type: String
        }
    ],
    comments: [
        {
            user: {
                type: String, // Firebase UID of commenter
                required: true
            },
            username: {
                type: String,
                default: "Anonymous"
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    shares: {
        type: Number,
        default: 0
    }
});

const communityModel = mongoose.model("communityposts", communityPostSchema);
export default communityModel;