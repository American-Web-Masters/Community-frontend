import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, selectIsLoggedIn } from "./store/userSlice";
import { apiClient } from "./api";
import Routes from "./routes/Routes";
import store from "./store";

function AuthenticatedApp() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsLoggedIn);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(isAuthenticated, "isAuthenticated before checkAuth");
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/users/auth-check');
        const user = response.data.data?.user;
        console.log("User found:", user);
        if(user){
          dispatch(setUser(user));
          console.log("User set in Redux");
        }
      } catch (error) {
        // User not authenticated, that's fine
        console.log("Not authenticated:", error.message);
        dispatch(clearUser()); // Explicitly clear user
      } finally {
        setLoading(false);
        console.log("Loading set to false");
      }
    };

    checkAuth();
  }, [dispatch]);

  console.log(isAuthenticated, "isAuthenticated after checkAuth");
  console.log("Current loading state:", loading);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering routes with isAuthenticated:", isAuthenticated);

  return (
    <Router>
      <Routes/>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        ></Toaster>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthenticatedApp />
    </Provider>
  );
}

export default App
