import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoute from './routes/post.routes.js'
import userRoute from './routes/user.routes.js'

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(postRoute);
app.use(userRoute)
app.use(express.static("uploads"))

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

const start = async () => {
    const connectToDb = await mongoose.connect("mongodb+srv://avdhesh4cool_db_user:OIg1HvWzxK5IEq4P@cluster0.gssfzbw.mongodb.net");

    app.listen(9000, () => {
        console.log("Host:", mongoose.connection.host);
        console.log(`Server is listening to port ${9000}`);

    })
}

start();