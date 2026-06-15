
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import { FaUser, FaLock, FaChevronLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { apiClient } from '../../api';
import { setUser, selectIsLoggedIn, selectUser } from '../../store/userSlice';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('User is already logged in, redirecting to home');
    const target = user?.role === 'admin' ? '/dashboard' : '/';
    navigate(target, { replace: true });
    }
  }, [isLoggedIn, navigate, user?.role]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const payload = {
        username: formData.username,
        password: formData.password
      };

      console.log('Attempting login with:', { username: payload.username });

      const response = await apiClient.post('/users/login', payload);
      
      if (response.data.status === 'success') {
        const { user } = response.data.data;
        
        console.log('Login successful!');
        console.log('User data received:', user);
        console.log('User ID:', user._id);
        
        // Save user data to Redux store and localStorage
        dispatch(setUser(user));
        
        console.log('User data saved to Redux and localStorage');
        
        // Check for pending invite
        const pendingInvite = localStorage.getItem('pendingInvite');
        console.log('Checking for pending invite:', pendingInvite);
        
        if (pendingInvite) {
          console.log('Found pending invite, navigating to:', `/invite/${pendingInvite}`);
          // Navigate back to invite page
          navigate(`/invite/${pendingInvite}`);
        } else {
          const target = user?.role === 'admin' ? '/dashboard' : '/';
          console.log('No pending invite found, navigating to:', target);
          navigate(target);
        }
        
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setErrors({});
    try {
      console.log('Attempting Google login');
      const response = await apiClient.post('/users/google-login', {
        access_token: tokenResponse.access_token
      });
      
      if (response.data.status === 'success') {
        const { user } = response.data.data;
        dispatch(setUser(user));
        
        const pendingInvite = localStorage.getItem('pendingInvite');
        if (pendingInvite) {
          navigate(`/invite/${pendingInvite}`);
        } else {
          const target = user?.role === 'admin' ? '/dashboard' : '/';
          navigate(target, { replace: true });
        }
      } else {
        throw new Error(response.data?.message || 'Google Login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      let errorMessage = 'Google Login failed. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setErrors({ submit: 'Google Login was cancelled or failed.' })
  });

  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className="min-h-screen relative ">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      ></div>
      <div className="flex items-center justify-center pt-10 lg:pt-12 transform lg:scale-95 origin-top">
        <div className="flex items-center justify-center max-w-5xl w-full max-sm:w-11/12">
          <div className="w-full max-w-lg transition-all duration-500 ease-in-out">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl min-h-[500px] flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full ">
                    <FaUser className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back!</h2>
                  <p className="text-gray-600 text-sm">Login to your account</p>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    className="!rounded-3xl"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                    error={errors.username}
                    icon={FaUser}
                    required
                  />
                  <Input
                    className="!rounded-3xl pr-12"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    error={errors.password}
                    icon={FaLock}
                    required
                    endContent={
                      <button
                        type="button"
                        tabIndex={-1}
                        className="text-gray-500 focus:outline-none cursor-pointer hover:text-gray-700 transition-colors duration-200 p-2"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    }
                  />
                  {/* Or Continue With (line breaks left and right so the line "disappears" where text is) */}
                  <div className="my-2">
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300" />
                      <div className="mx-4 text-sm text-gray-500 whitespace-nowrap">or Continue with</div>
                      <div className="flex-1 border-t border-gray-300" />
                    </div>
                  </div>
                  {/* OAuth Options */}
                  <div className="flex gap-4 justify-center mb-4">
                    <button
                      type="button"
                      className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => googleLogin()}
                    >
                      <FcGoogle className="w-6 h-6" />
                    </button>
                    {/* <button
                      type="button"
                      className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => {}}
                    >
                      <FaApple className="w-6 h-6 text-black" />
                    </button> */}
                  </div>
                  {/* Error Message */}
                  {errors.submit && (
                    <div className="text-red-500 text-sm text-center mb-4">
                      {errors.submit}
                    </div>
                  )}
                  {/* Navigation Buttons */}
                  <div className="flex gap-4">
                    {/* <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200"
                      disabled={loading}
                    >
                      <FaChevronLeft className="w-4 h-4 text-gray-600" />
                    </button> */}
                    <button
                      type="submit"
                      disabled={!isFormValid || loading}
                      className={`
                        flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
                        ${isFormValid && !loading
                          ? 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-400 cursor-not-allowed opacity-60'
                        }
                      `}
                    >
                      {loading ? 'Logging In...' : 'Login'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 max-sm:flex-col max-sm:gap-2">
                    <div className="text-sm">
                      <button type="button" onClick={() => navigate('/forgot-password')} className="text-gray-800 cursor-pointer hover:text-gray-900 hover:underline font-semibold">Forgot password?</button>
                    </div>
                    {/* Sign Up Link */}
                    <div>
                      <p className="text-gray-800 text-sm">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/signup')}
                          className="text-gray-800 hover:text-gray-900 hover:underline cursor-pointer font-semibold transition-colors duration-200"
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
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

export default Login;