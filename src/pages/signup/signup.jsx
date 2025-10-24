import React, { useState, useEffect } from 'react';
import MilestoneProgress from '../../components/ui/MilestoneProgress';
import NameMilestone from './NameMilestone';
import ContactMilestone from './ContactMilestone';
import VerificationMilestone from './VerificationMilestone';
import UsernameMilestone from './UsernameMilestone';
import PasswordMilestone from './PasswordMilestone';
import ReviewMilestone from './ReviewMilestone';
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

  const handleMilestonePrev = (prevMilestone) => {
    setIsTransitioning(true);
    
    // Remove current milestone from completed list if going back
    const newCompleted = completedMilestones.filter(m => m !== prevMilestone);
    setCompletedMilestones(newCompleted);
    
    // Animate transition
    setTimeout(() => {
      setCurrentMilestone(prevMilestone);
      saveProgress(prevMilestone, newCompleted);
      setIsTransitioning(false);
    }, 300);
  };

  const handleDataChange = (newData) => {
    setSignupData(newData);
  };

  const renderCurrentMilestone = () => {
    const milestoneProps = {
      onNext: handleMilestoneNext,
      onPrev: handleMilestonePrev,
      onDataChange: handleDataChange,
      signupData
    };

    switch (currentMilestone) {
      case MILESTONES.NAME:
        return <NameMilestone {...milestoneProps} />;
      case MILESTONES.CONTACT:
        return <ContactMilestone {...milestoneProps} />;
      case MILESTONES.VERIFICATION:
        return <VerificationMilestone {...milestoneProps} />;
      case MILESTONES.USERNAME:
        return <UsernameMilestone {...milestoneProps} />;
      case MILESTONES.PASSWORD:
        return <PasswordMilestone {...milestoneProps} />;
      case MILESTONES.REVIEW:
        return <ReviewMilestone {...milestoneProps} />;
      default:
        return <NameMilestone {...milestoneProps} />;
    }
  };

  return (
    <div className="max-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background.png)',
        }}
      >
      </div>

      {/* Content - Centered with equal height containers */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="flex items-center justify-center gap-6 max-w-5xl w-full">
          {/* Left Side - Milestone Progress */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl min-h-[500px] flex items-center">
              <MilestoneProgress 
                currentMilestone={currentMilestone}
                completedMilestones={completedMilestones}
              />
            </div>
          </div>

          {/* Right Side - Current Milestone Form */}
          <div className={`
            w-full max-w-lg transition-all duration-500 ease-in-out
            ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
          `}>
            {/* Glass morphism container */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl min-h-[500px] flex items-center justify-center">
              {renderCurrentMilestone()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;