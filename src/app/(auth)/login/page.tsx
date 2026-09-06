import Link from "next/link";
import { AuthForm } from "../auth-form";

export const metadata = { title: "Sign in — FIO" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/dashboard";
  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-5 py-16">
      <Link href="/" className="voice mb-10 text-[22px] italic tracking-[-0.02em] text-ink">
        FIO
      </Link>
      <h1 className="voice-lg">Welcome back</h1>
      <p className="voice mt-1 text-[14px] text-muted">Pick up where you left off.</p>
      <AuthForm mode="login" next={next} />
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-unresolved underline">
          Make an account
        </Link>
      </p>
    </div>
  );
}
