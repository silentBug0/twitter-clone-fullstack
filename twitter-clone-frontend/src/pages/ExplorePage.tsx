import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

interface User {
  id: number;
  username: string;
  createdAt: string;
  isFollowing: boolean; // We'll add a temporary state for this
}

const ExplorePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFollow = async (followeeId: number) => {
    try {
      // Optimistically update the UI
      setUsers(
        users.map((u) =>
          u.id === followeeId ? { ...u, isFollowing: true } : u
        )
      );

      
      await axiosInstance.post(`/users/${followeeId}/follow`);
    } catch (err) {
      console.error("Failed to follow user:", err);
      // Revert on error
      setUsers(
        users.map((u) =>
          u.id === followeeId ? { ...u, isFollowing: false } : u
        )
      );
      alert("Failed to follow user. Please try again.");
    }
  };

  const handleUnfollow = async (followeeId: number) => {
    try {
      // Optimistically update the UI
      setUsers(
        users.map((u) =>
          u.id === followeeId ? { ...u, isFollowing: false } : u
        )
      );
      await axiosInstance.delete(`/users/${followeeId}/follow`);
    } catch (err) {
      console.error("Failed to unfollow user:", err);
      // Revert on error
      setUsers(
        users.map((u) =>
          u.id === followeeId ? { ...u, isFollowing: true } : u
        )
      );
      alert("Failed to unfollow user. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get<User[]>("/users");
        // Add a temporary `isFollowing` property to each user
        console.log("Fetched users:", response.data);
        
        setUsers(response.data);
      } catch (err: any) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-8">Loading users...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Navbar /> {/* <-- Render Navbar here */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        <p className="text-gray-600 mb-6">Find new users to follow.</p>
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              <Link
                to={`/profile/${u.username}`}
                className="text-lg font-bold text-blue-500 hover:underline"
              >
                @{u.username}
              </Link>
              {/* Conditionally render follow/unfollow button */}
              {u.isFollowing ? (
                <button
                  onClick={() => handleUnfollow(u.id)}
                  className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full text-sm"
                >
                  Following
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(u.id)}
                  className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-4 rounded-full text-sm"
                >
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
