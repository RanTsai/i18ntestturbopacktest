"use client"
import React, { useEffect } from "react"
import { useAiChatThreadViewModel as VM2 } from "../[public_id]/ai-chat-thread-view-model"

function Page() {
  const {
    loadChatThreads,
    projects,
    threadsById,
    messagesByThread,
  } = VM2()

  useEffect(() => {
    ;(async () => {
      await loadChatThreads()
      console.log("DEBUG projects:", projects)
      console.log("DEBUG threadsById:", threadsById)
      console.log("DEBUG messagesByThread:", messagesByThread)
    })()
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-bold">Projects</h2>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(projects, null, 2)}
      </pre>

      <h2 className="font-bold">Threads</h2>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(threadsById, null, 2)}
      </pre>

      <h2 className="font-bold">Messages</h2>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(messagesByThread, null, 2)}
      </pre>
    </div>
  )
}

export default Page
