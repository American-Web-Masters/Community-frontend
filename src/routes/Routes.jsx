import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Home from "../pages/home/Home"
import ProtectedRoute from "../components/ProtectedRoute"
import PublicRoute from "../components/PublicRoute"
import Login from "../pages/login/Login";

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
        </AppRoutes>
    )
}
export default Routes;