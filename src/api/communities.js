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

/**
 * Fetch pending posts for a community (moderator queue)
 * @param {string} communityId - The ID of the community
 * @returns {Promise<Object>} Response containing pending posts data
 */
export const fetchPendingPosts = async (communityId) => {
  try {
    const response = await apiClient.get(`/communities/${communityId}/pending-posts`);
    console.log('Pending posts response:', response.data);
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to load pending posts.'
      };
    }
  } catch (err) {
    console.error('Error fetching pending posts:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to load pending posts. Please try again.'
    };
  }
};

/**
 * Handle pending post approval/rejection
 * @param {string} postId - The ID of the post to handle
 * @param {string} action - 'approve' or 'reject'
 * @param {string} [reason] - Optional reason for rejection
 * @returns {Promise<Object>} Response containing success status
 */
export const handlePendingPost = async (communityId, postId, action, reason = null) => {
  try {
    const payload = {
      communityId: communityId,
      postId,
      action
    };
    
    if (action === 'reject' && reason) {
      payload.reason = reason;
    }
    
    const response = await apiClient.post('/communities/handle-pending-post', payload);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || `Post ${action}d successfully!`
      };
    } else {
      return {
        success: false,
        error: response.data.message || `Failed to ${action} post.`
      };
    }
  } catch (err) {
    console.error(`Error ${action}ing post:`, err);
    return {
      success: false,
      error: err.response?.data?.message || `Failed to ${action} post. Please try again.`
    };
  }
};

/**
 * Update community details (About Us, Rules, Tags)
 * @param {string} communityId - The ID of the community to update
 * @param {Object} updateData - Object containing description, rules, and tags
 * @returns {Promise<Object>} Response containing success status
 */
export const updateCommunityDetails = async (communityId, updateData) => {
  try {
    const formData = new FormData();
    
    if (updateData.description) {
      formData.append('description', updateData.description);
    }
    
    if (updateData.rules && Array.isArray(updateData.rules)) {
      formData.append('communityRules', updateData.rules.join(','));
    }
    
    if (updateData.tags && Array.isArray(updateData.tags)) {
      formData.append('tags', updateData.tags.join(','));
    }
    
    const response = await apiClient.patch(`/communities/${communityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Community updated successfully!'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to update community.'
      };
    }
  } catch (err) {
    console.error('Error updating community:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to update community. Please try again.'
    };
  }
};
