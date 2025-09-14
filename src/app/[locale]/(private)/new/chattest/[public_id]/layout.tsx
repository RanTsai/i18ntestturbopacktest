// app/[locale]/(private)/aichat/[public_id]/layout.tsx
import ChatListBar from "./chat-list-sidebar"
import QuestionRefProvider from "@/context/question-ref-provider";


export default async function LocaleLayout({
    children, params
}: {
    children: React.ReactNode; params: { locale: string; public_id: string };
}) {
    const { public_id } = params;
    console.log("public_id", public_id);
    return (
        <QuestionRefProvider>
            <div className="flex flex-col h-screen bg-background text-foreground">
                <div className="flex flex-1">
                    <ChatListBar 
                    userWorkPublicId={public_id}/>
                    <div className="flex flex-col flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </QuestionRefProvider>
    );
}
