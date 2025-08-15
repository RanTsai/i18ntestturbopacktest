// app/[locale]/(private)/helpothers/layout.tsx
export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main>
                {children}
            </main>
        </>
    );
}
