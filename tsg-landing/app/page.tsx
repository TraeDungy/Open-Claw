import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import ProgressionPath from "@/components/ProgressionPath";
import SignupForm from "@/components/SignupForm";
import ToolPreview from "@/components/ToolPreview";
import TrainingModes from "@/components/TrainingModes";
import ParticleField from "@/components/ParticleField";

export default function Home() {
  return (
    <main className="relative">
      <ParticleField />
      <Hero />
      <Pillars />
      <ToolPreview />
      <ProgressionPath />
      <TrainingModes />
      <SignupForm />
      <Footer />
    </main>
  );
}
