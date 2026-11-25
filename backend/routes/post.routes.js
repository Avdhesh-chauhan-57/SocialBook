import { Router } from 'express'
import {
    activeCheck,
    commentPost,
    createPost,
    delete_Comment_of_User,
    deletePost,
    get_Comment_By_Post,
    getAllPosts,
    increments_Likes
} from '../controllers/posts.controller.js';
import multer from 'multer'


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

const router = Router();

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_Comment_By_Post);
router.route("/delete_comment").delete(delete_Comment_of_User);
router.route("/increment_post_route").post(increments_Likes);

export default router;