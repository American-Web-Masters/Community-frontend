import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import PrayerRequestTab from './tabs/PrayerRequestTab';
import CommunityTab from './tabs/CommunityTab';
import InnerCircleTab from './tabs/InnerCircleTab';
import JournalEntryTab from './tabs/JournalEntryTab';
import { getTabTitle, getTabSubtitle } from '../../utils/plusButtonUtils';

const PlusButton = ({ isOpen, onClose, initialTab = 'prayer-request', initialData = null }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab when initialTab changes (e.g. reopening modal with a specific tab)
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const tabs = [
    { id: 'prayer-request', label: 'Prayer Request' },
    { id: 'community', label: 'Community' },
    { id: 'inner-circle', label: 'Inner Circle' },
    { id: 'journal-entry', label: 'Journal Entry' }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSuccess = (data) => {
    console.log('Operation successful:', data);

    if (activeTab === 'prayer-request') {
      toast.success('Prayer request posted successfully!');

      window.dispatchEvent(
        new CustomEvent('prayer:created', {
          detail: {
            tab: activeTab,
            prayer: data
          }
        })
      );
    } else if (activeTab === 'community') {
      toast.success(data?.message || 'Community created successfully!');

      window.dispatchEvent(
        new CustomEvent('community:created', {
          detail: {
            community: data
          }
        })
      );
    }
  };

  const renderTabContent = () => {
    const tabProps = {
      onClose,
      onSuccess: handleSuccess
    };

    switch (activeTab) {
      case 'prayer-request':
        return <PrayerRequestTab {...tabProps} />;
      case 'community':
        return <CommunityTab {...tabProps} />;
      case 'inner-circle':
        return <InnerCircleTab {...tabProps} />;
      case 'journal-entry':
        return <JournalEntryTab {...tabProps} initialData={initialData} />;
      default:
        return <PrayerRequestTab {...tabProps} />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="plus-button-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in ease-out"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-[#EBF5FF] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ease-out">
        {/* Close (Cross) Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full cursor-pointer text-gray-400 hover:text-gray-800 hover:bg-white hover:shadow-md transition-all duration-300 hover:rotate-90 active:scale-90"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center p-6">
          <div>
            <h2 className="text-lg text-center md:text-3xl font-bold text-gray-800">{getTabTitle(activeTab)}</h2>
            <p className="text-sm mt-2 text-center md:text-lg text-gray-500">{getTabSubtitle(activeTab)}</p>
          </div>
        </div>

        {/* Tab Navigation */}

        <div className="flex bg-[#EBF5FF] justify-center px-6 py-2">
          <div className="flex bg-white rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-8 cursor-pointer lf:px-12 py-2 text-sm font-medium transition-all duration-300 rounded-full flex-1 md:flex-none ${
                  activeTab === tab.id
                    ? 'btn-blue-gradient shadow-md scale-105 text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#EBF5FF]">
          {renderTabContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PlusButton;