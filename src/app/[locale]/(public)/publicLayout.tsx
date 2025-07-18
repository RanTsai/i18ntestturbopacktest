"use client";
import Topbar from '@/components/navigation/top-bar';
import React from 'react';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Topbar/>
      <h1>public layout</h1>
    <div className='p-4'>
    {children}
    </div>
  </div>
  )
}

export default PublicLayout