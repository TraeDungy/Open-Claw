import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-bold text-raw mb-4">404</h1>
        <p className="text-chrome text-lg mb-2">Task Failed Successfully.</p>
        <p className="text-chrome/60 text-sm mb-8">
          This page doesn&apos;t exist. But you do. And that&apos;s what matters.
        </p>
        <Link
          href="/"
          className="bg-input text-void px-8 py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors inline-block"
        >
          Back to Raw Input
        </Link>
      </div>
    </main>
  );
}
