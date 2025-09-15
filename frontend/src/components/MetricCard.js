import React from 'react';

const MetricCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex-1 flex flex-col justify-between">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="mt-4 text-4xl font-bold text-blue-600">{value}</p>
  </div>
);

export default MetricCard;