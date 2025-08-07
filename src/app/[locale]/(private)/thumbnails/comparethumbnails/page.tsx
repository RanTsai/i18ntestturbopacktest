import React from 'react'
import ChatAreaCompareProject from '@/components/ui/chat/chat-area-compare-project'
function page() {
  return (
    <div className="flex h-screen">
         <div className="hidden lg:flex">
           {/* <ChatListBar setShowSidebar={} /> */}
         </div>
         <div className="flex-1 h-full" >
           <ChatAreaCompareProject />
         </div>
       </div>
       )
  
}

export default page