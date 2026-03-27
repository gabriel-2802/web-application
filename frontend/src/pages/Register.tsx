import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../constants/api";

const Register: FC = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [adminRegisterCode, setAdminRegisterCode] = useState("");
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const nav = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(false);
		setIsLoading(true);
		
		// validate passwords match
		if (password !== confirmPassword) {
			setError(true);
			setErrorText("Passwords do not match");
			setIsLoading(false);
			return;
		}
		
		try {
			const payload: any = {
				username: username,
				email: email,
				password: password,
			};

			// include adminRegisterCode if provided (to register as WRITER)
			if (adminRegisterCode.trim()) {
				payload.adminRegisterCode = parseInt(adminRegisterCode, 10);
			}

			await axios.post(AUTH_ENDPOINTS.REGISTER, payload);

			// redirect to email verification page after successful registration
			nav("/verify-email", { state: { email: email } });
		} catch (error: any) {
			setError(true);
			const errorData = error.response?.data;
			let errorMessage = "Registration failed";
			
			if (errorData?.fieldErrors && typeof errorData.fieldErrors === "object") {
				const fieldErrorMessages = [];
				for (const [field, messages] of Object.entries(errorData.fieldErrors)) {
					if (Array.isArray(messages)) {
						fieldErrorMessages.push(`${field}: ${messages.join(", ")}`);
					} else {
						fieldErrorMessages.push(`${field}: ${messages}`);
					}
				}
				if (fieldErrorMessages.length > 0) {
					errorMessage = fieldErrorMessages.join(" | ");
				}
			}
			else if (typeof errorData === "string") {
				errorMessage = errorData;
			} else if (errorData?.error) {
				errorMessage = errorData.error;
			} else if (error.response?.status === 409) {
				errorMessage = "Username or email already exists";
			} else if (error.response?.status === 400) {
				errorMessage = "Invalid input. Please check all fields.";
			}
			
			setErrorText(errorMessage);
			setIsLoading(false);
		}
	};

	return (
		<div className="login">
			<span className="loginTitle">Register</span>
			<form className="loginForm" onSubmit={handleSubmit}>
				<label>Username</label>
				<input
					type="text"
					placeholder=" enter your username..."
					className="logInput"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label>Email</label>
				<input
					type="email"
					placeholder=" enter your email..."
					className="logInput"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label>Password</label>
				<input
					type="password"
					placeholder=" enter your password..."
					className="logInput"
					onChange={(e) => setPassword(e.target.value)}
				/>
				<label>Confirm Password</label>
				<input
					type="password"
					placeholder=" confirm your password..."
					className="logInput"
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
				<label>Writer Code (Optional)</label>
				<input
					type="text"
					placeholder=" enter code to register as writer..."
					className="logInput"
					onChange={(e) => setAdminRegisterCode(e.target.value)}
				/>
				<button
					className="loginButton"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Registering..." : "Register"}
				</button>
				{error && <span className="logError">{errorText}</span>}
			</form>
			<button className="loginRegisterButton">
				<Link to="/login" className="buttonLink">
					Login
				</Link>
			</button>
		</div>
	);
};

export default Register;
