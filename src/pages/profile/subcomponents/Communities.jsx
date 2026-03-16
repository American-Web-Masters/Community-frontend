import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";

const Communities = ({ userProfile }) => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // 'All', 'My Communities', 'Joined Communities'

  console.log(userProfile);
  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (!userProfile?.user?._id) return;

      try {
        setLoading(true);
        // Using the requested endpoint pattern: /api/v1/communities/user/:userId
        const response = await apiClient.get(
          `/communities/user/${userProfile?.user?._id}`,
        );
        console.log(response);
        if (response.data?.success) {
          setCommunities(response.data.data.communities || []);
        }
      } catch (error) {
        console.error("Error fetching user communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCommunities();
  }, [userProfile?._id]);

  const filteredCommunities = communities.filter((community) => {
    if (filter === "All") return true;

    // Check if user is creator
    const isOwner =
      community.createdBy?._id === userProfile?.user?._id ||
      community.createdBy === userProfile?.user?._id;

    if (filter === "My Communities") {
      return isOwner;
    }

    if (filter === "Joined Communities") {
      return !isOwner; // Joined but not created by them
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-md:px-3 mb-8">
      {/* Header & Filter */}
      <div className="mb-6">
        {/* Mobile: full-width horizontal tabs (like Profile tabs) */}
        <div className="flex sm:hidden w-full">
          <div className="flex items-center bg-white/90 rounded-full p-1 backdrop-blur-sm w-full overflow-x-auto">
            {[
              { key: "All", label: "All" },
              { key: "My Communities", label: "My Communities" },
              { key: "Joined Communities", label: "Joined" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex-1 py-2.5 px-3 rounded-full cursor-pointer text-sm font-medium transition-all duration-200 text-center whitespace-nowrap ${
                  filter === t.key
                    ? "btn-blue-gradient text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tablet/Desktop: dropdown (current design) */}
        <div className="hidden sm:flex justify-end">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-7 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              <option value="All">All</option>
              <option value="My Communities">My Communities</option>
              <option value="Joined Communities">Joined Communities</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filteredCommunities.length === 0 ? (
        <div className="text-center py-16 bg-blue-50/50 rounded-3xl border border-blue-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-3xl">🏘️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No Communities Found
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {filter === "All"
              ? "You haven't joined or created any communities yet."
              : `You don't have any ${filter.toLowerCase()} at the moment.`}
          </p>
          {filter === "All" && (
            <button
              onClick={() => navigate("/communities")}
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Explore Communities
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredCommunities.map((community) => (
            <div
              key={community._id}
              className="bg-[#f0f7ff] rounded-3xl p-5 transition-all duration-300 hover:shadow-md border border-blue-50/50 flex flex-col h-full"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 shadow-inner">
                    {community.coverPhoto ? (
                      <img
                        src={community.coverPhoto}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-xl">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3 className="font-bold text-[#1e293b] line-clamp-1">
                      {community.name}
                    </h3>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4 mt-2">
                      {/* Always show privacy level first */}
                      <span className="bg-[#e2e8f0] text-[#475569] text-xs px-3 py-1 rounded-full font-medium capitalize">
                        {community.privacyLevel}
                      </span>

                      {community.tags?.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#e2e8f0] text-[#475569] text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {community.tags?.length > 2 && (
                        <span className="bg-[#e2e8f0] text-[#475569] text-xs px-2 py-1 rounded-full font-medium">
                          +{community.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wall Badge */}
                {community.wallAssociation && (
                  <div className="btn-blue-gradient text-white text-xs px-4 py-1.5 rounded-full font-medium shadow-sm whitespace-nowrap">
                    {community.wallAssociation}
                  </div>
                )}
              </div>

              {/* Spacer to push member count and button to bottom */}
              <div className="flex-grow"></div>

              {/* Members Count */}
              <div className="flex items-center text-[#64748b] text-sm mb-5 font-medium ml-20">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {community.memberCount >= 1000
                  ? `${(community.memberCount / 1000).toFixed(1)}k`
                  : community.memberCount}{" "}
                members
              </div>

              {/* View Button */}
              <button
                onClick={() => navigate(`/communities/${community._id}`)}
                className="w-full py-2 bg-white text-gray-500 rounded-full font-semibold border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communities;
