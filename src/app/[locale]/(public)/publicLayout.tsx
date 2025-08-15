"use client";
import React from 'react';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
    <div className='p-4'>
    {children}
    </div>
  </div>
  )
}

export default PublicLayout