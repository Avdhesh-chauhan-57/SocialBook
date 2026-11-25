


import User from "../models/user.model.js";
import Post from "../models/posts.model.js"
import Comment from "../models/comments.model.js"
import { uploadToCloudinary } from "../config/cloudinary.js";



export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "RUNNING" })
}


export const createPost = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "User not exits" })
        }

        let mediaUrl = " ";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            mediaUrl = result.secure_url;
        }

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: mediaUrl,
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : " "

        })
        await post.save();
        return res.status(200).json({ message: "Post created" })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'name email username profilePicture')
        return res.json({ posts })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const deletePost = async (req, res) => {
    try {
        const { token, post_id } = req.body;
        const user = await User.findOne({ token: token }).select("_id")
        if (!user) {
            return res.status(404).json({ message: "User not exits" })
        }
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not exits" })
        }
        if (post.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                message: "You cannot delete someone else's post"
            });
        }



        await Post.deleteOne({ _id: post_id });

        return res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const commentPost = async (req, res) => {
    try {
        const { token, post_id, commentBody } = req.body;
        const user = await User.findOne({ token: token }).select("_id")
        if (!user) {
            return res.status(404).json({ message: "User not exits" })
        }
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not exits" })
        }
        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody
        })
        await comment.save();
        return res.status(200).json({
            message: "Comment Added"
        });

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

export const get_Comment_By_Post = async (req, res) => {
    try {
        const { post_id } = req.query;
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not exits" })
        }
        const comments = await Comment.find({ postId: post_id }).populate("userId", "username name , profilePicture")
        return res.json(comments.reverse());


    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const delete_Comment_of_User = async (req, res) => {
    try {
        const { token, comments_id } = req.body;
        const user = await User.findOne({ token: token }).select("_id")
        if (!user) {
            return res.status(404).json({ message: "User not exits" })
        }

        const comment = await Comment.findOne({ "_id": comments_id })
        if (!comment) {
            return res.status(404).json({ message: "Comment not Found" })
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "unauthorized" })
        }
        await Comment.deleteOne({ "_id": comments_id })
        return res.json({ message: "Comment Deleted" })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

export const increments_Likes = async (req, res) => {
    try {
        const { post_id } = req.body;
        const post = await Post.findOne({ "_id": post_id })
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        post.likes = post.likes + 1;
        await post.save();
        return res.json({ message: "Likes Incremented" })

    } catch {
        return res.status(500).json({ message: e.message })
    }
}