import { FC, useEffect, useState, useContext } from "react";
import "../styles/comment.css";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import { LoginContext } from "../context/Context";
import axios from "axios";
import { COMMENT_ENDPOINTS } from "../constants/api";

interface CommentData {
	id: number;
	content: string;
	createdAt: string;
	updatedAt: string;
	authorId: number;
	authorUsername: string;
	postId: number;
	parentCommentId?: number;
	isChildComment: boolean;
	hasReplies: boolean;
	replies?: CommentData[];
}

interface CommentSectionProps {
	postId: number;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
	const { jwt } = useContext(LoginContext);
	const [comments, setComments] = useState<CommentData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchComments = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(
				COMMENT_ENDPOINTS.GET_BY_POST(postId.toString()),
				{
					headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
				},
			);
			setComments(response.data || []);
			setError("");
		} catch (err: any) {
			console.error("Failed to fetch comments:", err);
			setError(err.response?.data?.message || "Failed to load comments");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchComments();
	}, [postId, jwt]);

	const handleCommentUpdate = () => {
		fetchComments();
	};

	return (
		<div className="commentSection">
			<h3 className="commentSectionTitle">Comments</h3>

			<CommentForm
				postId={postId}
				onCommentSubmit={handleCommentUpdate}
			/>

			{isLoading && <p className="commentLoading">Loading comments...</p>}
			{error && <p className="commentError">{error}</p>}

			<div className="commentsList">
				{comments.length === 0 && !isLoading ? (
					<p className="noComments">
						No comments yet. Be the first to comment!
					</p>
				) : (
					comments.map((comment) => (
						<Comment
							key={comment.id}
							comment={comment}
							onCommentUpdate={handleCommentUpdate}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default CommentSection;
