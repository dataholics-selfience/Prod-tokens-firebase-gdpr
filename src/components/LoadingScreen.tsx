import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="loading-screen">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-white text-lg font-medium">{message}</div>
      </div>
    </div>
  );
};

export default LoadingScreen;