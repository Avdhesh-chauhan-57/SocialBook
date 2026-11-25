
import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import { createPost, deletePost, getAllComments, getAllPost, incrementPostLikes, postComment } from '@/config/redux/action/postAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { getImageUrl } from '@/config';
import { resetPostId } from '@/config/redux/reducer/postReducer';

// Small helper so every icon shares the same svg attributes
const Icon = ({ d, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
)

const ICONS = {
    photo: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
    send: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5",
    trash: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    like: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z",
    comment: "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z",
    share: "M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z",
}

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth)
    const postState = useSelector((state) => state.posts)
    const [fileError, setFileError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || token === "null") {
            router.replace("/login");
            return;
        }

        dispatch(getAllPost());
        dispatch(getAboutUser({ token }));

        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }

    }, []);

    const [postContent, setPostContent] = useState("");
    const [fileContent, setFileContent] = useState(null);
    const [commentText, setCommentText] = useState("")

    const handleUpload = async () => {
        if (!postContent.trim()) return;
        await dispatch(createPost({ file: fileContent, body: postContent }));
        setPostContent('')
        setFileContent(null)
        dispatch(getAllPost())
    }

    const handleComment = async () => {
        if (!commentText.trim()) return;
        await dispatch(postComment({ post_id: postState.postId, body: commentText }))
        await dispatch(getAllComments({ post_id: postState.postId }))
        setCommentText("")
    }

    const handleShare = (post) => {
        const text = encodeURIComponent(post.body)
        const url = encodeURIComponent("apanaCollege.in")
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
    }

    if (!authState.user) {
        return (
            <UserLayout>
                <DashboardLayout>
                    <div className={styles.LoadingFeature}>
                        <h1>Loading...</h1>

                    </div>
                </DashboardLayout>
            </UserLayout>
        )
    }

    const comments = postState.Comments || [];

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.scrollcomponent}>
                    <div className={styles.wrapper}>

                        {/* ---------- Composer ---------- */}
                        <div className={styles.createPostContainer}>
                            <div className={styles.composerTop}>
                                {authState.profileFetched && (
                                    <img
                                        className={styles.userprofile}
                                        src={getImageUrl(authState.user.userId?.profilePicture)}
                                        alt="Your profile"
                                    />
                                )}
                                <textarea
                                    className={styles.textarea}
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    aria-label="Write a post"
                                />
                            </div>

                            <div className={styles.composerBottom}>
                                <div className={styles.composerLeft}>
                                    <label htmlFor="fileUpload" className={styles.fab}>
                                        <Icon d={ICONS.photo} />
                                        Add media
                                    </label>
                                    <input
                                        id="fileUpload"
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files[0] || null;

                                            if (file && file.size > 5 * 1024 * 1024) {
                                                setFileError("File size must be less than 5 MB.");
                                                setFileContent(null);
                                                e.target.value = "";
                                                return;
                                            }

                                            setFileError("");
                                            setFileContent(file);
                                        }}
                                    />
                                    {fileError && (
                                        <p className={styles.fileError}>
                                            ⚠️ {fileError}
                                        </p>
                                    )}
                                    {fileContent && (
                                        <div className={styles.fileChip}>
                                            <span>{fileContent.name}</span>
                                            <button type="button" aria-label="Remove file" onClick={() => setFileContent(null)}>×</button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={styles.uploadbutton}
                                    onClick={handleUpload}
                                    disabled={!postContent.trim()}
                                >
                                    <Icon d={ICONS.send} />
                                    Post
                                </button>
                            </div>
                        </div>

                        {/* ---------- Feed ---------- */}
                        <div className={styles.postsContainer}>
                            {postState.posts.length === 0 && (
                                <div className={styles.emptyFeed}>No posts yet. Share the first one.</div>
                            )}

                            {postState.posts.map((post) => (
                                <article key={post._id} className={styles.singleCard}>
                                    <div className={styles.singleCard_profileContainer}>
                                        <img
                                            className={styles.userProfile}
                                            src={getImageUrl(post.userId.profilePicture)}
                                            alt={`${post.userId.name}'s profile`}
                                        />
                                        <div className={styles.postMain}>
                                            <div className={styles.name_delete}>
                                                <p className={styles.name}>{post.userId.name}</p>
                                                {post.userId._id === authState.user.userId._id && (
                                                    <button
                                                        type="button"
                                                        className={styles.deleteWrap}
                                                        aria-label="Delete post"
                                                        onClick={async () => {
                                                            await dispatch(deletePost(post._id))
                                                            await dispatch(getAllPost())
                                                        }}
                                                    >
                                                        <Icon d={ICONS.trash} className={styles.deleteBtn} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className={styles.username}>@{post.userId.username}</p>
                                            <p className={styles.body}>{post.body}</p>
                                        </div>
                                    </div>

                                    {post.media && post.media.trim() !== "" && (
                                        <div className={styles.singleCard_image}>
                                            <img src={getImageUrl(post.media)} alt="" loading="lazy" />
                                        </div>
                                    )}

                                    <div className={styles.optionsContainer}>
                                        <button
                                            type="button"
                                            className={styles.singleOption_optionsContainer}
                                            onClick={async () => {
                                                await dispatch(incrementPostLikes(post._id))
                                                await dispatch(getAllPost())
                                            }}
                                        >
                                            <Icon d={ICONS.like} className={styles.likeBtn} />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.singleOption_optionsContainer}
                                            onClick={() => dispatch(getAllComments({ post_id: post._id }))}
                                        >
                                            <Icon d={ICONS.comment} className={styles.commentsBtn} />
                                            <span>Comments</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.singleOption_optionsContainer}
                                            onClick={() => handleShare(post)}
                                        >
                                            <Icon d={ICONS.share} className={styles.shareBtn} />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* ---------- Comments modal ---------- */}
                    {postState.postId !== "" && (
                        <div className={styles.commentsContainer} onClick={() => dispatch(resetPostId())}>
                            <div className={styles.allCommentsContainer} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.commentsHeader}>
                                    <h3>Comments</h3>
                                    <button type="button" className={styles.closeBtn} aria-label="Close" onClick={() => dispatch(resetPostId())}>×</button>
                                </div>

                                <div className={styles.commentsList}>
                                    {postState.Comments.length === 0 && <p className={styles.noComments}>No comments yet. Start the conversation.</p>}
                                    {postState.Comments.map((c) => (
                                        <div className={styles.singleComment} key={c._id}>
                                            <div className={styles.singleComment_profileContainer}>
                                                <img src={getImageUrl(c.userId.profilePicture)} alt="" />
                                                <div>
                                                    <p>{c.userId.name}</p>
                                                    <p>@{c.userId.username}</p>
                                                </div>
                                            </div>
                                            <p>{c.body}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.postCommentsContainer}>
                                    <input
                                        type="text"
                                        placeholder="Write a comment"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleComment()}
                                    />
                                    <button
                                        type="button"
                                        className={styles.postCommentContainer_btn}
                                        onClick={handleComment}
                                        disabled={!commentText.trim()}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </UserLayout>
    )
}