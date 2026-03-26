import { FC, useState, useContext } from "react";
import "../styles/comment.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import { LoginContext } from "../context/Context";
import axios from "axios";
import { COMMENT_ENDPOINTS } from "../constants/api";
import CommentForm from "./CommentForm";

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

interface CommentProps {
	comment: CommentData;
	onCommentUpdate: () => void;
}

const formatDate = (dateInput?: string) => {
	if (!dateInput) return "N/A";
	const date = new Date(dateInput);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const Comment: FC<CommentProps> = ({ comment, onCommentUpdate }) => {
	const { user, jwt } = useContext(LoginContext);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [showReplies, setShowReplies] = useState(false);
	const [replies, setReplies] = useState<CommentData[]>(
		comment.replies || [],
	);
	const [loadingReplies, setLoadingReplies] = useState(false);
	const [showReplyForm, setShowReplyForm] = useState(false);
	const isOwner = user?.id === comment.authorId;

	const fetchReplies = async (force = false) => {
		if ((replies.length > 0 && !force) || loadingReplies) return;

		try {
			setLoadingReplies(true);
			const response = await axios.get(
				COMMENT_ENDPOINTS.GET_REPLIES(comment.id.toString()),
				{
					headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
				},
			);
			setReplies(response.data || []);
		} catch (error) {
			console.error("Failed to fetch replies:", error);
		} finally {
			setLoadingReplies(false);
		}
	};

	const handleToggleReplies = () => {
		if (!showReplies && replies.length === 0) {
			fetchReplies();
		}
		setShowReplies(!showReplies);
	};

	const handleReplySubmitted = () => {
		setShowReplyForm(false);
		setShowReplies(true);
		fetchReplies(true); // Force refetch to get the new reply
	};

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this comment?")) {
			try {
				await axios.delete(
					COMMENT_ENDPOINTS.DELETE(comment.id.toString()),
					{
						headers: { Authorization: `Bearer ${jwt}` },
					},
				);
				onCommentUpdate();
			} catch (error) {
				console.error("Failed to delete comment:", error);
			}
		}
	};

	const handleEdit = async () => {
		if (editContent.trim()) {
			try {
				await axios.put(
					COMMENT_ENDPOINTS.UPDATE(comment.id.toString()),
					{
						content: editContent,
						postId: comment.postId,
						parentCommentId: comment.parentCommentId,
					},
					{ headers: { Authorization: `Bearer ${jwt}` } },
				);
				setIsEditing(false);
				onCommentUpdate();
			} catch (error) {
				console.error("Failed to update comment:", error);
			}
		}
	};

	return (
		<div className="comment">
			<div className="commentHeader">
				<span className="commentAuthor">{comment.authorUsername}</span>
				<span className="commentDate">
					{formatDate(comment.createdAt)}
				</span>
				<div className="commentActions">
					{user && (
						<button
							className="commentActionBtn reply"
							onClick={() => setShowReplyForm(!showReplyForm)}
							title="Reply"
						>
							<ReplyIcon fontSize="small" />
						</button>
					)}
					{isOwner && (
						<>
							<button
								className="commentActionBtn"
								onClick={() => setIsEditing(!isEditing)}
								title="Edit"
							>
								<EditIcon fontSize="small" />
							</button>
							<button
								className="commentActionBtn delete"
								onClick={handleDelete}
								title="Delete"
							>
								<DeleteIcon fontSize="small" />
							</button>
						</>
					)}
				</div>
			</div>

			{isEditing ? (
				<div className="commentEditForm">
					<textarea
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						className="commentTextarea"
					/>
					<div className="commentEditActions">
						<button
							onClick={handleEdit}
							className="commentBtn save"
						>
							Save
						</button>
						<button
							onClick={() => setIsEditing(false)}
							className="commentBtn cancel"
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<p className="commentContent">{comment.content}</p>
			)}

			{showReplyForm && (
				<CommentForm
					postId={comment.postId}
					parentCommentId={comment.id}
					onCommentSubmit={handleReplySubmitted}
					isReply={true}
				/>
			)}

			{(comment.hasReplies || replies.length > 0) && (
				<button
					className="showRepliesBtn"
					onClick={handleToggleReplies}
					disabled={loadingReplies}
				>
					{loadingReplies
						? "Loading replies..."
						: showReplies
							? "Hide"
							: "Show"}{" "}
					Replies ({replies.length})
				</button>
			)}

			{showReplies && replies && (
				<div className="replies">
					{replies.length > 0 ? (
						replies.map((reply) => (
							<Comment
								key={reply.id}
								comment={reply}
								onCommentUpdate={onCommentUpdate}
							/>
						))
					) : (
						<p className="noReplies">No replies yet</p>
					)}
				</div>
			)}
		</div>
	);
};

export default Comment;
