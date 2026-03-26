import { FC } from "react";
import "../styles/header.css";
import Image from "../assets/pexels-sheep-1846422.jpg";

const Header: FC = () => {
	return (
		<div className="header">
			<div className="headerTitles">
				<span className="headerTitleSm">Poems and Statements</span>
				<span className="headerTitleLg">Gabriel's Blog</span>
				<img className="headerImg" src={Image} alt="header" />
			</div>
		</div>
	);
};

export default Header;
