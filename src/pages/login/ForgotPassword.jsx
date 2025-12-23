import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import { forgotPassword } from '../../api/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      console.log(res);
      if (res.data?.status === 'success') {
        setSuccess(res.data?.message || 'If an account exists, a reset link has been sent to your email.');
        // User can manually click "Back to Login" when ready
      } else {
        setError(res.data?.message || 'Unable to send reset email.');
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mt-12 shadow-2xl min-h-[360px] flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Forgot Password</h2>
                  <p className="text-gray-600 text-sm">Enter your email to receive a password reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="!rounded-3xl"
                  />

                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  {success && <div className="text-green-600 text-sm text-center">{success}</div>}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${!loading ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword;
