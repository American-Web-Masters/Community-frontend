import React, { useState, useEffect } from 'react';
import MilestoneProgress from '../../components/ui/MilestoneProgress';
import NameMilestone from './NameMilestone';
import { signupUtils, MILESTONES } from '../../utils/signupUtils';

function Signup() {
  const [currentMilestone, setCurrentMilestone] = useState(MILESTONES.NAME);
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [signupData, setSignupData] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const progress = signupUtils.getProgress();
    const data = signupUtils.getSignupData();
    
    setCurrentMilestone(progress.currentMilestone);
    setCompletedMilestones(progress.completedMilestones);
    setSignupData(data);
  }, []);

  // Save progress to localStorage
  const saveProgress = (milestone, completed) => {
    signupUtils.updateProgress(milestone, completed);
  };

  const handleMilestoneNext = (nextMilestone) => {
    setIsTransitioning(true);
    
    // Mark current milestone as completed
    const newCompleted = [...completedMilestones, currentMilestone];
    setCompletedMilestones(newCompleted);
    
    // Animate transition
    setTimeout(() => {
      setCurrentMilestone(nextMilestone);
      saveProgress(nextMilestone, newCompleted);
      setIsTransitioning(false);
    }, 300);
  };

  const handleDataChange = (newData) => {
    setSignupData(newData);
  };

  const renderCurrentMilestone = () => {
    const milestoneProps = {
      onNext: handleMilestoneNext,
      onDataChange: handleDataChange,
      signupData
    };

    switch (currentMilestone) {
      case MILESTONES.NAME:
        return <NameMilestone {...milestoneProps} />;
      case MILESTONES.CONTACT:
        return <div className="text-white text-center">Contact milestone - Coming soon</div>;
      case MILESTONES.VERIFICATION:
        return <div className="text-white text-center">Verification milestone - Coming soon</div>;
      case MILESTONES.USERNAME:
        return <div className="text-white text-center">Username milestone - Coming soon</div>;
      case MILESTONES.PASSWORD:
        return <div className="text-white text-center">Password milestone - Coming soon</div>;
      case MILESTONES.REVIEW:
        return <div className="text-white text-center">Review milestone - Coming soon</div>;
      default:
        return <NameMilestone {...milestoneProps} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.png)',
        }}
      >
        {/* Overlay for better readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50"></div> */}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Milestones */}
        <div className="hidden bg-white/10 lg:flex lg:w-1/3 items-center justify-center p-8">
          <MilestoneProgress 
            currentMilestone={currentMilestone}
            completedMilestones={completedMilestones}
          />
        </div>

        {/* Right Side - Current Milestone Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={`
            w-full max-w-lg transition-all duration-500 ease-in-out
            ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
          `}>
            {/* Glass morphism container */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
              {renderCurrentMilestone()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Milestone Progress */}
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3">
          <div className="flex space-x-2">
            {['name', 'contact', 'verification', 'username', 'password', 'review'].map((milestone, index) => (
              <div
                key={milestone}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${completedMilestones.includes(milestone)
                    ? 'bg-primary'
                    : milestone === currentMilestone
                      ? 'bg-white'
                      : 'bg-white/30'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;