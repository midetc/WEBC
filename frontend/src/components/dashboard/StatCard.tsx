import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow';
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    red: 'bg-red-500 text-red-100',
    yellow: 'bg-yellow-500 text-yellow-100',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${colorClasses[color]}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          <i className={`fas fa-${icon} text-xl opacity-80`}></i>
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      
      {change && (
        <div className="px-4 py-3 bg-white">
          <p className={`text-sm flex items-center ${
            change.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <i className={`fas fa-arrow-${
              change.isPositive ? 'up' : 'down'
            } mr-1`}></i>
            {change.value}% від минулого місяця
          </p>
        </div>
      )}
    </div>
  );
};

export default StatCard; 