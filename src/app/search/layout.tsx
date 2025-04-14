"use client";

import React from 'react';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="search-layout">
      {children}
    </div>
  );
}
