import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import TweetCard from "../components/TweetCard";

// Define the shape of the Tweet data we expect from the backend
interface Tweet {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
}

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function will fetch the tweets from the backend
    const fetchTweets = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/tweets");        
        // Assuming your backend returns a list of tweets
        setTweets(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch tweets:", err);
        setError("Failed to load tweets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

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
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
};

export default TweetList;
