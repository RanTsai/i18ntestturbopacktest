export type Role = "user" | "ai";

export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    imageUrl?: string; // AI 回覆可包含圖片（可選）
    timestamp: string;
}

export interface ThumbnailVersion {
    id: string;
    versionLabel: string;     // "v1", "v2", "v3"…
    title: string;            // e.g. "How to Create Amazing Thumbnails"
    date: string;             // ISO 日期
    rating: number;           // 星星（1-5）
    description: string;      // e.g. "Added text shadow for readability"
    imageUrl: string;
    linkedMessageId?: string; // 對應哪個 AI 訊息 ID（用來 highlight）
    annotations?: {
        id: string;
        type: "box" | "arrow" | "highlight";
        x: number;       // 0~1（相對座標）
        y: number;
        width: number;   // 0~1（相對寬度）
        height: number;
        message: string; // 提示用語
    }[];
}

export interface MockChatSession {
    id: string;
    title: string;
    createdAt: string;
    messages: ChatMessage[];
    thumbnailVersions: ThumbnailVersion[];
}


export const mockChatSession: MockChatSession = {
    id: "chat1",
    title: "Thumbnail Design Tutorial",
    createdAt: "2025-06-09T10:00:00Z",
    messages: [
        {
            id: "msg1",
            role: "ai",
            content: "Welcome! I see you're working on a tutorial thumbnail. How can I help improve it?",
            timestamp: "2025-06-09T10:01:00Z"
        },
        {
            id: "msg2",
            role: "user",
            content: "I think the text is hard to read. Can you suggest improvements?",
            timestamp: "2025-06-09T10:01:30Z"
        },
        {
            id: "msg3",
            role: "ai",
            content:
                "You're right. For better readability, try:\n\n1. Adding a semi-transparent dark overlay behind the text\n2. Using a bolder font with a slight shadow\n3. Reducing the text length to 'Thumbnail Design Tips'\n\nWould you like me to show an example?",
            timestamp: "2025-06-09T10:02:00Z"
        },
        {
            id: "msg4",
            role: "user",
            content: "Yes, can you show where the problem is on the image?",
            timestamp: "2025-06-09T10:02:20Z"
        },
        {
            id: "msg5",
            role: "ai",
            content:
                "Sure! Here's your current thumbnail with highlights:\n\n🟥 The red box shows where the text blends into the background.\n\n👉 Try adding a shadow or darkening that area for better readability.",
            imageUrl: "/thumbnail3.png", // 原始圖片
            timestamp: "2025-06-09T10:02:40Z"
        }
    ],
    thumbnailVersions: [
        {
            id: "v1",
            versionLabel: "v1",
            title: "How to Create Amazing Thumbnails",
            date: "2025-06-01",
            rating: 3,
            description: "Initial version with basic gradient background",
            imageUrl: "/thumbnail1.png",
            linkedMessageId: "msg3",
            
        },
        {
            id: "v2",
            versionLabel: "v2",
            title: "How to Create Amazing Thumbnails",
            date: "2025-06-05",
            rating: 3,
            description: "Added play button icon for better context",
            imageUrl: "/thumbnail2.png",
            linkedMessageId: "msg3"
        },
        {
            id: "v3",
            versionLabel: "v3",
            title: "Thumbnail Design Tips",
            date: "2025-06-08",
            rating: 4,
            description: "Added text shadow and improved contrast",
            imageUrl: "/thumbnail3.png",
            linkedMessageId: "msg3"
        },
        {
            id: "v4",
            versionLabel: "v4",
            title: "Thumbnail Design Tips",
            date: "2025-06-09",
            rating: 5,
            description: "Marked version showing text readability issues",
            imageUrl: "/thumbnail3.png",
            linkedMessageId: "msg5",
            annotations: [
                {
                    id: "a1",
                    type: "box",
                    x: 0.1,
                    y: 0.6,
                    width: 0.35,
                    height: 0.18,
                    message: "Text here blends into the background"
                },
                {
                    id: "a2",
                    type: "arrow",
                    x: 0.8,
                    y: 0.6,
                    width: 0.05,
                    height: 0.05,
                    message: "Consider adding a drop shadow"
                }
            ]
        }


    ]
};
