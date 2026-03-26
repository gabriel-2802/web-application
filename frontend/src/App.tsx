import "./App.css";
import "./styles/transitions.css";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Write from "./pages/Write";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import Single from "./pages/Single";
import PostsTable from "./pages/PostsTable";
import CollectionsTable from "./pages/CollectionsTable";
import FeedbackTable from "./pages/FeedbackTable";
import { useContext } from "react";
import { LoginContext, isWriter } from "./context/Context";
import { FC } from "react";

const App: FC = () => {
	const { user } = useContext(LoginContext);

	// Protected route component for writer-only pages
	const WriterRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
		return isWriter(user) ? element : <Navigate to="/" replace />;
	};

	return (
		<div className="app">
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<PageTransition><Home /></PageTransition>} />
					<Route path="/write" element={<PageTransition><Write /></PageTransition>} />
					<Route path="/log" element={<PageTransition><Login /></PageTransition>} />
					<Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
					<Route path="/login" element={<PageTransition><Login /></PageTransition>} />
					<Route path="/register" element={<PageTransition><Register /></PageTransition>} />
					<Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
					<Route
						path="/posts-table"
						element={<PageTransition><WriterRoute element={<PostsTable />} /></PageTransition>}
					/>
					<Route
						path="/collections-table"
						element={<PageTransition><WriterRoute element={<CollectionsTable />} /></PageTransition>}
					/>
					<Route
						path="/feedback-table"
						element={<PageTransition><WriterRoute element={<FeedbackTable />} /></PageTransition>}
					/>
					<Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
					<Route path="/post/:postId" element={<PageTransition><Single /></PageTransition>} />
					<Route path="/post/edit/:postId" element={<PageTransition><Write /></PageTransition>} />
				</Routes>
			</Router>
		</div>
	);
};

export default App;
