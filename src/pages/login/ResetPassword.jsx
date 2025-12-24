import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Input from '../../components/ui/Input';
import { resetPassword } from '../../api/auth';
import { setUser } from '../../store/userSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, { password });
      if (res.data?.status === 'success') {
        // Backend sets JWT cookie and returns user data
        const { user } = res.data.data || {};
        
        if (user) {
          // Save user data to Redux store for automatic login
          dispatch(setUser(user));
          console.log('Password reset successful, user logged in automatically');
        }
        
        // Navigate to home page
        navigate('/', { replace: true });
      } else {
        setError(res.data?.message || 'Unable to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/background.png)' }} />
      <div className="flex items-center justify-center py-10 lg:py-16">
        <div className="flex items-center justify-center max-w-5xl w-full max-sm:w-11/12">
          <div className="w-full max-w-lg transition-all duration-500 ease-in-out">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mt-12 shadow-2xl min-h-[420px] flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Password</h2>
                  <p className="text-gray-600 text-sm">Enter your new password to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="!rounded-3xl"
                  />

                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="!rounded-3xl"
                  />

                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${!loading ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      {loading ? 'Saving...' : 'Set new password'}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <button type="button" onClick={() => navigate('/login')} className="text-primary-500 hover:text-primary-600 font-semibold">Back to Login</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
