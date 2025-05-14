import React from 'react';
import Header from './components/header';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
    <Header/>
    <div className='p-4'>
    {children}
    </div>
  </div>
  )
}

export default PrivateLayout