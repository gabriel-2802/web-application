import { FC, useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import { AUTH_ENDPOINTS } from "../constants/api";

const VerifyEmail: FC = () => {
	const [searchParams] = useSearchParams();
	const [verificationCode, setVerificationCode] = useState("");
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [verified, setVerified] = useState(false);
	const nav = useNavigate();
	const location = useLocation();
	const email = location.state?.email || "";

	// extract token from URL on component mount
	useEffect(() => {
		const tokenFromUrl = searchParams.get("token");
		if (tokenFromUrl) {
			setVerificationCode(tokenFromUrl);
			// Auto-verify if token is present in URL
			verifyToken(tokenFromUrl);
		}
	}, [searchParams]);

	const verifyToken = async (token: string) => {
		if (!token.trim()) {
			setError(true);
			setErrorText("No verification token found");
			return;
		}

		setIsLoading(true);
		setError(false);

		try {
			// call the verify email endpoint with the token
			await axios.get(AUTH_ENDPOINTS.VERIFY_EMAIL, {
				params: { token },
			});

			setVerified(true);
			setIsLoading(false);

			// redirect to login after 2 seconds
			setTimeout(() => {
				nav("/login", { replace: true });
			}, 2000);
		} catch (err: any) {
			setError(true);
			const errorData = err.response?.data;
			let errorMessage = "Email verification failed. Code may be invalid or expired.";
			if (typeof errorData === "string") {
				errorMessage = errorData;
			} else if (errorData?.error) {
				errorMessage = errorData.error;
			}
			setErrorText(errorMessage);
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await verifyToken(verificationCode);
	};

	if (verified) {
		return (
			<div className="login">
				<span className="loginTitle">Email Verified!</span>
				<div style={{ textAlign: "center", padding: "20px" }}>
					<h2 style={{ color: "#28a745", marginBottom: "10px" }}>
						✓ Verification Successful!
					</h2>
					<p style={{ marginBottom: "20px" }}>
						Your account is now active. Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="login">
			<span className="loginTitle">Verify Email</span>
			<form className="loginForm" onSubmit={handleSubmit}>
				{email && (
					<p style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
						A verification code has been sent to{" "}
						<strong>{email}</strong>
					</p>
				)}
				<label>Verification Code</label>
				<input
					type="text"
					placeholder=" enter the code from your email..."
					className="logInput"
					value={verificationCode}
					onChange={(e) => setVerificationCode(e.target.value)}
					disabled={isLoading}
				/>
				<button
					className="loginButton"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Verifying..." : "Verify Email"}
				</button>
				{error && <span className="logError">{errorText}</span>}
			</form>
			<button className="loginRegisterButton">
				<a
					href="#"
					className="buttonLink"
					onClick={(e) => {
						e.preventDefault();
						nav("/register", { replace: true });
					}}
				>
					Back to Registration
				</a>
			</button>
		</div>
	);
};

export default VerifyEmail;
