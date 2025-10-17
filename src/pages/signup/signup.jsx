import React, { useState } from 'react';
import { apiClient } from '../../api';

function Signup() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Prepare payload - remove empty fields
      const payload = {};
      Object.keys(formData).forEach(key => {
        if (formData[key].trim() !== '') {
          payload[key] = formData[key];
        }
      });

      const result = await apiClient.post('/api/v1/user/signup', payload);
      setResponse(result.data);
      console.log('Signup successful:', result);
    } catch (err) {
      setError(err.response?.data || err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillDummyData = (type) => {
    if (type === 'phone') {
      setFormData({
        firstname: 'Arham',
        lastname: 'Hasan',
        phone: '+923102647209',
        username: 'Arham071',
        password: 'Arham1234@',
        email: ''
      });
    } else {
      setFormData({
        firstname: 'Arham',
        lastname: 'Hasan',
        email: 'arhamhasan70@gmail.com',
        username: 'Arham071',
        password: 'Arham1234@',
        phone: ''
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Test Signup API</h2>
      
      {/* Quick fill buttons */}
      <div className="mb-4 space-x-2">
        <button
          type="button"
          onClick={() => fillDummyData('phone')}
          className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-600"
        >
          Fill Phone Data
        </button>
        <button
          type="button"
          onClick={() => fillDummyData('email')}
          className="px-3 py-1 bg-accent text-black rounded text-sm hover:bg-accent-600"
        >
          Fill Email Data
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData({
              firstname: '',
              lastname: '',
              phone: '',
              email: '',
              username: '',
              password: ''
            });
          }}
          className="btn-gradient text-sm"
        >
          Clear Form
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">First Name *</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+923102647209"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Test Signup'}
        </button>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
          <h3 className="font-semibold text-green-800">Success Response:</h3>
          <pre className="text-sm text-green-700 mt-1 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
          <h3 className="font-semibold text-red-800">Error Response:</h3>
          <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>API Endpoint:</strong> POST /api/v1/user/signup</p>
        <p><strong>Base URL:</strong> {apiClient.defaults.baseURL}</p>
      </div>
    </div>
  );
}

export default Signup;