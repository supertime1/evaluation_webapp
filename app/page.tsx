import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">LLM Evaluation Dashboard</h1>
        <p className="text-xl mb-8">
          A platform for defining, running, and visualizing LLM evaluation experiments
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
} 