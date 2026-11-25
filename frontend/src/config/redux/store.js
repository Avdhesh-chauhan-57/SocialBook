import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./reducer/authReducer";
import postReducers from "./reducer/postReducer";




export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducers

    }
})
