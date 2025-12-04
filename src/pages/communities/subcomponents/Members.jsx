import { PiDotsThreeOutlineFill } from "react-icons/pi";

const Members = ({ community, currentUser }) => {
  const members = community?.members || [];
  console.log(members);
  
  // Check if current user is owner or moderator
  const isOwner = community?.createdBy?._id === currentUser?._id;
  const currentMember = members.find(member => member.user._id === currentUser?._id);
  const isModerator = currentMember?.role === 'moderator';
  const canManageMembers = isOwner || isModerator;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (members.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
        <p className="text-gray-500 text-sm">No members found.</p>
      </div>
    );
  }

  return (
    <div >
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
            {canManageMembers && (
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <PiDotsThreeOutlineFill size={28} fill="#00127a"/>
              </button>
            )}
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
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <PiDotsThreeOutlineFill size={28} fill="#00127a"/>
              </button>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Members;