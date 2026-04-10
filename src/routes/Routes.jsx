import { Route, Routes as AppRoutes } from "react-router-dom";
import SignUp from "../pages/signup/signup"
import LandingPage from "../pages/landing_page/LandingPage"
import Home from "../pages/home/Home"
import Communities from "../pages/communities/Communities"
import CommunityDetails from "../pages/communities/CommunityDetails"
import Create from "../pages/create/Create"
import Messages from "../pages/messages/Messages"
import Profile from "../pages/profile/Profile"
import ProtectedRoute from "../components/ProtectedRoute"
import PublicRoute from "../components/PublicRoute"
import Login from "../pages/login/Login";
import ForgotPassword from "../pages/login/ForgotPassword";
import ResetPassword from "../pages/login/ResetPassword";
import Survey from "../pages/Splash Pages/Survey";
import Tour from "../pages/Splash Pages/Tour";
import MyPrayers from "../pages/my_prayers/MyPrayers";
import UpdatePrayers from "../pages/update_prayers/UpdatePrayers";
import AnsweredPrayers from "../pages/answered_prayer/AnsweredPrayers";
import InviteValidation from "../pages/invite/InviteValidation";
import CommunitySupport from "../pages/support/CommunitySupport";
import UserSupport from "../pages/support/UserSupport";
import PaymentSuccess from "../pages/support/PaymentSuccess";
import DemoSubscriptionManagement from "../pages/support/DemoSubscriptionManagement";
// import SubscriptionManagement from "../pages/support/SubscriptionManagement"; // Moved to Profile page
import StripeOnboardingSuccess from "../pages/communities/StripeOnboardingSuccess";
import StripeOnboardingRefresh from "../pages/communities/StripeOnboardingRefresh";
import { UserStripeOnboardingRefresh, UserStripeOnboardingSuccess } from "../pages/profile/subcomponents";
import Settings from "../pages/settings/Settings";
import HelpCenter from "../pages/help_center/HelpCenter";

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
            path="/forgot-password"
            element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            }
            />
            <Route
            path="/reset-password/:token"
            element={
                <PublicRoute>
                    <ResetPassword />
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
            path="/communities/:id"
            element={
                <ProtectedRoute>
                    <CommunityDetails/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/communities/:id/support"
            element={
                <ProtectedRoute>
                    <CommunitySupport/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/community/:communityId/stripe/success"
            element={
                <ProtectedRoute>
                    <StripeOnboardingSuccess/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/community/:communityId/stripe/refresh"
            element={
                <ProtectedRoute>
                    <StripeOnboardingRefresh/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/user/stripe/success"
            element={
                <ProtectedRoute>
                    <UserStripeOnboardingSuccess/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/user/stripe/refresh"
            element={
                <ProtectedRoute>
                    <UserStripeOnboardingRefresh/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/payment-success"
            element={
                <ProtectedRoute>
                    <PaymentSuccess/>
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
            path="/profile/:username"
            element={
                <ProtectedRoute>
                    <Profile/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/profile/:username/support"
            element={
                <ProtectedRoute>
                    <UserSupport/>
                </ProtectedRoute>
            }
            />
            <Route
            path="/profile/:username/settings"
            element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            }
            />
            <Route
            path="/help-center"
            element={
                <ProtectedRoute>
                    <HelpCenter />
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
            <Route
            path="/invite/:token"
            element={
                <InviteValidation/>
            }
            />
            <Route
            path="/demo-subscriptions"
            element={
                <ProtectedRoute>
                    <DemoSubscriptionManagement/>
                </ProtectedRoute>
            }
            />
            {/* 
            <Route
            path="/my-subscriptions"
            element={
                <ProtectedRoute>
                    <SubscriptionManagement/>
                </ProtectedRoute>
            }
            />
            */}
        </AppRoutes>
    )
}
export default Routes;