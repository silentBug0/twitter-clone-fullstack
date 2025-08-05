import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <-- Import useAuth
import axiosInstance from "../api/axiosInstance";

interface Tweet {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
  };
  createdAt: string;
  _count: {
    likes: number;
  };
  likes: {
    userId: number;
  }[]; // Optional array of likes to check if the current user has liked it
}

interface TweetCardProps {
  tweet: Tweet;
  onDelete: (tweetId: number) => void; // <-- Add a new prop for the delete function
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onDelete }) => {
  const timeAgo = formatDistanceToNow(new Date(tweet.createdAt), {
    addSuffix: true,
  });
  const { user } = useAuth(); // <-- Get the logged-in user
  const isAuthor = user?.id === tweet.author.id; // <-- Check if the user is the author

  // Add state to handle the like count and user's like status
  const [likeCount, setLikeCount] = React.useState(tweet._count.likes);
  const [isLiked, setIsLiked] = React.useState(
    // Check if the current user's ID exists in the likes array from the backend
    tweet.likes?.some((like) => like.userId === user?.id) || false
  );

  const handleLike = async () => {
    if (!user) return; // Don't allow unauthenticated users to like

    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);

      try {
        await axiosInstance.delete(`/tweets/${tweet.id}/like`);
      } catch (error) {
        console.error("Failed to unlike tweet:", error);
        // Revert UI on failure
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
      try {
        await axiosInstance.post(`/tweets/${tweet.id}/like`);
      } catch (err) {
        console.error("Failed to like tweet:", err);
        // Revert UI on failure
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        {" "}
        {/* Add justify-between */}
        <div className="flex items-center">
          <Link
            to={`/profile/${tweet.author.username}`}
            className="text-sm font-bold text-blue-500 hover:underline"
          >
            @{tweet.author.username}
          </Link>
          <span className="text-xs text-gray-500 ml-2">{timeAgo}</span>
        </div>
        {/* Conditionally render the delete button */}
        {isAuthor && (
          <button
            onClick={() => onDelete(tweet.id)}
            className="text-red-500 hover:text-red-700 text-sm font-bold"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-700 text-base">{tweet.content}</p>
      <div className="flex items-center">
        <button
          onClick={handleLike}
          className="flex items-center text-gray-500 hover:text-red-500"
        >
          <svg
            className={`h-5 w-5 ${
              isLiked ? "text-red-500 fill-current" : "text-gray-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="ml-1 text-sm">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export default TweetCard;
