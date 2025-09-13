import React from 'react';

interface TestSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function TestSection({ title, description, children }: TestSectionProps) {
  return (
    <div className="mb-8 p-5 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );
}
