import React from 'react';

const AboutUs = ({ community }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-6">
      <h3 className="text-lg font-bold text-blue-900 mb-4">About Us</h3>
      <p className="text-[#03045E] leading-relaxed">
        {community.description || "This community is dedicated to bringing people together through shared values and meaningful connections."}
      </p>
      {community.createdAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-[#03045E]">
            Community created on {new Date(community.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default AboutUs;