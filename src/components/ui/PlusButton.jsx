import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import PrayerRequestTab from './tabs/PrayerRequestTab';
import CommunityTab from './tabs/CommunityTab';
import InnerCircleTab from './tabs/InnerCircleTab';
import JournalEntryTab from './tabs/JournalEntryTab';
import { getTabTitle, getTabSubtitle } from '../../utils/plusButtonUtils';

const PlusButton = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('prayer-request');

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
    // You can add global success handling here if needed
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
        return <JournalEntryTab {...tabProps} />;
      default:
        return <PrayerRequestTab {...tabProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 light-background backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#EBF5FF] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center p-6">
          <div>
            <h2 className="text-lg text-center md:text-3xl font-bold text-gray-800">{getTabTitle(activeTab)}</h2>
            <p className="text-sm mt-2 text-center md:text-lg text-gray-500">{getTabSubtitle(activeTab)}</p>
          </div>
          {/* <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button> */}
        </div>

        {/* Tab Navigation */}

        <div className="flex bg-[#EBF5FF] justify-center px-6 py-2">
          <div className="flex bg-white rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-8 cursor-pointer lf:px-12 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                  activeTab === tab.id
                    ? 'btn-blue-gradient shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
    </div>
  );
};

export default PlusButton;