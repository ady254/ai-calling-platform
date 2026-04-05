import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = true }: CardProps) => {
  return (
    <div 
      className={`
        relative p-8 rounded-2xl bg-white border border-gray-100 shadow-xl 
        ${hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : ''} 
        transition-all duration-300 
        ${className}
      `}
    >
      {children}
    </div>
  );
};
