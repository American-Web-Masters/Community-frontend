import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { validateInvite, acceptInvite } from '../../api/invites';
import toast from 'react-hot-toast';

const InviteValidation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    console.log('InviteValidation mounted with token:', token);
    console.log('Current user:', user);
    
    if (token) {
      validateInviteToken();
    } else {
      setError('Invalid invite link');
      setLoading(false);
    }
  }, [token]);

  // Check if user just logged in and this was a pending invite
  useEffect(() => {
    console.log('Checking pending invite effect:', { user: !!user, token, pendingInvite: localStorage.getItem('pendingInvite'), inviteData: !!inviteData });
    
    if (user && token && localStorage.getItem('pendingInvite') === token) {
      // User just logged in after clicking invite, ensure modal is shown
      console.log('User logged in, continuing with invite process');
      if (inviteData) {
        console.log('Setting show join modal to true');
        setShowJoinModal(true);
      }
    }
  }, [user, token, inviteData]);

  const validateInviteToken = async () => {
    try {
      setValidating(true);
      setLoading(true);
      
      const response = await validateInvite(token);
      
      if (response.success && response.data.valid) {
        setInviteData(response.data);
        // Always show modal when we have valid data
        setShowJoinModal(true);
      } else {
        setError('This invite link is invalid or has expired');
      }
    } catch (err) {
      console.error('Error validating invite:', err);
      setError('Failed to validate invite link');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    // Check if user is logged in
    if (!user) {
      // Store the current invite token in localStorage to return after login
      localStorage.setItem('pendingInvite', token);
      // Redirect to login page
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      
      const response = await acceptInvite(token);
      
      if (response.success) {
        toast.success('Successfully joined the community!');
        // Remove pending invite from localStorage
        localStorage.removeItem('pendingInvite');
        // Redirect to the community page using the community ID from invite data
        navigate(`/communities/${inviteData.community.id}`);
      } else {
        toast.error(response.error || 'Failed to join community');
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      toast.error('Failed to join community. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCloseModal = () => {
    setShowJoinModal(false);
    navigate('/');
  };

  // Loading state
  if (loading || validating) {
    return (
      <div className="min-h-screen light-background flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Validating Invite
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your invitation...
          </p>
        </div>
      </div>
    );
  }

  // Error state (404-like page)
  if (error) {
    return (
      <div className="min-h-screen light-background flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center max-w-md w-full mx-4">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Invite Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-blue-gradient text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Success state with join modal
  return (
    <div className="min-h-screen light-background flex items-center justify-center">
      {showJoinModal && inviteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full">
            {/* Community Icon/Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">
                {inviteData.community.name && inviteData.community.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Modal Content */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Join Community
            </h2>
            <p className="text-gray-600 mb-2">
              You've been invited to join
            </p>
            <h3 className="text-xl font-semibold text-blue-600 mb-6">
              {inviteData.community.name}
            </h3>
            
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  You need to log in to join this community
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleJoinCommunity}
                disabled={joining}
                className="btn-blue-gradient text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <span>{user ? 'Join Community' : 'Login & Join'}</span>
                )}
              </button>
              
              <button
                onClick={handleCloseModal}
                disabled={joining}
                className="text-gray-600 px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteValidation;