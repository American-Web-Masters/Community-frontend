import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Home from "../pages/home/Home"
import Communities from "../pages/communities/Communities"
import Create from "../pages/create/Create"
import Messages from "../pages/messages/Messages"
import Profile from "../pages/profile/Profile"
import ProtectedRoute from "../components/ProtectedRoute"
import PublicRoute from "../components/PublicRoute"
import Login from "../pages/login/Login";
import Survey from "../pages/Splash Pages/Survey";
import Tour from "../pages/Splash Pages/Tour";

const Routes = () =>{
    return(
        <AppRoutes>
            <Route
            path="/landing"
            element={
                <PublicRoute>
                    <LandingPage/>
                </PublicRoute>
            }
            />
            <Route
            path="/signup"
            element={
                <PublicRoute>
                    <SignUp/>
                </PublicRoute>
            }
            />
            <Route
            path="/login"
            element={
                <PublicRoute>
                    <Login/>
                </PublicRoute>
            }
            />
            <Route
            path="/"
            element={
                <ProtectedRoute>
                    <Home/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/survey"
            element={
                <ProtectedRoute>
                    <Survey/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/tour"
            element={
                <ProtectedRoute>
                    <Tour/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/communities"
            element={
                <ProtectedRoute>
                    <Communities/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/create"
            element={
                <ProtectedRoute>
                    <Create/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/messages"
            element={
                <ProtectedRoute>
                    <Messages/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/profile"
            element={
                <ProtectedRoute>
                    <Profile/>
                </ProtectedRoute>
            }
            />
        </AppRoutes>
    )
}
export default Routes;