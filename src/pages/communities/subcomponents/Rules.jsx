import React from 'react';

const Rules = ({ community }) => {
  const defaultRules = [
    "Be respectful and kind to all community members",
    "Keep discussions relevant to the community's purpose",
    "No spam, advertising, or inappropriate content",
    "Respect privacy and confidentiality of shared information",
    "Follow community guidelines and moderator instructions"
  ];
  const rules = community.communityRules || defaultRules;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 mb-6">
      <h3 className="text-lg font-bold text-blue-900  mb-4">Community Rules</h3>
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 text-[#03045E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold">{index + 1}</span>
            </div>
            <p className="text-[#03045E] leading-relaxed text-sm">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;