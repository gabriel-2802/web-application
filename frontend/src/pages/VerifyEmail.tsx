import { FC, useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/loading.css';
import { AUTH_ENDPOINTS } from '../constants/api';

const VerifyEmail: FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setErrorMessage('No verification token provided');
          setLoading(false);
          return;
        }

        // Call the verify email endpoint
        await axios.get(AUTH_ENDPOINTS.VERIFY_EMAIL, {
          params: { token },
        });

        setVerified(true);
        setLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          nav('/login', { replace: true });
        }, 3000);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data || 'Email verification failed. Token may have expired.'
        );
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, nav, location.state]);

  if (loading) {
    return (
      <div className="loading">
        <span>Verifying your email...</span>
        <div className="loadingSpinner"></div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="loading">
        <div className="verifySuccess">
          <h2>✓ Email Verified Successfully!</h2>
          <p>Your account is now active. Redirecting to login...</p>
          <div className="loadingSpinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading">
      <div className="verifyError">
        <h2>✗ Verification Failed</h2>
        <p>{errorMessage}</p>
        <button
          className="loginButton"
          onClick={() => nav('/register', { replace: true })}
          style={{ marginTop: '20px' }}
        >
          Back to Registration
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
