import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Login from "../pages/login/Login";
import Survey from "../pages/Splash Pages/Survey";
import Tour from "../pages/Splash Pages/Tour";

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
            path="/login"
            element={
                <Login/>
            }
            />
            <Route
            path="/survey"
            element={
                <Survey/>
            }
            />
            <Route
            path="/tour"
            element={
                <Tour/>
            }
            />
        </AppRoutes>
    )
}
export default Routes;