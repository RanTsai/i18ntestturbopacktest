// app/[locale]/(private)/humanreviewdesign/layout.tsx

import QuestionaireBuilderSideBar from "./questionaire-builder-sidebar";
import QuestionRefProvider from "@/context/question-ref-provider";
export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QuestionRefProvider>
            <div className="flex flex-col h-screen bg-background text-foreground">
                <div className="flex flex-1">
                    <QuestionaireBuilderSideBar />
                    <div className="flex flex-col flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </QuestionRefProvider>

    );

}
