


import { clientServer, getImageUrl } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPost } from '@/config/redux/action/postAction';
import { getConnectionsRequest, sendConnectionRequest, getAboutUser, getMyConnectionRequests, acceptConnection } from '@/config/redux/action/authAction';


export default function ViewProfilePages(userProfile) {

    const router = useRouter();
    const postReducer = useSelector((state) => state.posts);
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const [userPost, setUserPost] = useState([]);
    const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
    const [isRequestPending, setIsRequestPending] = useState(false);
    const [isRequestReceived, setIsRequestReceived] = useState(false);

    const getUserPost = async () => {
        await dispatch(getAllPost());

        await dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));

        await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));

        await dispatch(getAboutUser({ token: localStorage.getItem("token") }));

    }
    useEffect(() => {
        getUserPost();
    }, [])

    useEffect(() => {
        let post = postReducer.posts.filter((post) => {
            return post.userId.username === router.query.username
        })
        setUserPost(post)
    }, [postReducer.posts])


    useEffect(() => {

        if (!userProfile.userProfile?.userId?._id) return;

        const profileId = userProfile.userProfile.userId._id;

        // maine bheji request (me -> unko)
        const sent = (authState.connections || []).find(
            user => user.connectionId?._id === profileId
        );

        // unhone bheji request (unhone -> mujhe)
        const received = (authState.connectionRequest || []).find(
            user => user.userId?._id === profileId
        );

        setIsCurrentUserInConnection(sent?.status_accepted === true || received?.status_accepted === true);
        setIsRequestPending(!!sent && sent.status_accepted !== true);
        setIsRequestReceived(!!received && received.status_accepted == null);

    }, [authState.connections, authState.connectionRequest, userProfile.userProfile]);


    // Kya ye meri apni profile hai?
    const myId =
        authState.user?.userId?._id ||
        authState.user?._id ||
        authState.user?.profile?.userId?._id;

    const isOwnProfile = !!myId && myId === userProfile.userProfile?.userId?._id;

    // Connect button click
    const handleConnect = async () => {
        const result = await dispatch(sendConnectionRequest({
            token: localStorage.getItem("token"),
            user_id: userProfile.userProfile.userId._id
        }));

        if (
            sendConnectionRequest.fulfilled.match(result) ||
            result.payload?.message === "request already send"
        ) {
            setIsRequestPending(true);
        }
    };

    // Accept / Reject (requestId = ConnectionRequest ki _id)
    const handleAction = async (requestId, action) => {
        await dispatch(acceptConnection({
            token: localStorage.getItem("token"),
            requestId: requestId,
            action: action
        }));

        dispatch(getConnectionsRequest({ token: localStorage.getItem("token") }));
        dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
    };

    // Dusre ki profile par "Accept Request" button
    const handleAccept = () => {
        const received = (authState.connectionRequest || []).find(
            user => user.userId?._id === userProfile.userProfile.userId._id
        );
        if (!received) return;
        handleAction(received._id, "accept");
    };


    const handleDownload = async () => {
        try {
            const userId = userProfile?.userProfile?.userId?._id;

            if (!userId) {
                console.log("User ID missing", userProfile);
                return;
            }

            const response = await clientServer.get(
                `/user/download_resume?id=${userId}`,
                {
                    responseType: "blob"
                }
            );

            const fileURL = window.URL.createObjectURL(response.data);

            window.open(fileURL, "_blank");

        } catch (error) {
            console.log("Download Error:", error);
        }
    };

    // Mujhe aayi hui pending requests (sirf apni profile par dikhengi)
    const pendingRequests = (authState.connectionRequest || []).filter(
        (req) => req.status_accepted == null && req.userId
    );

    // Accepted connections (dono directions)
    const myConnections = [
        ...(authState.connectionRequest || [])
            .filter((req) => req.status_accepted === true)
            .map((req) => ({ id: req._id, user: req.userId })),
        ...(authState.connections || [])
            .filter((req) => req.status_accepted === true)
            .map((req) => ({ id: req._id, user: req.connectionId }))
    ].filter((c) => c.user);





    const searchParams = useSearchParams();
    useEffect(() => {
        console.log("From view:view Profile")
    }, [])

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    <div className={styles.backdrop_Container}>
                        <img src={getImageUrl(userProfile.userProfile.userId.profilePicture)} alt="" />
                    </div>
                    <div className={styles.profileContainer_details}>
                        <div className={styles.profileContainer}>
                            <div className={styles.profileContainer_left}>
                                <div className={styles.profileContainer_data}>
                                    <h2>{userProfile.userProfile.userId.name}</h2>
                                    <p style={{ color: "gray" }}>@{userProfile.userProfile.userId.username}</p>
                                </div>

                                {/* User load hone tak aur apni profile par button nahi dikhega */}
                                <div className={styles.download}>
                                    {authState.user && !isOwnProfile && (
                                        isCurrentUserInConnection ?
                                            <button className={styles.connectedBtn}> Connected </button>
                                            :
                                            isRequestPending ?
                                                <button className={styles.connectedBtn} disabled> Request Sent </button>
                                                :
                                                isRequestReceived ?
                                                    <button className={styles.connectBtn} onClick={handleAccept}> Accept Request </button>
                                                    :
                                                    <button
                                                        className={styles.connectBtn}
                                                        onClick={handleConnect}
                                                    >
                                                        Connect
                                                    </button>
                                    )}

                                    <div onClick={async () => {
                                        handleDownload()
                                    }} className={styles.downloadBtn}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>

                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <p>{userProfile.userProfile?.bio || "No bio available"}</p>
                                    </div>
                                </div>

                                {/* Sirf apni profile par: aayi hui requests + meri connections */}
                                {isOwnProfile && (
                                    <div className={styles.connectionsSection}>

                                        <h3>Connection Requests</h3>
                                        {pendingRequests.length === 0 && <p style={{ color: "gray" }}>No pending requests</p>}
                                        {pendingRequests.map((req) => {
                                            return (
                                                <div key={req._id} className={styles.userCard}>
                                                    <img src={getImageUrl(req.userId.profilePicture)} alt="" style={{ width: "3rem", height: "3rem", borderRadius: "50%" }} />
                                                    <div className={styles.userInfo}>
                                                        <h4>{req.userId.name}</h4>
                                                        <p style={{ color: "gray" }}>@{req.userId.username}</p>
                                                    </div>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.connectBtn} onClick={() => handleAction(req._id, "accept")}>Accept</button>
                                                        <button className={styles.connectedBtn} onClick={() => handleAction(req._id, "reject")}>Reject</button>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        <h3>My Connections</h3>
                                        {myConnections.length === 0 && <p style={{ color: "gray" }}>No connections yet</p>}
                                        {myConnections.map((c) => {
                                            return (
                                                <div key={c.id} className={styles.userCard}>
                                                    <img src={getImageUrl(c.user.profilePicture)} alt="" style={{ width: "3rem", height: "3rem", borderRadius: "50%" }} />
                                                    <div className={styles.userInfo}>
                                                        <h4>{c.user.name}</h4>
                                                        <p style={{ color: "gray" }}>@{c.user.username}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                    </div>
                                )}

                            </div>
                            <div className={styles.profileContainer_right}>
                                <h3>Recent Activity</h3>
                                {userPost.map((post) => {
                                    return (
                                        <div key={post._id} className={styles.postCard}>
                                            <div className={styles.card}>
                                                <div className={styles.card_ProfileContainer}>
                                                    {post.media && post.media.trim() !== "" ? <img src={getImageUrl(post.media)} alt=' Media images' /> : <div style={{ width: "3.4rem", height: "3.4rem" }}></div>}
                                                </div>
                                                <p className={styles.status}>{post.body}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="workHistory">
                        <h4>Work History</h4>
                        <div className={styles.workHistoryContainer}>
                            {
                                (userProfile.userProfile?.pastWork || []).map((work, index) => {
                                    return (
                                        <div className={styles.workHistoryCard}>
                                            <p className={styles.historyText}>{work.company} - {work.position}</p>
                                            <p>{work.years}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>



                </div>
            </DashboardLayout>
        </UserLayout>
    )
}


export async function getServerSideProps(context) {
    console.log(context.query.username)
    console.log("from view")

    const request = await clientServer.get("/user/get_profile_based_on_username", {
        params: {
            username: context.query.username
        }
    })
    const response = await request.data
    console.log(response);
    return { props: { userProfile: request.data.Profile } }
}