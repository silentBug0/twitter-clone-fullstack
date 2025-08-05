import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import TweetCard from "../components/TweetCard";
import { useAuth } from "../context/AuthContext";

// Define the shape of the User data we expect from the backend
interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  tweets: Tweet[];
}

interface Tweet {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  _count: {
    likes: number;
  };
  likes: any[]; // Adjust type if you have a specific Like type
}

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleDeleteTweet = async (tweetId: string) => {
    if (!userProfile) return;

    try {
      await axiosInstance.delete(`tweets/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserProfile({
        ...userProfile,
        tweets: userProfile.tweets.filter((tweet) => tweet.id !== tweetId),
      });
    } catch (error) {
      console.error("Failed to delete tweet:", error);
      alert("Failed to delete tweet. Please try again.");
    }
  };

  useEffect(() => {
    if (!username) {
      setError("No username provided.");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<UserProfile>(
          `/users/${username}`
        );

        setUserProfile(response.data);
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(err.response?.data?.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]); // Rerun the effect whenever the username in the URL changes

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-8">
        Loading user profile...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center text-gray-500 p-8">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            @{userProfile.username}
          </h2>
          <p className="text-gray-600 mt-2">
            Member since: {new Date(userProfile.createdAt).toLocaleDateString()}
          </p>
        </div>

        <h3 className="text-xl font-bold mb-4">Tweets</h3>
        {userProfile.tweets.length === 0 ? (
          <p className="text-gray-500">This user has no tweets yet.</p>
        ) : (
          <div className="space-y-4">
            {userProfile.tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onDelete={handleDeleteTweet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
