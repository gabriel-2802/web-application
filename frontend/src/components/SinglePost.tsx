import { FC, useEffect, useState, useContext } from "react";
import "../styles/single-post.css";
import Image from "../assets/pexels-sheep-1846422.jpg";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { isWriter, LoginContext, Post } from "../context/Context";
import { POST_ENDPOINTS } from "../constants/api";
import CommentSection from "./CommentSection";

const SinglePost: FC = () => {
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const [post, setPost] = useState<Post | undefined>();
	const { jwt, user } = useContext(LoginContext);
	const nav = useNavigate();

	useEffect(() => {
		const getPost = async () => {
			try {
				const res = await axios.get(POST_ENDPOINTS.FIND(id));
				setPost(res.data);
			} catch (error) {
				console.error("Failed to fetch post:", error);
			}
		};
		getPost();
	}, [id]);

	const handleDeleteClick = async () => {
		try {
			await axios.delete(POST_ENDPOINTS.DELETE(id), {
				headers: { Authorization: `Bearer ${jwt}` },
			});
		} catch (error) {
			console.error("Failed to delete post:", error);
		}
		nav("/");
	};

	const handleEditClick = () => {
		nav(`/post/edit/${id}`, { state: post });
	};

	const handleCollectionClick = () => {
		if (post?.collectionId) {
			nav(`/?collection=${post.collectionId}`);
		}
	};

	return (
		<div className="singlePost">
			<div className="singlePostWrapper">
				<img
					src={post?.imageUrl || Image}
					alt=""
					className="singlePostImg"
				/>
				<h1 className="singlePostTitle">
					{post?.title}
					{isWriter(user) && (
						<div className="singlePostEdit">
							<button
								className="postButton"
								onClick={handleEditClick}
							>
								<EditNoteIcon className="singlePostIcon" />
							</button>

							<button
								onClick={handleDeleteClick}
								className="postButton"
							>
								<DeleteIcon className="singlePostIcon" />
							</button>
						</div>
					)}
				</h1>
				<div className="singlePostInfo">
					<span className="singlePostAuthor">
						Author: {post?.author}
					</span>
					<p className="singlePostDesc">{post?.content}</p>
					<span className="singlePostDate">
						Created at:{" "}
						{new Date(post?.createdAt || "").toDateString()}
					</span>
					{post?.collectionId && (
						<button
							className="collectionButton"
							onClick={handleCollectionClick}
						>
							View Collection:{" "}
							{post.collectionName || `#${post.collectionId}`}
						</button>
					)}
				</div>
			</div>
			{post?.id && <CommentSection postId={post.id} />}
		</div>
	);
};

export default SinglePost;
