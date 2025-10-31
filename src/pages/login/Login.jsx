
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import { FaUser, FaLock, FaChevronLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { apiClient } from '../../api';
import { setUser } from '../../store/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        
        // Navigate to home page
        navigate('/');
        
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className="min-h-screen relative ">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      ></div>
      <div className="flex items-center justify-center py-10 lg:py-16 ">
        <div className="flex items-center justify-center max-w-5xl w-full max-sm:w-11/12 ">
          <div className="w-full max-w-lg transition-all duration-500 ease-in-out">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl min-h-[500px] flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
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
                  <div className="relative">
                    <Input
                      className="!rounded-3xl pr-12"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      error={errors.password}
                      icon={FaLock}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 focus:outline-none"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
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
                      className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-shadow duration-200"
                      onClick={() => {}}
                    >
                      <FcGoogle className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:shadow-md transition-shadow duration-200"
                      onClick={() => {}}
                    >
                      <FaApple className="w-6 h-6 text-black" />
                    </button>
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
                  
                  {/* Sign Up Link */}
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
                      >
                        Sign up
                      </button>
                    </p>
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