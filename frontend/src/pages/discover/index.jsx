


import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import styles from "./index.module.css"
import { getImageUrl } from '@/config';
import { useRouter } from 'next/router';

export default function Discoverpage() {
    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers())
        }
    }, [])

    const goToProfile = (username) => router.push(`/view_profile/${username}`);

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.discoverContainer}>
                    <h1 className={styles.title}>Discover</h1>
                    <p className={styles.subtitle}>Find people and grow your network</p>

                    <div className={styles.allUserProfile}>
                        {!authState.all_profiles_fetched && (
                            <p className={styles.emptyState}>Loading...</p>
                        )}

                        {authState.all_profiles_fetched && authState.all_users.map((user) => {
                            if (!user.userId) return null;
                            return (
                                <div
                                    key={user._id}
                                    className={styles.userCard}
                                    role="link"
                                    tabIndex={0}
                                    onClick={() => goToProfile(user.userId.username)}
                                    onKeyDown={(e) => e.key === 'Enter' && goToProfile(user.userId.username)}
                                >
                                    <img src={getImageUrl(user.userId.profilePicture)} alt={user.userId.name} />
                                    <div className={styles.userData}>
                                        <h1>{user.userId.name}</h1>
                                        <p>{user.userId.username}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    )
}