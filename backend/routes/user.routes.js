import { Router } from 'express'
import {
    login,
    register,
    uploadprofilePicture,
    updateUserprofile,
    getUserAndProfile,
    updateProfileData,
    get_All_User_Profile,
    downloadprofile,
    sendConnectionRequest,
    getMyConnectionRequest,
    whatAreMyConnections,
    acceptConnectionRequest,
    getUserProfileBasedOnUsername
} from '../controllers/user.controller.js';

import multer from 'multer'


const router = Router();
const upload = multer({ storage: multer.memoryStorage() })

router.route("/upload_profile_picture")
    .post(upload.single('profile_picture'), uploadprofilePicture)

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserprofile)
router.route("/get_user_and_profile").get(getUserAndProfile)
router.route("/update_profile_data").post(updateProfileData)
router.route("/user/get_all_users").get(get_All_User_Profile)
router.route("/user/download_resume").get(downloadprofile)
router.route("/user/send_connection_request").post(sendConnectionRequest)
router.route("/user/getconnection_request").get(getMyConnectionRequest)
router.route("/user/user_connection_request").get(whatAreMyConnections)
router.route("/user/accept_connection_request").post(acceptConnectionRequest)
router.route("/user/get_profile_based_on_username").get(getUserProfileBasedOnUsername)


export default router