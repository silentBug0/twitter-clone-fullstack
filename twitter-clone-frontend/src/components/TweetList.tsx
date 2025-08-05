import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import TweetCard from "../components/TweetCard";
import { useAuth } from "../context/AuthContext";

// Define the shape of the Tweet data we expect from the backend
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
  likes: any[]; // Adjust type if you have a specific Like type
}

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/tweets/timeline");
      // Assuming your backend returns a list of tweets
      setTweets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch tweets:", err);
      setError("Failed to load tweets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTweet = async (tweetId: number) => {
    try {
      await axiosInstance.delete(`tweets/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTweets(tweets.filter((tweet) => tweet.id !== tweetId));
    } catch (error) {
      console.error("Failed to delete tweet:", error);
      alert("Failed to delete tweet. Please try again.");
    }
  };
  useEffect(() => {
    // This function will fetch the tweets from the backend
    fetchTweets();
  }, []); // The empty array means this effect runs once on mount

  if (loading) {
    return <div className="text-center text-gray-500">Loading tweets...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center text-gray-500">No tweets to display.</div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} onDelete={handleDeleteTweet} />
      ))}
    </div>
  );
};

export default TweetList;
