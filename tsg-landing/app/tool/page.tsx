import ZenerGame from "@/components/ZenerGame";
import ParticleField from "@/components/ParticleField";

export default function ToolPage() {
  return (
    <main className="relative min-h-screen px-6 py-24">
      <ParticleField />
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.4em] text-ember">SIGNAL DETECTION TOOL</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Train Your Perception</h1>
          <p className="mt-4 text-sm text-bone/50 max-w-lg mx-auto">
            Focus. Select the shape you sense. Observe the result. No tricks, no gimmicks — just you and the signal.
          </p>
        </div>
        <ZenerGame />
      </div>
    </main>
  );
}
