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
