import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Tour = () => {
  const navigate = useNavigate();

  const handleTakeTour = () => {
    // Navigate to the actual tour or next step
    console.log('Starting tour...');
    // You can replace this with actual tour logic or navigation
  };

  const handleSkip = () => {
    // Navigate to the main application or dashboard
    navigate('/dashboard'); // Adjust this route as needed
  };

  const handleClose = () => {
    // Close the modal or navigate away
    navigate('/dashboard'); // Adjust this route as needed
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      ></div>
      
      {/* Content */}
      <div className="flex items-center justify-center py-28 lg:py-32">
        <div className="flex items-center justify-center max-w-5xl w-full max-sm:w-11/12">
          <div className="w-full max-w-lg transition-all duration-500 ease-in-out h-[50vh]">
            {/* Glass morphism container */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl min-h-[400px] flex items-center justify-center relative ">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white rounded-full w-7 h-7 flex justify-center items-center hover:scale-105  duration-200"
              >
                <FaTimes size={20} className='relative z-10 text-gray-600' />
              </button>

              {/* Content */}
              <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-500 rounded-full">
                  
                    <img src="celebration-party.png" alt="" width={70} height={70} />
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Thanks for sharing!
                </h2>
                
                {/* Subheading */}
                <p className="text-primary-600 text-sm mb-4 font-semibold">
                  Welcome to Aol Community!
                </p>

                {/* Description */}
                <p className="text-gray-600 mb-5">
                  Want a quick tour of Aol?
                </p>

                {/* Take a Tour button */}
                <div className="space-y-4">
                  <button
                    onClick={handleTakeTour}
                    className="w-full py-4 px-6 rounded-4xl font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Take a Tour
                  </button>

                  {/* Skip link */}
                  <p
                    // onClick={handleSkip}
                    className="text-gray-200 text-sm transition-colors duration-200"
                  >
                    Or press x to Skip
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;
