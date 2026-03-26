import { FC, useState, useEffect } from "react";
import "../styles/sidebar.css";
import Image from "../assets/sidebar.jpg";
import { Link } from "react-router-dom";
import axios from "axios";
import { COLLECTION_ENDPOINTS, USER_ENDPOINTS } from "../constants/api";

interface WriterProfile {
	id: number;
	username: string;
	email: string;
	userType: string;
	bio: string;
	profileImageUrl: string;
	websiteUrl: string;
	location: string;
	professionalTitle: string;
	createdAt: string;
	updatedAt: string;
	roles: string[];
	posts: Array<{
		id: number;
		title: string;
		content: string;
		imageUrl: string;
		createdAt: string;
		updatedAt: string;
		authorId: number;
		authorUsername: string;
		collectionId: number;
		comments: Array<any>;
	}>;
	collections: Array<{
		id: number;
		name: string;
		description: string;
		owner: string;
		ownerId: string;
		pinned: boolean;
		createdAt: string;
		posts: Array<any>;
	}>;
}

interface Collection {
	id: number;
	name: string;
	description: string;
}

const Sidebar: FC = () => {
	const [writerProfile, setWriterProfile] = useState<WriterProfile | null>(null);
	const [collections, setCollections] = useState<Collection[]>([]);

	useEffect(() => {
		const fetchWriterProfile = async () => {
			try {
				const res = await axios.get(USER_ENDPOINTS.GET_CURRENT_WRITER);
				setWriterProfile(res.data);
			} catch (error) {
				console.error("Failed to fetch writer profile:", error);
			}
		};
		fetchWriterProfile();
	}, []);

	useEffect(() => {
		const fetchCollections = async () => {
			try {
				const res = await axios.get(COLLECTION_ENDPOINTS.ALL);
				setCollections(res.data);
			} catch (error) {
				console.error("Failed to fetch collections:", error);
			}
		};
		fetchCollections();
	}, []);

	return (
		<div className="sidebar">
			<div className="sidebarItem">
				<span className="sidebarTitle">About me</span>
				{writerProfile?.professionalTitle && (
					<p className="writerInfo writerTitle">
						{writerProfile.professionalTitle}
					</p>
				)}
				{writerProfile?.location && (
					<p className="writerInfo">{writerProfile.location}</p>
				)}
				{writerProfile?.websiteUrl && (
					<p className="writerInfo">
						<a
							href={writerProfile.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{writerProfile.websiteUrl.length > 30 
								? writerProfile.websiteUrl.substring(0, 27) + '...' 
								: writerProfile.websiteUrl}
						</a>
					</p>
				)}
				<img
					src={
						writerProfile?.profileImageUrl
							? writerProfile.profileImageUrl
							: Image
					}
					alt="Writer profile"
				/>
				<p className="writerBio">{writerProfile?.bio || "Welcome to the blog."}</p>
			</div>
			<div className="sidebarItem">
				<span className="sidebarTitle">Collections</span>
				<ul className="sidebarList">
					{collections.map((collection) => {
						return (
							<Link
								key={collection.id}
								to={`/?collection=${collection.id}`}
								className="link"
							>
								<li className="sidebarListItem">
									{collection.name}
								</li>
							</Link>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

export default Sidebar;
