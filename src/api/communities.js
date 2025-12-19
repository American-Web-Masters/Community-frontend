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
 * Send a join request for a private community
 * @param {string} communityId - The ID of the community to request to join
 * @returns {Promise<Object>} Response containing success status
 */
export const sendJoinRequest = async (communityId) => {
  try {
    const response = await apiClient.post(`/communities/${communityId}/join-request`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Join request sent successfully!'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to send join request.'
      };
    }
  } catch (err) {
    console.error('Error sending join request:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to send join request. Please try again.'
    };
  }
};

/**
 * Fetch join requests for a private community
 * @param {string} communityId - The ID of the community
 * @returns {Promise<Object>} Response containing join requests data
 */
export const fetchJoinRequests = async (communityId) => {
  try {
    const response = await apiClient.get(`/communities/${communityId}/join-requests`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        joinRequests: response.data.data.joinRequests || response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch join requests.'
      };
    }
  } catch (err) {
    console.error('Error fetching join requests:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to fetch join requests. Please try again.'
    };
  }
};

/**
 * Handle join request (approve or reject)
 * @param {string} communityId - The ID of the community
 * @param {string} userId - The ID of the user who made the request
 * @param {string} action - The action to take ("approve" or "reject")
 * @returns {Promise<Object>} Response containing success status
 */
export const handleJoinRequest = async (communityId, userId, action) => {
  try {
    const response = await apiClient.post('/communities/handle-join-request', {
      communityId,
      userId,
      action
    });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || `Join request ${action}ed successfully!`
      };
    } else {
      return {
        success: false,
        error: response.data.message || `Failed to ${action} join request.`
      };
    }
  } catch (err) {
    console.error(`Error ${action}ing join request:`, err);
    return {
      success: false,
      error: err.response?.data?.message || `Failed to ${action} join request. Please try again.`
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
 * Update community details (About Us, Rules, Tags, Name, Organization, Cover Photo, Welcome Message)
 * @param {string} communityId - The ID of the community to update
 * @param {Object} updateData - Object containing description, rules, tags, name, affiliatedOrganization, coverPhoto, and welcomeMessage
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
    
    if (updateData.name) {
      formData.append('name', updateData.name);
    }
    
    if (updateData.affiliatedOrganization) {
      formData.append('affiliatedOrganization', updateData.affiliatedOrganization);
    }
    
    if (updateData.welcomeMessage) {
      formData.append('welcomeMessage', updateData.welcomeMessage);
    }
    
    if (updateData.coverPhoto instanceof File) {
      formData.append('coverPhoto', updateData.coverPhoto);
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

/**
 * Fetch reported prayers for a community
 * @param {string} communityId - Community ID to fetch reported prayers for
 * @returns {Promise<Object>} Response containing reported prayers data
 */
export const fetchReportedPrayers = async (communityId) => {
  try {
    const response = await apiClient.get(`/communities/${communityId}/reported-prayers`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (err) {
    console.error('Error fetching reported prayers:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to fetch reported prayers. Please try again.'
    };
  }
};

/**
 * Handle reported prayer (accept or reject)
 * @param {string} communityId - Community ID
 * @param {string} reportId - Report ID to handle
 * @param {string} action - Action to take ('accept' or 'reject')
 * @returns {Promise<Object>} Response from the API
 */
export const handleReportedPrayer = async (communityId, reportId, action) => {
  try {
    const response = await apiClient.post('/communities/handle-reported-prayer', {
      communityId,
      reportId,
      action
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (err) {
    console.error('Error handling reported prayer:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to handle reported prayer. Please try again.'
    };
  }
};

/**
 * Kick a member from a community
 * @param {string} communityId - Community ID
 * @param {string} memberId - Member ID to kick
 * @returns {Promise<Object>} Response from the API
 */
export const kickMember = async (communityId, memberId) => {
  try {
    const response = await apiClient.post('/communities/kick-member', {
      communityId,
      memberId
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Member kicked successfully'
    };
  } catch (err) {
    console.error('Error kicking member:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to kick member. Please try again.'
    };
  }
};

/**
 * Change a member's role in a community
 * @param {string} communityId - Community ID
 * @param {string} memberId - Member ID to change role for
 * @param {string} newRole - New role to assign ('moderator' or 'member')
 * @returns {Promise<Object>} Response from the API
 */
export const changeMemberRole = async (communityId, memberId, newRole) => {
  try {
    const response = await apiClient.post('/communities/change-member-role', {
      communityId,
      memberId,
      newRole
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Member role updated successfully'
    };
  } catch (err) {
    console.error('Error changing member role:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to change member role. Please try again.'
    };
  }
};

/**
 * Fetch approved communities for a specific user
 * @param {string} userId - The ID of the user to fetch communities for
 * @returns {Promise<Object>} Response containing user's approved communities
 */
export const fetchApprovedCommunitiesForUser = async (userId) => {
  try {
    const response = await apiClient.get(`/communities/approved-community/${userId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || []
      };
    } else {
      return {
        success: false,
        error: 'Failed to load communities.'
      };
    }
  } catch (err) {
    console.error('Error fetching user communities:', err);
    return {
      success: false,
      error: 'Failed to load communities. Please try again.'
    };
  }
};

/**
 * Toggle pin status for a prayer in a community
 * @param {string} communityId - The ID of the community
 * @param {string} prayerId - The ID of the prayer to pin/unpin
 * @returns {Promise<Object>} Response containing updated prayer data
 */
export const togglePrayerPin = async (communityId, prayerId) => {
  try {
    const response = await apiClient.post('/communities/toggle-pin', {
      communityId,
      prayerId
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling prayer pin:', error);
    throw error;
  }
};
