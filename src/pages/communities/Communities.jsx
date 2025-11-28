import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, selectIsLoggedIn, clearUser } from "../../store/userSlice";
import Header from "../../components/ui/Header";
import BottomNavBar from "../../components/ui/BottomNavBar";
import CreateCommunityModal from "../../components/ui/CreateCommunityModal";
import { CommunityCard } from "./subcomponents";
import { fetchCommunities as apiFetchCommunities, joinCommunity as apiJoinCommunity } from "../../api";

const Communities = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("My Communities");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      setJoiningCommunityId(communityId);
      const response = await apiJoinCommunity(communityId);
      
      if (response.success) {
        // Update the community in the local state to reflect the join
        setCommunities(prevCommunities => 
          prevCommunities.map(community => 
            community._id === communityId || community.id === communityId
              ? { ...community, isMember: true, memberCount: (community.memberCount || 0) + 1 }
              : community
          )
        );
        
        // Optionally show success message
        console.log(response.message || 'Successfully joined community!');
      } else {
        console.error('Failed to join community:', response.error);
        setError(response.error);
      }
    } catch (err) {
      console.error('Error joining community:', err);
      setError('Failed to join community. Please try again.');
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleViewCommunity = (communityId) => {
    navigate(`/communities/${communityId}`);
  };

  const handleCreateCommunity = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiFetchCommunities(user);
      
      if (response.success) {
        setCommunities(response.data);
        console.log('Fetched communities:', response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchCommunities().finally(() => setLoading(false));
  }, []);

  const handleCommunityCreated = (newCommunity) => {
    fetchCommunities();
    setIsCreateModalOpen(false);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-background overflow-x-hidden">
      {/* Header */}
      <div className="mt-2">
        <Header
          showNotification={true}
          showFilter={true}
          showSearch={true}
          onLogoutClick={handleLogout}
          onNotificationClick={() => console.log("Notification clicked")}
          onFilterClick={() => console.log("Filter clicked")}
          onSearchClick={() => console.log("Search clicked")}
        />
      </div>

      {/* Communities Section */}
      <div className="px-4 mt-6">
          {/* Header with tabs and create button in same row */}
          <div className="flex items-center justify-between mb-6">
            {/* Tab Navigation */}
            <div className="flex items-center bg-white/90 rounded-full p-0.5 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("My Communities")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "My Communities"
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setActiveTab("Discovery Communities")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "Discovery Communities"
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                Discovery Communities
              </button>
            </div>

            {/* Create New Community Button */}
            <button
              onClick={handleCreateCommunity}
              className="btn-blue-gradient cursor-pointer text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center space-x-3 shadow-lg"
            >
              <span>Create New Community</span>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold relative -top-0.5">+</span>
              </div>
            </button>
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-gray-600">Loading communities...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600 text-center">
                <p className="mb-2">{error}</p>
                <button 
                  onClick={fetchCommunities}
                  className="text-blue-600 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : activeTab === "My Communities" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.filter(community => community.isMember || community.isOwner).length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>You haven't joined any communities yet.</p>
                  <p className="text-sm mt-2">Join communities or create your own!</p>
                </div>
              ) : (
                communities
                  .filter(community => community.isMember || community.isOwner)
                  .map((community) => (
                    <CommunityCard
                      key={community._id || community.id}
                      id={community._id || community.id}
                      name={community.name}
                      description={community.description}
                      category={community.tags || []}
                      status={community.isOwner ? "Owner" : (community.privacyLevel === "private" ? "Private" : "Public")}
                      members={community.memberCount}
                      avatar={community.coverPhoto}
                      wallAssociation={community.wallAssociation}
                      isJoined={true}
                      isLoading={joiningCommunityId === (community._id || community.id)}
                      onJoinClick={handleJoinCommunity}
                      onViewClick={handleViewCommunity}
                    />
                  ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities?.filter(community => !community.isMember && !community.isOwner).length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>No communities available to discover.</p>
                  <p className="text-sm mt-2">Create the first community!</p>
                </div>
              ) : (
                communities
                  .filter(community => !community.isMember && !community.isOwner)
                  .map((community) => (
                    <CommunityCard
                      key={community._id || community.id}
                      id={community._id || community.id}
                      name={community.name}
                      description={community.description}
                      category={community.tags || []}
                      status={community.privacyLevel === "private" ? "Private" : "Public"}
                      members={community.memberCount}
                      wallAssociation={community.wallAssociation}
                      avatar={community.coverPhoto}
                      isJoined={false}
                      isLoading={joiningCommunityId === (community._id || community.id)}
                      onJoinClick={handleJoinCommunity}
                      onViewClick={handleViewCommunity}
                    />
                  ))
              )}
            </div>
          )}
      </div>

      {/* Bottom padding for bottom navigation */}
      <div className="pb-24"></div>
      
      <BottomNavBar />
      
      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCommunityCreated}
      />
    </div>
  );
};

export default Communities;