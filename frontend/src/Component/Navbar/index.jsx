
import React from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from "react-redux"
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavbarComponent() {
    const router = useRouter();
    const authState = useSelector((state) => state.auth)
    const dispatch = useDispatch();

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.brand} onClick={() => router.push("/")}>
                    {/* Logo icon: connected nodes = professional network */}
                    <svg
                        className={styles.logoIcon}
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id="pcBrand" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#5b6cff" />
                                <stop offset="1" stopColor="#8a4dff" />
                            </linearGradient>
                        </defs>
                        <rect width="40" height="40" rx="11" fill="url(#pcBrand)" />
                        <path d="M12 26 L20 13 L28 26 Z" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.8" strokeLinejoin="round" />
                        <circle cx="20" cy="13" r="3.6" fill="#ffffff" />
                        <circle cx="12" cy="26" r="3.6" fill="#ffffff" />
                        <circle cx="28" cy="26" r="3.6" fill="#ffffff" />
                    </svg>
                    <h1>Pro Connects</h1>
                </div>

                <div className={styles.navbar_Option_Container}>
                    {authState.profileFetched && (
                        <div className={styles.userSection}>
                            <p className={styles.greeting}>
                                Hey, <span>{authState.user.userId.name}</span>
                            </p>
                            <div
                                className={styles.profileBtn}
                                onClick={() => router.push("/profile")}
                            >
                                <p>Profile</p>
                            </div>
                            <div
                                className={styles.profileBtn}
                                onClick={() => {
                                    localStorage.removeItem("token")
                                    router.push("/login")
                                    dispatch(reset());

                                }}
                            >
                                <p>Logout</p>
                            </div>
                        </div>
                    )}

                    {!authState.profileFetched && (
                        <div
                            onClick={() => router.push("/login")}
                            className={styles.buttonJoin}
                        >
                            <p>Be a Part</p>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    )
}