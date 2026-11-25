import UserLayout from '@/layout/UserLayout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import styles from "./style.module.css"
import { loginUser, register } from '@/config/redux/action/authAction'
import { emptyMessage } from '@/config/redux/reducer/authReducer'


export default function loginComponent() {

    const authState = useSelector((state) => state.auth)
    const router = useRouter();
    const dispatch = useDispatch();
    const [userLoginMethod, setUserLoginMethod] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");



    useEffect(() => {
        if (authState.loggedIn) {
            router.push("/dashboard")
        }

    }, [authState.loggedIn])
    // useEffect(() => {
    //     if (authState.isSuccess && !authState.loggedIn) {
    //         setUserLoginMethod(true);
    //     }
    // }, [authState.isSuccess, authState.loggedIn]);
    useEffect(() => {
        if (authState.isSuccess && !authState.loggedIn) {
            setUserLoginMethod(true);
        }
    }, [authState.isSuccess, authState.loggedIn]);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            router.push("/dashboard")
        }
    }, [])


    useEffect(() => {
        dispatch(emptyMessage())
    }, [userLoginMethod])


    const handleRegister = () => {
        console.log("registering.....")
        dispatch(register({ name, username, email, password }))

    }

    const handleLogin = () => {
        console.log("login....");
        dispatch(loginUser({ email, password }))
    }



    return (
        <UserLayout>

            <div className={styles.container}>

                <div className={styles.cardContainer}>
                    <div className={styles.cardContainer_left}>
                        <p className={styles.cardLeft_heading}>{userLoginMethod ? "Sign In" : "Sign Up"}</p>

                        <div className={styles.inputContainer}>
                            {!userLoginMethod && (<div className={styles.inputRow}>
                                <input onChange={(e) => { setName(e.target.value) }} className={styles.inputField} type="text" placeholder='Name' />
                                <input onChange={(e) => { setUsername(e.target.value) }} className={styles.inputField} type="text" placeholder='Username' />
                            </div>)}
                            <input onChange={(e) => { setEmail(e.target.value) }} className={styles.inputField} type="text" placeholder='Email' />
                            <input onChange={(e) => { setPassword(e.target.value) }} className={styles.inputField} type="password" placeholder='Password' />
                            <div onClick={() => {
                                if (userLoginMethod) {
                                    handleLogin();
                                } else {
                                    handleRegister();
                                }
                            }} className={styles.buttonSubmit}>
                                <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
                            </div>
                            {authState.message?.message && (
                                <p
                                    className={`${styles.message} ${authState.isError ? styles.messageError : styles.messageSuccess
                                        }`}
                                >
                                    {authState.message.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className={styles.cardContainer_right}>
                        <div className={styles.right_card}>
                            {userLoginMethod ? <p>Don't have Account ?</p> : <p>Alreaady have an Account ?</p>}

                            <div onClick={() => {
                                setUserLoginMethod(!userLoginMethod)
                            }} style={{ color: 'black' }} className={styles.buttonSubmit}>
                                <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </UserLayout>
    )
}