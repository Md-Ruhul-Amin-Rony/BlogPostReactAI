import React from 'react';

const PostSkeleton: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/6"></div>
        </div>
      </div>
      
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-200 rounded-full mr-1"></div>
          <div className="h-4 bg-gray-200 rounded w-6"></div>
        </div>
        
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-200 rounded-full mr-1"></div>
          <div className="h-4 bg-gray-200 rounded w-6"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;