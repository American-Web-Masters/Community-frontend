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
import MyPrayers from "../pages/my_prayers/MyPrayers";
import UpdatePrayers from "../pages/update_prayers/UpdatePrayers";
import AnsweredPrayers from "../pages/answered_prayer/AnsweredPrayers";

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
            path="/survey"
            element={
                <ProtectedRoute>
                    <Survey/>
                </ProtectedRoute>
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
            <Route
            path="/my-prayers"
            element={
                <ProtectedRoute>
                    <MyPrayers/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/updates"
            element={
                <ProtectedRoute>
                    <UpdatePrayers/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/answered"
            element={
                <ProtectedRoute>
                    <AnsweredPrayers/>
                </ProtectedRoute>
            }
            />
        </AppRoutes>
    )
}
export default Routes;