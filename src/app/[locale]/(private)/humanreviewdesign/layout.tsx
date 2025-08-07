// app/[locale]/(private)/humanreviewdesign/layout.tsx
import Topbar from "@/components/navigation/top-bar";
export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            <Topbar />
            <main>
                {children}</main>
        </>
    );
}
