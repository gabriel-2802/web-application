import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../constants/api';

const Register: FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminRegisterCode, setAdminRegisterCode] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);
    try {
      const payload: any = {
        username: username,
        email: email,
        password: password,
      };
      
      // Include adminRegisterCode if provided (to register as WRITER)
      if (adminRegisterCode.trim()) {
        payload.adminRegisterCode = parseInt(adminRegisterCode, 10);
      }

      await axios.post(AUTH_ENDPOINTS.REGISTER, payload);

      // Redirect to email verification page after successful registration
      nav('/verify-email', { state: { email: email } });
    } catch (error: any) {
      setError(true);
      setErrorText(error.response?.data || 'Registration failed');
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
        <label>Writer Code (Optional)</label>
        <input
          type="text"
          placeholder=" enter code to register as writer..."
          className="logInput"
          onChange={(e) => setAdminRegisterCode(e.target.value)}
        />
        <button className="loginButton" type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
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
