export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div className="flex min-h-screen flex-col bg-surface">{children}</div>;
}
