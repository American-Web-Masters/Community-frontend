import {
  PiHandsPrayingThin,
  PiUsersThree,
  PiCross,
  PiChatCircleDots,
} from "react-icons/pi";

const BottomNavBar = ({ activeTab, onTabChange }) => {
  return (
    <div className="btn-blue-gradient w-[350px] md:min-w-[450px] h-14 rounded-full flex items-center justify-center ml-6 fixed bottom-5 left-[45%] md:left-[48%] transform -translate-x-1/2 overflow-hidden">
      <button 
        onClick={() => onTabChange('prayer-wall')}
        className={`flex flex-col items-center justify-center flex-1 h-full text-white transition-colors duration-200 ${
          activeTab === 'prayer-wall' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <PiHandsPrayingThin className="w-5 h-5 md:w-7 md:h-7 mb-1" />
        <span className="text-xs">Prayer Wall</span>
      </button>
      <button 
        onClick={() => onTabChange('communities')}
        className={`flex flex-col items-center justify-center flex-1 h-full text-white transition-colors duration-200 ${
          activeTab === 'communities' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <PiUsersThree className="w-5 h-5 md:w-7 md:h-7 mb-1" />
        <span className="text-xs">Communities</span>
      </button>
      <button 
        onClick={() => onTabChange('create')}
        className={`flex flex-col items-center justify-center flex-1 h-full text-white transition-colors duration-200 relative ${
          activeTab === 'create' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-1">
          <PiCross className="w-5 h-5 md:w-8 md:h-8 mb-1 text-transparent stroke-primary-500 fill-primary-600 stroke-[2]" />
        </div>
      </button>
      <button 
        onClick={() => onTabChange('messages')}
        className={`flex flex-col items-center justify-center flex-1 h-full text-white transition-colors duration-200 ${
          activeTab === 'messages' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <PiChatCircleDots className="w-5 h-5 md:w-7 md:h-7 mb-1" />
        <span className="text-xs">Messages</span>
      </button>
      <button 
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center flex-1 h-full text-white transition-colors duration-200 ${
          activeTab === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.9974 20.8334C29.5998 20.8334 33.3307 17.1024 33.3307 12.5C33.3307 7.89765 29.5998 4.16669 24.9974 4.16669C20.395 4.16669 16.6641 7.89765 16.6641 12.5C16.6641 17.1024 20.395 20.8334 24.9974 20.8334Z"
            stroke="white"
            strokeWidth="3.5"
          />
          <path
            d="M41.6654 36.4584C41.6654 41.6355 41.6654 45.8334 24.9987 45.8334C8.33203 45.8334 8.33203 41.6355 8.33203 36.4584C8.33203 31.2813 15.7945 27.0834 24.9987 27.0834C34.2029 27.0834 41.6654 31.2813 41.6654 36.4584Z"
            stroke="white"
            strokeWidth="3.5"
          />
        </svg>
        <span className="text-xs">Profile</span>
      </button>
    </div>
  );
};

export default BottomNavBar;