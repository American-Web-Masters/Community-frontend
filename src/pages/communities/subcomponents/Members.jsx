import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { kickMember, changeMemberRole } from '../../../api/communities';

const Members = ({ community, currentUser, onCommunityUpdate }) => {

  const [openModal, setOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const roleModalRef = useRef(null);
  const members = community?.members || [];
  
  // Check if current user is owner or moderator
  const isOwner = community?.createdBy?._id === currentUser?._id;
  const currentMember = members.find(member => member.user._id === currentUser?._id);
  const isModerator = currentMember?.role === 'moderator';
  const canManageMembers = isOwner || isModerator;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatJoinDate = (joinedAt) => {
    return new Date(joinedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle opening member action modal
  const handleDotClick = (member, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Reset all modal states first
    setShowKickConfirm(false);
    setShowRoleModal(false);
    
    const rect = event.target.getBoundingClientRect();
    
    setSelectedMember(member);
    const position = {
      x: rect.left - 120, // Position to the left of the dots
      y: rect.top + window.scrollY
    };
    setModalPosition(position);
    setOpenModal(true);
  };

  // Handle closing modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      
      // If kick confirmation modal is open, don't handle other modal closures
      if (showKickConfirm) return;
      
      // Check if click is outside both modals
      const clickedOutsideMainModal = modalRef.current && !modalRef.current.contains(event.target);
      const clickedOutsideRoleModal = roleModalRef.current && !roleModalRef.current.contains(event.target);
      
      // If role modal is open and click is outside role modal (but might be inside main modal)
      if (showRoleModal && clickedOutsideRoleModal) {
        setShowRoleModal(false);
        return; // Don't process further
      }
      
      // If main modal is open and click is outside main modal
      if (openModal && clickedOutsideMainModal && !showRoleModal) {
        setOpenModal(false);
        setSelectedMember(null);
      }
    };

    if ((openModal || showRoleModal) && !showKickConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openModal, showRoleModal, showKickConfirm]);

  // Handle role change
  const handleRoleChange = async (newRole) => {
    if (!selectedMember || isLoading) {
      console.log('Returning early - selectedMember or isLoading check failed');
      return;
    }

    setIsLoading(true);
    try {    
      const response = await changeMemberRole(
        community._id, 
        selectedMember._id, 
        newRole
      );
      
      if (response.success) {
        toast.success(response.message);
        setShowRoleModal(false);
        setOpenModal(false);
        setSelectedMember(null);
        
        // Trigger community update
        if (onCommunityUpdate) {
          onCommunityUpdate();
        }
      } else {
        toast.error(response.error || 'Failed to change member role');
      }
    } catch (error) {
      toast.error('An error occurred while changing member role');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle kick member
  const handleKickMember = async () => {
    if (!selectedMember || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await kickMember(community._id, selectedMember._id);
      
      if (response.success) {
        toast.success(response.message);
        setShowKickConfirm(false); 
        setOpenModal(false);
        setSelectedMember(null);
        
        // Trigger community update
        if (onCommunityUpdate) {
          onCommunityUpdate();
        }
      } else {
        toast.error(response.error || 'Failed to kick member');
      }
    } catch (error) {
      toast.error('An error occurred while kicking member');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message (placeholder for future implementation)
  const handleMessage = () => {
    toast.success('Message feature coming soon!');
    setOpenModal(false);
    setSelectedMember(null);
  };

  if (members.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
        <p className="text-gray-500 text-sm">No members found.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Members ({members.length})
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Show owner first if they exist */}
        {community?.createdBy && (
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getInitials(community.createdBy.firstname, community.createdBy.lastname)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {community.createdBy.firstname} {community.createdBy.lastname}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    Owner
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show all other members */}
        {members.map((member) => {
          // Skip if this member is the owner (already shown above)
          if (member.user._id === community?.createdBy?._id) {
            return null;
          }

          return (
            <div key={member._id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/40">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(member.user.firstname, member.user.lastname)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {member.user.firstname} {member.user.lastname}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`py-1 text-xs font-medium text-gray-500`}>
                      {member.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined {formatJoinDate(member.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {canManageMembers && (
                <button 
                  className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" 
                  onClick={(e) => handleDotClick(member, e)}
                >
                  <PiDotsThreeOutlineFill size={28} fill="#00127a"/>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Member Action Modal */}
      {openModal && selectedMember && (
        <div 
          ref={modalRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px] z-[9999]"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRoleModal(true);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Assign Role
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenModal(false);
              setShowKickConfirm(true);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Kick
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMessage();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Message
          </button>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && selectedMember && (
        <div 
          ref={roleModalRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] z-[9999]"
          style={{
            left: modalPosition.x - 140,
            top: modalPosition.y,
          }}
        >
          {console.log('Role modal is rendering with position:', { 
            left: modalPosition.x - 140, 
            top: modalPosition.y 
          })}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Moderator button clicked, selectedMember:', selectedMember);
              handleRoleChange('moderator');
            }}
            disabled={selectedMember.role === 'moderator' || isLoading}
            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
              selectedMember.role === 'moderator' 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Moderator
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Member button clicked, selectedMember:', selectedMember);
              handleRoleChange('member');
            }}
            disabled={selectedMember.role === 'member' || isLoading}
            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
              selectedMember.role === 'member' 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Member
          </button>
        </div>
      )}

      {/* Kick Confirmation Modal */}
      {showKickConfirm && selectedMember && (
        <div className="fixed backdrop-blur-sm inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kick Member
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to kick <strong>{selectedMember.user.firstname} {selectedMember.user.lastname}</strong> from this community? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowKickConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleKickMember}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Kicking...' : 'Kick Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;