"use client";
import React from 'react';
import Header from '../../../layout-provider/components/header';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>public layout</h1>
    <div className='p-4'>
    {children}
    </div>
  </div>
  )
}

export default PublicLayout