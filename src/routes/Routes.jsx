import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Login from "../pages/login/Login";

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
        </AppRoutes>
    )
}
export default Routes;