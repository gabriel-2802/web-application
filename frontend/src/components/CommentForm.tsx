import { FC, useState, useContext, useRef, useEffect } from "react";
import "../styles/comment.css";
import SendIcon from "@mui/icons-material/Send";
import { LoginContext } from "../context/Context";
import axios from "axios";
import { COMMENT_ENDPOINTS } from "../constants/api";

interface CommentFormProps {
	postId: number;
	parentCommentId?: number;
	onCommentSubmit: () => void;
	isReply?: boolean;
}

const CommentForm: FC<CommentFormProps> = ({
	postId,
	parentCommentId,
	onCommentSubmit,
	isReply = false,
}) => {
	const { user, jwt } = useContext(LoginContext);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const handleSubmit = async () => {
		if (!content.trim()) {
			setError("Comment cannot be empty");
			return;
		}

		setIsLoading(true);
		try {
			await axios.post(
				COMMENT_ENDPOINTS.CREATE,
				{
					content: content.trim(),
					postId,
					parentCommentId,
				},
				{ headers: { Authorization: `Bearer ${jwt}` } },
			);
			setContent("");
			setError("");
			onCommentSubmit();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to post comment");
		} finally {
			setIsLoading(false);
		}
	};

	if (!user) {
		return (
			<div className="commentFormContainer">
				<p className="notLoggedInMsg">Please log in to comment</p>
			</div>
		);
	}

	return (
		<div className={`commentFormContainer ${isReply ? "reply" : ""}`}>
			<textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder={
					isReply ? "Write a reply..." : "Write a comment..."
				}
				className="commentFormTextarea"
				rows={isReply ? 3 : 4}
			/>
			{error && <p className="commentFormError">{error}</p>}
			<div className="commentFormActions">
				<button
					onClick={handleSubmit}
					disabled={isLoading || !content.trim()}
					className="commentFormBtn"
				>
					<SendIcon fontSize="small" />
					{isLoading ? "Posting..." : isReply ? "Reply" : "Comment"}
				</button>
			</div>
		</div>
	);
};

export default CommentForm;
