import React from 'react';
import { FaUser, FaEnvelope, FaShieldAlt, FaUserTag, FaLock, FaEye, FaCheck } from 'react-icons/fa';

const milestones = [
  { id: 'name', label: 'Name', icon: FaUser },
  { id: 'contact', label: 'Contact', icon: FaEnvelope },
  { id: 'verification', label: 'Verification', icon: FaShieldAlt },
  { id: 'username', label: 'Username', icon: FaUserTag },
  { id: 'password', label: 'Password', icon: FaLock },
  { id: 'review', label: 'Review', icon: FaEye },
];

const MilestoneProgress = ({ currentMilestone, completedMilestones = [] }) => {
  return (
    <div className="flex flex-col space-y-4 mr-8">
      {milestones.map((milestone, index) => {
        const isActive = milestone.id === currentMilestone;
        const isCompleted = completedMilestones.includes(milestone.id);
        const Icon = milestone.icon;
        
        return (
          <div key={milestone.id} className="flex items-center relative">
            {/* Connecting line */}
            {index < milestones.length - 1 && (
              <div className="absolute top-8 left-6 w-0.5 h-8 bg-white/20"></div>
            )}
            
            {/* Milestone circle */}
            <div 
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500
                ${isCompleted 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : isActive 
                    ? 'bg-white/20 text-white border-2 border-primary shadow-lg' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }
              `}
            >
              {isCompleted ? (
                <FaCheck className="w-5 h-5 animate-pulse" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              
              {/* Active pulse animation */}
              {isActive && !isCompleted && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
              )}
            </div>
            
            {/* Label */}
            <div className={`
              ml-4 text-sm font-medium transition-colors duration-300
              ${isActive ? 'text-white' : isCompleted ? 'text-white/90' : 'text-white/60'}
            `}>
              {milestone.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneProgress;