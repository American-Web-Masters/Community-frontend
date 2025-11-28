import apiClient  from './client.js';

/**
 * Fetch all communities from the API
 * @param {Object} user - Current user object to determine membership status
 * @returns {Promise<Object>} Response containing communities data
 */
export const fetchCommunities = async (user) => {
  try {
    const response = await apiClient.get('/communities');
    if (response.data.success) {
      const communitiesData = response.data.data.communities;
      
      // Process communities to add user membership status
      const processedCommunities = communitiesData.map(community => {
        const isOwner = community.createdBy._id === user?._id;
        const isMember = community.members.some(member => 
          member.user._id === user?._id
        );
        
        return {
          ...community,
          isOwner,
          isMember,
          memberCount: community.memberCount || community.members.length
        };
      });
      
      return {
        success: true,
        data: processedCommunities
      };
    } else {
      return {
        success: false,
        error: 'Failed to load communities.'
      };
    }
  } catch (err) {
    console.error('Error fetching communities:', err);
    return {
      success: false,
      error: 'Failed to load communities. Please try again.'
    };
  }
};

/**
 * Fetch a specific community by ID from the API
 * @param {string} communityId - The ID of the community to fetch
 * @param {Object} user - Current user object to determine membership status
 * @returns {Promise<Object>} Response containing community details
 */
export const fetchCommunityById = async (communityId, user) => {
  try {
    const response = await apiClient.get(`/communities/${communityId}`);
    if (response.data.success) {
      const community = response?.data?.data?.community;
      
      // Process community to add user membership status
      const isOwner = community.createdBy._id === user?._id;
      const isMember = community.members.some(member => 
        member.user._id === user?._id
      );
      
      return {
        success: true,
        data: {
          ...community,
          isOwner,
          isMember,
          memberCount: community.memberCount || community.members.length
        }
      };
    } else {
      return {
        success: false,
        error: 'Failed to load community details.'
      };
    }
  } catch (err) {
    console.error('Error fetching community details:', err);
    return {
      success: false,
      error: 'Failed to load community details. Please try again.'
    };
  }
};

/**
 * Join a community by ID
 * @param {string} communityId - The ID of the community to join
 * @returns {Promise<Object>} Response containing success status
 */
export const joinCommunity = async (communityId) => {
  try {
    const response = await apiClient.post(`/communities/${communityId}/join`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Successfully joined community!'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to join community.'
      };
    }
  } catch (err) {
    console.error('Error joining community:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to join community. Please try again.'
    };
  }
};
