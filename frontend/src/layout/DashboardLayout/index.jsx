import React, { useEffect } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux'
import { getImageUrl } from '@/config';

const NAV_ITEMS = [
    {
        label: "Scroll",
        path: "/dashboard",
        icon: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    },
    {
        label: "Discover",
        path: "/discover",
        icon: "m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    {
        label: "My Connections",
        path: "/my_connections",
        icon: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    },
]

const TOP_PROFILES_COUNT = 10

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth)

    useEffect(() => {
        if (localStorage.getItem("token") === "null") {
            router.push("/login")
        }
        dispatch(setTokenIsThere());
    }, [])

    // apne aap ko chhodkar baaki log dikhao
    const myId = authState.user?.userId?._id
    const topProfiles = (authState.all_users || [])
        .filter((profile) => profile.userId && profile.userId._id !== myId)
        .slice(0, TOP_PROFILES_COUNT)

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.homeContainer}>

                    {/* ---------- Navigation ---------- */}
                    <nav className={styles.homeContainer_leftBar} aria-label="Main">
                        {NAV_ITEMS.map((item) => {
                            const isActive = router.pathname === item.path
                            return (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => router.push(item.path)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`${styles.sidebarOption} ${isActive ? styles.sidebarActive : ""}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                    <p>{item.label}</p>
                                </button>
                            )
                        })}
                    </nav>

                    {/* ---------- Feed ---------- */}
                    <main className={styles.feedContainer}>
                        {children}
                    </main>

                    {/* ---------- Top Profiles ---------- */}
                    <aside className={styles.extraContainer} aria-label="Top profiles">
                        <h3>Top Profiles</h3>

                        {!authState.all_profiles_fetched && (
                            <p className={styles.emptyProfiles}>Loading...</p>
                        )}

                        {authState.all_profiles_fetched && topProfiles.length === 0 && (
                            <p className={styles.emptyProfiles}>No profiles to show yet.</p>
                        )}

                        <div className={styles.profileList}>
                            {topProfiles.map((profile) => (
                                <div key={profile._id} className={styles.profiletop}>
                                    <img
                                        className={styles.profileAvatar}
                                        src={getImageUrl(profile.userId.profilePicture)}
                                        alt=""
                                    />
                                    <div className={styles.profileInfo}>
                                        <p className={styles.profileName}>{profile.userId.name}</p>
                                        <p className={styles.profileUsername}>@{profile.userId.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}