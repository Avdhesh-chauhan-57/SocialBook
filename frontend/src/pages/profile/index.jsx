import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"

import { clientServer, getImageUrl } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import { getAboutUser } from '@/config/redux/action/authAction';
import { getAllPost } from '@/config/redux/action/postAction';
import { resetPostId } from '@/config/redux/reducer/postReducer';

export default function ProfilePage() {
    const [userPost, setUserPost] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEducation, setIsEducation] = useState(false)
    const [userProfile, setUserProfile] = useState();
    const postReducer = useSelector((state) => state.posts);
    const authState = useSelector((state) => state.auth)
    const dispatch = useDispatch();



    useEffect(() => {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        dispatch(getAllPost());
    }, [dispatch])

    const profile = authState.user
    useEffect(() => {
        if (!authState.user?.userId || !postReducer.posts) return;
        let post = postReducer.posts.filter((post) => {
            return post.userId.username === authState.user.userId.username
        })
        setUserPost(post)
    }, [postReducer.posts, authState.user])
    useEffect(() => {
        if (authState.user) {
            setUserProfile(authState.user);
        }
    }, [authState.user]);

    const updateProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", localStorage.getItem("token"));
        const response = await clientServer.post("/upload_profile_picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });

        dispatch(getAboutUser("token", localStorage.getItem("token")))
    }

    const updateProfileData = async () => {
        const request = await clientServer.post("/user_update", {
            token: localStorage.getItem("token"),
            name: userProfile.userId.name,
        });
        const response = await clientServer.post("/update_profile_data", {
            token: localStorage.getItem("token"),
            bio: userProfile.bio,
            currentPost: userProfile.currentPost,
            pastWork: userProfile.pastWork,
            education: userProfile.education
        });
        dispatch(getAboutUser({ token: localStorage.getItem("token") }))
    }

    const hasChanges =
        userProfile && profile &&
        JSON.stringify(userProfile) !== JSON.stringify(profile);


    const [inputData, setInputData] = useState({ company: '', position: '', years: '', school: '', degree: '', fieldOfStudy: '' })

    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]: value })
    }


    return (
        <UserLayout>
            <DashboardLayout>
                {profile?.userId &&
                    <div className={styles.container}>
                        <div className={styles.backdrop_Container}>
                            <label htmlFor='profilePictureUpload' className={styles.backdrop_overlay}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.downloadBtn}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </label>
                            <input hidden onChange={(e) => {
                                updateProfilePicture(e.target.files[0])
                            }} type="file" id='profilePictureUpload' />
                            <img src={getImageUrl(profile.userId.profilePicture)} alt="" />

                        </div>
                        <div className={styles.profileContainer_details}>
                            <div className={styles.profileContainer}>
                                <div className={styles.profileContainer_left}>
                                    <div className={styles.profileContainer_data}>

                                        <input
                                            id="username"
                                            type="text"
                                            className={styles.nameEdit}
                                            value={userProfile?.userId?.name || ""}
                                            name="username"
                                            onChange={(e) => {
                                                setUserProfile({
                                                    ...userProfile,
                                                    userId: { ...userProfile.userId, name: e.target.value }
                                                })
                                            }}
                                        />
                                        {/* <h2>{profile.userId.name}</h2> */}
                                        <p style={{ color: "gray" }}>@{profile.userId.username}</p>
                                    </div>
                                    <textarea
                                        className={styles.editBio}
                                        value={userProfile?.bio || ""}
                                        onChange={(e) => {
                                            setUserProfile({ ...userProfile, bio: e.target.value })
                                        }}
                                        rows={Math.max(3, Math.ceil((userProfile?.bio || "").length / 80))}
                                    />


                                    {/* <p>{profile.bio || "No bio available"}</p> */}
                                </div>
                                <div className={styles.profileContainer_right}>
                                    <h3>Recent Activity</h3>
                                    {userPost.map((post) => (
                                        <div key={post._id} className={styles.postCard}>
                                            <div className={styles.card}>
                                                <div className={styles.card_ProfileContainer}>
                                                    {post.media?.trim()
                                                        ? <img src={getImageUrl(post.media)} alt="Media" />
                                                        : <div style={{ width: "3.4rem", height: "3.4rem" }} />}
                                                </div>
                                                <p className={styles.status}>{post.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.workHistory}>
                            <h4>Work History</h4>
                            <div className={styles.workHistoryContainer}>
                                {(profile.pastWork || []).map((work) => (
                                    <div key={work._id} className={styles.workHistoryCard}>
                                        <p className={styles.historyText}>{work.company} - {work.position}</p>
                                        <p>{work.years}</p>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.addWorkbtn} onClick={() => {
                                setIsModalOpen(true)
                            }}>  Add Work </button>

                        </div>

                        <div className={styles.workHistory}>
                            <h4>Education</h4>
                            <div className={styles.workHistoryContainer}>
                                {(profile.education || []).map((education) => (
                                    <div key={education._id} className={styles.workHistoryCard}>
                                        <p className={styles.historyText}>{education.school} - {education.degree}</p>
                                        <p>{education.fieldOfStudy}</p>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.addWorkbtn} onClick={() => {
                                setIsEducation(true)
                            }}>Add Education</button>

                        </div>
                        {hasChanges &&
                            <div className={styles.connectBtn} onClick={() => updateProfileData()}>
                                Update Profile
                            </div>
                        }

                    </div>
                }

                {
                    isModalOpen &&
                    <div onClick={() => { setIsModalOpen(false) }} className={styles.commentsContainer}>
                        <div onClick={(e) => { e.stopPropagation() }} className={styles.allCommentsContainer}>
                            <input onChange={handleWorkInputChange} name='company' className={styles.inputField} type="text" placeholder='Enter Company' />
                            <input onChange={handleWorkInputChange} name='position' className={styles.inputField} type="text" placeholder='Enter Position' />
                            <input onChange={handleWorkInputChange} name='years' className={styles.inputField} type="number" placeholder='Enter Years' />
                            <div className={styles.buttonSubmit} onClick={() => {
                                setUserProfile({ ...userProfile, pastWork: [...userProfile.pastWork, inputData] })
                                setIsModalOpen(false)
                            }}>
                                <p>Add Work</p>
                            </div>
                        </div>

                    </div>
                }
                {
                    isEducation &&
                    <div onClick={() => { setIsEducation(false) }} className={styles.commentsContainer}>
                        <div onClick={(e) => { e.stopPropagation() }} className={styles.allCommentsContainer}>
                            <input onChange={handleWorkInputChange} name='school' className={styles.inputField} type="text" placeholder='Enter School Name' />
                            <input onChange={handleWorkInputChange} name='degree' className={styles.inputField} type="text" placeholder='Enter Degree' />
                            <input onChange={handleWorkInputChange} name='fieldOfStudy' className={styles.inputField} type="text" placeholder='Enter fieldOfStudy' />
                            <div className={styles.buttonSubmit} onClick={() => {
                                setUserProfile({ ...userProfile, education: [...userProfile.education, inputData] })
                                setIsEducation(false)
                            }}>
                                <p>Add Education</p>
                            </div>
                        </div>

                    </div>
                }






            </DashboardLayout>
        </UserLayout>
    )
}