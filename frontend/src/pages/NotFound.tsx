import { FC } from "react";
import "../styles/not-found.css";
import { Link } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";

const NotFound: FC = () => {
	return (
		<div className="notFound">
			<h1 className="404Title">
				<ErrorIcon className="errorIcon" /> 404{" "}
				<ErrorIcon className="errorIcon" />
			</h1>
			<h2 className="404Text">Page not found</h2>
			<button className="404Button">
				<Link to="/" className="buttonLink">
					Back Home
				</Link>
			</button>
		</div>
	);
};

export default NotFound;
