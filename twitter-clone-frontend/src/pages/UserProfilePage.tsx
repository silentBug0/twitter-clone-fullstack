import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import TweetCard from "../components/TweetCard";
import { useAuth } from "../context/AuthContext";
import Navbar from '../components/Navbar'; // <-- Import Navbar

// Define the shape of the User data we expect from the backend
interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  tweets: Tweet[];
  _count: {
    following: number;
    followers: number;
  };
  followers?: { followerId: number }[]; // Optional array of followers
}

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

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const isMyProfile = user?.username === username;

  // Add handler for follow/unfollow
  const handleFollow = async () => {
    if (!userProfile) return;

    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      try {
        await axiosInstance.delete(`/users/${userProfile.id}/follow`);
      } catch (err) {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        console.error("Failed to unfollow:", err);
        alert("Failed to unfollow user. Please try again.");
      }
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      try {
        await axiosInstance.post(`/users/${userProfile.id}/follow`);
      } catch (err) {
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
        console.error("Failed to follow:", err);
        alert("Failed to follow user. Please try again.");
      }
    }
  };

  const handleDeleteTweet = async (tweetId: number) => {
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

        const profileData = response.data;
        setUserProfile(profileData);
        setFollowerCount(profileData._count.followers);

        // Check if the current user is following this profile
        if (profileData.followers && profileData.followers.length > 0) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
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
      <Navbar /> {/* <-- Render Navbar here */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            @{userProfile.username}
          </h2>
          {!isMyProfile && (
            <button
              onClick={handleFollow}
              className={`font-bold py-2 px-4 rounded-full text-sm ${
                isFollowing
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          <p className="text-gray-600 mt-2">
            Member since: {new Date(userProfile.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-600 mt-2">
            <span className="font-bold">{followerCount}</span> followers •{" "}
            <span className="font-bold">{userProfile._count.following}</span>{" "}
            following
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
