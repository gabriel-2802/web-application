const CLOUDINARY_CLOUD_NAME =
	process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET =
	process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "blog_images";

export const uploadImageFile = async (file: File): Promise<string> => {
	try {
		if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") {
			throw new Error(
				"Cloudinary Cloud Name not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME in .env.local",
			);
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
			{
				method: "POST",
				body: formData,
			},
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error?.message ||
					`Upload failed: ${response.statusText}`,
			);
		}

		const data = await response.json();
		const imageUrl = data.secure_url;

		return imageUrl;
	} catch (error: any) {
		console.error("Error uploading to Cloudinary:", error.message);
		const errorMessage =
			error.message || "Failed to upload image to Cloudinary";
		throw new Error(errorMessage);
	}
};
