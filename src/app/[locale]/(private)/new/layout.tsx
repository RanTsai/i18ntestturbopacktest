// app/[locale]/layout.tsx（Server Component）


export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  return (
    <>
      {children}
    </>
  );
}
