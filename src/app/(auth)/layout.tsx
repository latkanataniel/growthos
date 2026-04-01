export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-md w-full px-4">{children}</div>
    </div>
  );
}
