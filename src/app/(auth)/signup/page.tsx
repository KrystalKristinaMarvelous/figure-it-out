import Link from "next/link";
import { AuthForm } from "../auth-form";
import { Logo } from "@/components/logo";

export const metadata = { title: "Get started — FIO" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-5 py-16">
      <Link href="/" className="mb-10">
        <Logo markSize={22} />
      </Link>
      <h1 className="voice-lg">Figure it out first.</h1>
      <p className="voice mt-1 text-[14px] text-muted">
        A workspace for working out what a project is — before you build it.
      </p>
      <AuthForm mode="signup" next="/dashboard" />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-unresolved underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
