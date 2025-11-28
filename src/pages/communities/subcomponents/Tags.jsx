const Tags = ({ community }) => {
  const tags = community.tags || [];

  if (tags.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Tags</h3>
        <p className="text-gray-500 text-sm">No tags have been added to this community yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
      <h3 className="text-lg font-bold text-blue-900 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;