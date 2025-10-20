// app/[locale]/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  // 僅接受相對路徑，避免 open-redirect
  const raw = typeof sp.redirect_url === "string" ? sp.redirect_url : undefined;
  const isSafe = raw?.startsWith("/") && !raw.startsWith("//");
  const fallback = `/${locale}/signedin/thumbnail-analyzer`;
  const after = isSafe ? raw! : fallback;
  console.log("SignUp page, after =", after, "fallback =", fallback);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-xl font-semibold text-foreground">
          Create an account to unlock powerful features
        </h1>

        <SignUp
          // 如果使用者切回登入頁，一樣保留 redirect_url
          signInUrl={`/${locale}/sign-in?redirect_url=${encodeURIComponent(after)}`}
          afterSignUpUrl={after}
          afterSignInUrl={after}
          appearance={{
            variables: {
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorPrimary: "hsl(var(--primary))",
              colorInputBackground: "hsl(var(--card))",
              colorInputText: "hsl(var(--foreground))",
              colorShimmer: "hsl(var(--muted))",
              borderRadius: "var(--radius-lg)",
            },
            elements: {
              card: "bg-card text-card-foreground border border-border rounded-xl shadow",
              headerTitle: "text-lg font-semibold",
              headerSubtitle: "text-sm text-muted-foreground",
              formButtonPrimary:
                "your-org-button org-red-button bg-primary text-primary-foreground hover:opacity-90 " +
                "focus-visible:ring-2 focus-visible:ring-ring rounded-md transition-colors " +
                "disabled:opacity-50 disabled:cursor-not-allowed",
              socialButtonsBlockButton:
                "bg-secondary text-secondary-foreground border border-border rounded-md " +
                "hover:bg-accent hover:text-accent-foreground transition-colors",
              socialButtonsProviderIcon__apple: "text-foreground",
              formFieldLabel: "text-sm text-muted-foreground",
              formFieldInput:
                "input-interactive bg-card text-foreground placeholder:text-muted-foreground " +
                "border-border focus:ring-2 focus:ring-ring",
              formFieldCheckbox__input: "rounded border-border text-primary focus:ring-ring",
              formFieldError: "text-xs text-destructive mt-1",
              footerActionLink: "text-primary hover:underline",
              identityPreviewEditButton: "text-primary hover:underline",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-xs",
              form: "space-y-3",
              footer: "text-sm text-muted-foreground",
              alert: "bg-muted text-foreground border border-border",
            },
          }}
        />
      </div>
    </div>
  );
}
