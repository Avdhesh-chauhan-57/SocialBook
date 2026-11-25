import { BASE_URL } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect } from 'react'
import styles from "./index.module.css"
import { useDispatch, useSelector } from 'react-redux';
import { acceptConnection, getConnectionsRequest, getMyConnectionRequests } from '@/config/redux/action/authAction';
import Router, { useRouter } from 'next/router';


export default function MyConnectionsPage() {
    const router = useRouter();

    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    const fetchConnections = () => {
        const token = localStorage.getItem("token");
        dispatch(getConnectionsRequest({ token }));
        dispatch(getMyConnectionRequests({ token }));
    }

    useEffect(() => {
        fetchConnections();
    }, [])

    // Accept / Reject click
    const handleAction = async (requestId, action) => {
        await dispatch(acceptConnection({
            token: localStorage.getItem("token"),
            requestId: requestId,
            action: action
        }));
        fetchConnections();
    }

    // Mujhe aayi hui pending requests
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
    const goToProfile = (username) => router.push(`/view_profile/${username}`);

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>

                    <h3>Connection Requests</h3>
                    {pendingRequests.length === 0 && <p style={{ color: "gray" }}>No pending requests</p>}
                    {pendingRequests.map((req) => {
                        return (
                            <div key={req._id} className={styles.userCard}>
                                <img src={`${BASE_URL}/${req.userId.profilePicture}`} alt="" />
                                <div className={styles.userInfo}>
                                    <h4>{req.userId.name}</h4>
                                    <p>@{req.userId.username}</p>
                                </div>
                                <div className={styles.actionBtns}>
                                    <button className={styles.acceptBtn} onClick={() => handleAction(req._id, "accept")}>Accept</button>
                                    <button className={styles.rejectBtn} onClick={() => handleAction(req._id, "reject")}>Reject</button>
                                </div>
                            </div>
                        )
                    })}

                    <h3 style={{ marginTop: "2rem" }}>My Connections</h3>
                    {myConnections.length === 0 && <p style={{ color: "gray" }}>No connections yet</p>}
                    {myConnections.map((c) => {
                        return (
                            <div key={c.id} className={styles.userCard} onClick={() => goToProfile(c.user.username)}>
                                <img src={`${BASE_URL}/${c.user.profilePicture}`} alt="" />
                                <div className={styles.userInfo}>
                                    <h4>{c.user.name}</h4>
                                    <p>@{c.user.username}</p>
                                </div>
                            </div>
                        )
                    })}

                </div>
            </DashboardLayout>
        </UserLayout>
    )
}