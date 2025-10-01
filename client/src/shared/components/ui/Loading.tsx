import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
}) => {
  const spinnerClass = `spinner spinner-${size} spinner-${color}`;
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={spinnerClass}></div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }
  
  return (
    <div className="loading-container">
      <div className={spinnerClass}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
