// app/[locale]/(private)/helpothers/layout.tsx
import ProjectSidebar from "./testsidebar";
import QuestionRefProvider from "@/context/question-ref-provider";
export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QuestionRefProvider>
            <div className="flex flex-col h-screen bg-background text-foreground">
                <div className="flex flex-1">
                    <ProjectSidebar />
                    <div className="flex flex-col flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </QuestionRefProvider>
    );
}
