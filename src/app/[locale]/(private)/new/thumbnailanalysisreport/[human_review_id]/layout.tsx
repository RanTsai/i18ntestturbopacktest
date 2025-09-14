import AnalysisReportSidebar from "./analysis-report-sidebar";
import QuestionRefProvider from "@/context/question-ref-provider";

// app/[locale]/(private)/humanreviewdesign/layout.tsx
export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
              <QuestionRefProvider>
                  <div className="flex flex-col h-screen bg-background text-foreground">
                      <div className="flex flex-1">
                          <AnalysisReportSidebar />
                          <div className="flex flex-col flex-1">
                              {children}
                          </div>
                      </div>
                  </div>
              </QuestionRefProvider>
      
    );
}
