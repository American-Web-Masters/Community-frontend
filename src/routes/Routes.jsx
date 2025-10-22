import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Home from "../pages/home/Home"
import ProtectedRoute from "../components/ProtectedRoute"

const Routes = () =>{
    return(
        <AppRoutes>
            <Route
            path="/"
            element={
                <LandingPage/>
            }
            />
            <Route
            path="/signup"
            element={
                <SignUp/>
            }
            />
            <Route
            path="/home"
            element={
                <ProtectedRoute>
                    <Home/>
                </ProtectedRoute>
            }
            />
            {/* <Route
            path="/login"
            element={
                <Login/>
            }
            /> */}
        </AppRoutes>
    )
}
export default Routes;