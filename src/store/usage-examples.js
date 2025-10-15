// Simple usage examples for Redux

import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/userSlice';

// In any component:

// Get user data
const { user, isLoggedIn } = useSelector((state) => state.user);

// Dispatch actions
const dispatch = useDispatch();

// Login user
dispatch(setUser({
  id: 123,
  name: 'John Doe',
  email: 'john@example.com'
}));

// Logout user
dispatch(clearUser());

// Example component:
// function UserProfile() {
//   const { user, isLoggedIn } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//
//   const handleLogin = (userData) => {
//     dispatch(setUser(userData));
//   };
//
//   const handleLogout = () => {
//     dispatch(clearUser());
//   };
//
//   return (
//     <div>
//       {isLoggedIn ? (
//         <div>
//           <h1>Welcome, {user.name}!</h1>
//           <button onClick={handleLogout}>Logout</button>
//         </div>
//       ) : (
//         <div>Please login</div>
//       )}
//     </div>
//   );
// }