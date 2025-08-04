import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

// Define the shape of the Tweet props
interface Tweet {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
}

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  // Use date-fns to format the timestamp nicely
  const timeAgo = formatDistanceToNow(new Date(tweet.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-3 border border-gray-200">
      <div className="flex items-center mb-2">
        <Link
          to={`/profile/${tweet.author.username}`}
          className="text-sm font-bold text-gray-800"
        >
          @{tweet.author.username}
        </Link>
        <span className="text-xs text-gray-500 ml-2">{timeAgo}</span>
      </div>
      <p className="text-gray-700 text-base">{tweet.content}</p>
    </div>
  );
};

export default TweetCard;
