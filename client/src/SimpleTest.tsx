import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Hello World!</h1>
      <p>If you can see this, the React app is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default SimpleTest;

