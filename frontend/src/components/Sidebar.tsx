import { FC, useState, useEffect } from "react";
import "../styles/sidebar.css";
import Image from "../assets/sidebar.jpg";
import { Link } from "react-router-dom";
import axios from "axios";
import { COLLECTION_ENDPOINTS, USER_ENDPOINTS } from "../constants/api";

interface Collection {
	id: number;
	name: string;
	description: string;
}

const Sidebar: FC = () => {
	const [bio, setBio] = useState<string>("");
	const [collections, setCollections] = useState<Collection[]>([]);

	useEffect(() => {
		const fetchBio = async () => {
			try {
				const res = await axios.get(USER_ENDPOINTS.GET_WRITER_BIO);
				setBio(res.data);
			} catch (error) {
				console.error("Failed to fetch writer bio:", error);
				setBio(
					"Welcome to the blog. Discover amazing stories and content from talented writers.",
				);
			}
		};
		fetchBio();
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
				<img src={Image} alt="" />
				<p>{bio}</p>
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
