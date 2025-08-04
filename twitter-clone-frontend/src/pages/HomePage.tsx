import React from "react";
import TweetForm from "../components/TweetForm";
import TweetList from "../components/TweetList";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Welcome to Twitter Clone!</h1>
        <TweetForm />
        <TweetList />
      </div>
    </div>
  );
};

export default HomePage;
