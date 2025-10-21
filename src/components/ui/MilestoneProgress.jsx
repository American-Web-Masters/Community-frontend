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
    <div className="flex flex-col space-y-6 w-60">
      {milestones.map((milestone, index) => {
        const isActive = milestone.id === currentMilestone;
        const isCompleted = completedMilestones.includes(milestone.id);
        const Icon = milestone.icon;
        const stepNumber = index + 1;
        
        return (
          <div key={milestone.id} className="flex items-center relative min-h-16">
            {/* Connecting line */}
            {index < milestones.length - 1 && (
              <div className="absolute top-14 left-6 w-0.5 h-9 bg-primary-500/30"></div>
            )}
            
            {/* Milestone circle */}
            <div 
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500
                ${isCompleted 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-primary-500/20 text-white/60 border border-primary-500/30'
                }
              `}
            >
              {isCompleted ? (
                <FaCheck className="w-5 h-5 animate-checkmark" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            
            {/* Step info */}
            <div className="ml-4 flex flex-col">
              <div className={`
                text-xs text-secondary font-medium uppercase tracking-wider transition-colors duration-300
                
              `}>
                Step {stepNumber}
              </div>
              <div className={`
                text-sm transition-colors duration-300
              `}>
                {milestone.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneProgress;