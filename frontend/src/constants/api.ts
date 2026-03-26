
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export const AUTH_ENDPOINTS = {
	REGISTER: `${BASE_URL}/api/auth/register`,
	VERIFY_EMAIL: `${BASE_URL}/api/auth/verify-email`,
	LOGIN: `${BASE_URL}/api/auth/login`,
} as const;


export const POST_ENDPOINTS = {
	ALL: `${BASE_URL}/api/posts/all`,
	FIND: (id: string) => `${BASE_URL}/api/posts/${id}`,
	CREATE: `${BASE_URL}/api/posts/create`,
	UPDATE: (id: string) => `${BASE_URL}/api/posts/update/${id}`,
	DELETE: (id: string) => `${BASE_URL}/api/posts/delete/${id}`,
	SEARCH: (keyword: string) => `${BASE_URL}/api/posts/search/${keyword}`,
} as const;

export const USER_ENDPOINTS = {
	PROFILE: `${BASE_URL}/api/users/profile`,
	UPDATE_USERNAME: `${BASE_URL}/api/users/username`,
	UPDATE_EMAIL: `${BASE_URL}/api/users/email`,
	UPDATE_PASSWORD: `${BASE_URL}/api/users/password`,
	UPDATE_BIO: `${BASE_URL}/api/users/bio`,
	UPDATE_PROFILE_IMAGE: `${BASE_URL}/api/users/profile-image`,
	UPDATE_WEBSITE_URL: `${BASE_URL}/api/users/website-url`,
	UPDATE_LOCATION: `${BASE_URL}/api/users/location`,
	UPDATE_PROFESSIONAL_TITLE: `${BASE_URL}/api/users/professional-title`,
	WRITER_PROFILE: (writerId: string | number) =>
		`${BASE_URL}/api/users/writers/${writerId}/profile`,
	GET_CURRENT_WRITER: `${BASE_URL}/api/users/writer-profile`,
	GET_WRITER_BIO: `${BASE_URL}/api/users/writer/bio`,
	DELETE_ACCOUNT: `${BASE_URL}/api/users/account`,
} as const;


export const COLLECTION_ENDPOINTS = {
	ALL: `${BASE_URL}/api/collections/all`,
	FIND: (id: string) => `${BASE_URL}/api/collections/${id}`,
	CREATE: `${BASE_URL}/api/collections/create`,
	UPDATE: (id: string) => `${BASE_URL}/api/collections/update/${id}`,
	DELETE: (id: string) => `${BASE_URL}/api/collections/delete/${id}`,
	PIN: (id: string) => `${BASE_URL}/api/collections/pin/${id}`,
	ADD_POSTS: (id: string) => `${BASE_URL}/api/collections/add/${id}/posts`,
	REMOVE_POSTS: (id: string) =>
		`${BASE_URL}/api/collections/remove/${id}/posts`,
} as const;

export const FILE_ENDPOINTS = {
	UPLOAD_IMAGE: `${BASE_URL}/api/files/upload-image`,
} as const;

export const COMMENT_ENDPOINTS = {
	CREATE: `${BASE_URL}/api/comments/create`,
	GET_BY_POST: (postId: string) => `${BASE_URL}/api/comments/${postId}`,
	GET_REPLIES: (commentId: string) =>
		`${BASE_URL}/api/comments/replies/${commentId}`,
	GET_TOP_LEVEL: (postId: string) => `${BASE_URL}/api/comments/top/${postId}`,
	UPDATE: (id: string) => `${BASE_URL}/api/comments/update/${id}`,
	DELETE: (id: string) => `${BASE_URL}/api/comments/delete/${id}`,
	ADMIN_DELETE: (id: string) => `${BASE_URL}/api/comments/admin/delete/${id}`,
} as const;

export const FEEDBACK_ENDPOINTS = {
	SUBMIT: `${BASE_URL}/api/feedback/submit`,
	GET_ALL: `${BASE_URL}/api/feedback/all`,
	DELETE: (id: string) => `${BASE_URL}/api/feedback/delete/${id}`,
} as const;
