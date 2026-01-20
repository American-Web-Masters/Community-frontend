import React from 'react';
import { useNavigate } from 'react-router-dom';

const Posts = () => {
  const navigate = useNavigate();
  // Mock data - replace with real data from API
  const posts = [];

  return (
    <div className="p-6">
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Posts Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't created any posts yet. Start sharing your thoughts and experiences with the community.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Post content will go here */}
              <p>Post content...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;