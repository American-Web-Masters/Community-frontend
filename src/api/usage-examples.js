// Simple usage examples

import { apiClient } from '../api';

// In your components, pages, or Redux store:

// GET request
const users = await apiClient.get('/admin/users');

// POST request  
const newUser = await apiClient.post('/admin/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await apiClient.put('/admin/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await apiClient.delete('/admin/users/123');

// With query parameters
const filteredUsers = await apiClient.get('/admin/users', {
  params: { page: 1, limit: 10 }
});

// In React component example:
// const fetchUsers = async () => {
//   try {
//     const response = await apiClient.get('/admin/users');
//     setUsers(response.data);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };