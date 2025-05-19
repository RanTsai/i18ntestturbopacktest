import React from 'react';
interface SpinnerProps {
    height ?: number;   

}

function Spinner({height} : SpinnerProps) {
  return (
    <div className='flex items-center justify-center'
    style={{
        height : height ? `${height}px` : '100vh',
    }}
    ><div className='w-10 h-10 border-8 border-primary rounded-full animate-spin border-t-transparent'></div>

    </div>   
  )
}

export default Spinner