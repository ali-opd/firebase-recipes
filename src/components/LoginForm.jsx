import { useState } from 'react';
import FirebaseAuthService from '../FirebaseAuthService';

export default function LoginForm({ existingUser }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await FirebaseAuthService.loginUser(username, password);
      setUserName('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSendResetPasswordEmail = async () => {
    if (!username) {
      alert('Missing username!');
      return;
    }

    try {
      await FirebaseAuthService.sendPasswordResetEmail(username);
      alert('sent the password reset email');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await FirebaseAuthService.loginWithGoogle();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => FirebaseAuthService.logoutUser();
  return (
    <div className='login-form-container'>
      {existingUser ? (
        <div className='row'>
          <h3>Welcome, {existingUser.email}</h3>
          <button
            className='primary-button'
            onClick={handleLogout}
            type='button'
          >
            Logout
          </button>
        </div>
      ) : (
        <form className='login-form' onSubmit={(e) => handleSubmit(e)}>
          <label className='input-label login-label'>
            Username (email):
            <input
              className='input-text'
              type='email'
              required
              value={username}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>
          <label className='input-label login-label'>
            Password:
            <input
              className='input-text'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className='button-box'>
            <button className='primary-button'>Login</button>
            <button
              type='button'
              onClick={handleSendResetPasswordEmail}
              className='primary-button'
            >
              Reset Password
            </button>
            <button
              type='button'
              onClick={handleLoginWithGoogle}
              className='primary-button'
            >
              Login with Google
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
