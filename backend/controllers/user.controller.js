

import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import Profile from '../models/profile.model.js';
import ConnectionRequest from '../models/connections.model.js';
import crypto from 'crypto'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path';
import { uploadToCloudinary } from '../config/cloudinary.js';



const convertUserDataTOPDF = async (userData) => {

    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";

    // Create uploads folder path
    const uploadDir = path.join(process.cwd(), "uploads");

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Correct PDF file path
    const filePath = path.join(uploadDir, outputPath);

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);




    // Profile Picture

    const profilePicture = userData.userId.profilePicture;

    console.log("Profile Picture:", profilePicture);

    if (profilePicture) {

        try {
            let imageSource = null;

            if (profilePicture.startsWith("http")) {
                // Cloudinary URL: image download karke PDF me lagao
                const imgResponse = await fetch(profilePicture);
                imageSource = Buffer.from(await imgResponse.arrayBuffer());
            } else {
                // Purani local image (jaise default.png)
                const imagePath = path.join(uploadDir, profilePicture);

                console.log("Image Path:", imagePath);

                console.log(
                    "Image Exists:",
                    fs.existsSync(imagePath)
                );

                if (fs.existsSync(imagePath)) {
                    imageSource = imagePath;
                }
            }

            if (imageSource) {

                doc.image(imageSource, {
                    fit: [100, 100],
                    align: "center"
                });

                doc.moveDown();

            } else {
                console.log("Profile image not found!");
            }

        } catch (err) {
            console.log("Profile image could not be added:", err.message);
        }

    } else {
        console.log("Profile picture not available!");
    }





    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.text(`Username: ${userData.userId.username}`);
    doc.text(`Email: ${userData.userId.email}`);
    doc.text(`Bio: ${userData.bio || "N/A"}`);
    doc.text(`Current Position: ${userData.currentPost || "N/A"}`);

    doc.moveDown();

    doc.fontSize(16).text("Past Work Experience");

    userData.pastWork.forEach((work, index) => {

        doc.fontSize(14).text(`Company Name: ${work.company}`);
        doc.text(`Position: ${work.position}`);
        doc.text(`Years: ${work.years || "Fresher"}`);

        doc.moveDown();
    });

    doc.end();

    // Wait until PDF is completely written
    await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
    });

    return filePath;
};



export const register = async (req, res) => {

    try {
        const { name, username, password, email } = req.body;
        if (!name || !username || !password || !email) return res.status(400).json({ message: "All fields are Required" })
        // const user = await User.findOne({
        //     email
        // });
        // if (user) return res.status(140).json({ message: "User already exits" });
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user)
            return res.status(409).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
        });

        await newUser.save();
        const profile = new Profile({ userId: newUser._id });
        await profile.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All Feild are required" })
        const user = await User.findOne({
            email
        });
        if (!user) return res.status(404).json({ message: "user doesn't exits" })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: "Enter correct  password" })
        const token = crypto.randomBytes(32).toString("hex")
        await User.updateOne({ _id: user._id }, { token })
        return res.json({ token: token })

    } catch (error) {


        return res.status(500).json({
            message: error.message
        });
    }
}

export const uploadprofilePicture = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(144).json({ message: "User not found" })
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" })
        }
        const result = await uploadToCloudinary(req.file.buffer);
        user.profilePicture = result.secure_url
        await user.save()
        return res.json({ message: 'Profile picture updated' })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

export const updateUserprofile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(144).json({ message: "User not found" })
        }
        const { username, email } = newUserData;
        const exitinguser = await User.findOne({ $or: [{ username }, { email }] });
        if (exitinguser) {
            if (exitinguser || String(exitinguser._id) !== (user._id)) {
                return res.status(140).json({ message: "User already Exits" })
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "User updated" });

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(144).json({ message: "User does not Found" })
        }
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture')
        return res.json(userProfile)

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}



export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;

        const user = await User.findOne({ token });

        if (!user) {
            return res.status(144).json({
                message: "User not found"
            });
        }

        const profile_to_update = await Profile.findOne({
            userId: user._id
        });

        if (!profile_to_update) {
            return res.status(144).json({
                message: "Profile not found"
            });
        }

        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

        return res.json({
            message: "Profile Updated Successfully"
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};


export const get_All_User_Profile = async (req, res) => {
    try {
        const profile = await Profile.find().populate('userId', 'name username email profilePicture')
        return res.json({ profile })


    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

// export const downloadprofile = async (req, res) => {
//     const user_id = req.query.id;
//     const userProfile = await Profile.findOne({ userId: user_id })
//         .populate('userId', 'name username email profilePicture');

//     let outputPath = await convertUserDataTOPDF(userProfile);
//     return res.json({ "message": outputPath })

// }
export const downloadprofile = async (req, res) => {

    try {

        const user_id = req.query.id;

        console.log("Received User ID:", user_id);

        const userProfile = await Profile.findOne({
            userId: user_id
        }).populate(
            'userId',
            'name username email profilePicture'
        );

        console.log("User Profile:", userProfile);

        // Check profile exists
        if (!userProfile) {
            return res.status(404).json({
                message: "Profile not found. Invalid User ID."
            });
        }

        // Check populated user exists
        if (!userProfile.userId) {
            return res.status(404).json({
                message: "User details not found"
            });
        }

        const outputPath = await convertUserDataTOPDF(userProfile);

        return res.download(outputPath, "profile.pdf");

    } catch (e) {

        console.log(e);

        return res.status(500).json({
            message: e.message
        });
    }
};


export const sendConnectionRequest = async (req, res) => {
    try {
        const { token, connectionId } = req.body;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        const connectionUser = await User.findOne({ _id: connectionId });
        if (!connectionUser) {
            return res.status(404).json({ message: "Connection User not Found" })
        }

        // ✅ khud ko request nahi bhej sakte
        if (user._id.toString() === connectionUser._id.toString()) {
            return res.status(400).json({ message: "You cannot send a request to yourself" })
        }

        // ✅ dono directions check karo (A->B ya B->A pehle se ho toh dobara nahi banegi)
        const exitingRequest = await ConnectionRequest.findOne({
            $or: [
                { userId: user._id, connectionId: connectionUser._id },
                { userId: connectionUser._id, connectionId: user._id }
            ]
        })

        if (exitingRequest) {
            return res.status(400).json({ message: "request already send" })
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        });
        await request.save();
        return res.json({ message: "Request send" })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const getMyConnectionRequest = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        const connections = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture');
        return res.json(connections)


    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}


export const whatAreMyConnections = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        const connections = await ConnectionRequest.find({ connectionId: user._id })
            .populate('userId', 'name username email profilePicture');
        return res.json(connections)

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { token, requestId, action_type } = req.body;
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        const connection = await ConnectionRequest.findOne({ _id: requestId, connectionId: user._id })

        if (!connection) {
            return res.status(404).json({ message: "Connection not Found" })
        }
        if (action_type === "accept") {
            connection.status_accepted = true;
        } else {
            connection.status_accepted = false;
        }
        await connection.save();
        return res.json({ message: "request updated" })


    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}



export const getUserProfileBasedOnUsername = async (req, res) => {
    try {
        const { username } = req.query;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture')
        return res.json({ "Profile": userProfile })

    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
}