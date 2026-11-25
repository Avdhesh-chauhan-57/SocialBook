import { createSlice } from '@reduxjs/toolkit'
import { getAllComments, getAllPost } from '../../action/postAction'



const initialState = {
    posts: [],
    isError: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    postFetched: false,
    Comments: [],
    postId: "",
}

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        reset: () => initialState,
        resetPostId: (state) => {
            state.postId = ""
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllPost.pending, (state) => {
                state.isLoading = true;
                state.message = "Fetching all the posts...."
            })
            .addCase(getAllPost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.postFetched = true;
                state.posts = action.payload.posts.reverse()
            })
            .addCase(getAllPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload
            })
            .addCase(getAllComments.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(getAllComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.postId = action.payload.post_id;
                state.Comments = action.payload.comments;
            })

            .addCase(getAllComments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
    }

})

export const { resetPostId } = postSlice.actions
export default postSlice.reducer;