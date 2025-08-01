import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Welcome to Twitter Clone!</h1>
        <p className="text-lg">
          This is your home page. More content coming soon!
        </p>
        {/* Tweet form and tweet list will go here */}
      </div>
    </div>
  );
};

export default HomePage;
