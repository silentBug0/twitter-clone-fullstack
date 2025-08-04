import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const TweetForm: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);

    try {
      // Send a POST request to your backend's /tweets endpoint
      // We'll pass the user ID from the AuthContext and the tweet content
      await axiosInstance.post(
        "/tweets",
        {
          content,
          authorId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Assuming you have the access token in user
          },
        }
      );

      // Clear the form and show a success message or update the UI
      setContent("");
    } catch (error) {
      console.error("Failed to post tweet:", error);
      // You can add a state variable to show an error message in the UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          placeholder="What's on your mind?"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading || !content.trim()}
          >
            {loading ? "Tweeting..." : "Tweet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TweetForm;
