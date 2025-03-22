// components/Card.jsx
import React from 'react';

export const Card = ({ className, children }) => (
  <div className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="p-0">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

export const CardFooter = ({ children }) => (
  <div className="p-4 flex items-center justify-between border-t border-gray-700">{children}</div>
);