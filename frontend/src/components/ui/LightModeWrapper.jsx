import React from 'react';

const LightModeWrapper = ({ children }) => {
  return (
    <div className="light" style={{ colorScheme: 'light' }}>
      <style jsx global>{`
        html {
          color-scheme: light !important;
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .light * {
          color-scheme: light !important;
        }
      `}</style>
      {children}
    </div>
  );
};

export default LightModeWrapper; 