import { FC, useContext, useRef, useState } from "react";
import "../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { LoginContext } from "../context/Context";
import { LoginSuccess } from "../context/Actions";
import axios from "axios";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "../constants/api";

const Login: FC = () => {
	const userRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const [errorText, setErrorText] = useState("");
	const [error, setError] = useState(false);
	const nav = useNavigate();

	const { dispatch, isFetching } = useContext(LoginContext);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch({ type: "LOGIN_START" });

		try {
			const res = await axios.post(AUTH_ENDPOINTS.LOGIN, {
				username: userRef.current?.value,
				password: passwordRef.current?.value,
			});

			const token = res.data.accessToken;

			try {
				const userRes = await axios.get(USER_ENDPOINTS.PROFILE, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const apiUser = userRes.data;
				const user = {
					...apiUser,
					profilePicture: apiUser.profileImageUrl,
				};
				dispatch(LoginSuccess(user, token));
				nav("/");
			} catch (error) {
				setError(true);
				setErrorText("Invalid Credentials!");
				dispatch({ type: "LOGIN_FAILURE" });
			}
		} catch (error: any) {
			setError(true);
			const message =
				error.response?.data?.message || "Invalid Credentials!";
			setErrorText(message);
			dispatch({ type: "LOGIN_FAILURE" });
		}
	};

	return (
		<div className="login">
			<span className="loginTitle">Login</span>
			<form className="loginForm" onSubmit={handleLogin}>
				<label>Username</label>
				<input
					type="text"
					placeholder=" enter your username..."
					className="logInput"
					ref={userRef}
				/>
				<label>Password</label>
				<input
					type="password"
					placeholder=" enter your password..."
					className="logInput"
					ref={passwordRef}
				/>
				<button
					className="loginButton"
					type="submit"
					disabled={isFetching}
				>
					<b>Login</b>
				</button>
				{error && <span className="logError">{errorText}</span>}
			</form>
			<button className="loginRegisterButton">
				<Link to="/register" className="buttonLink">
					Register
				</Link>
			</button>
		</div>
	);
};

export default Login;
