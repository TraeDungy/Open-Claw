import Hero from "@/components/Hero";
import MarqueeTicker from "@/components/MarqueeTicker";
import CreatorShowcase from "@/components/CreatorShowcase";
import FeaturedStrip from "@/components/FeaturedStrip";
import CraigslistIndex from "@/components/CraigslistIndex";
import ArtGallery from "@/components/ArtGallery";
import DailyJoke from "@/components/DailyJoke";
import SpotlightSections from "@/components/SpotlightSections";
import BlockBanner from "@/components/BlockBanner";
import AgentIntro from "@/components/AgentIntro";
import VersusPreview from "@/components/VersusPreview";
import ThePanel from "@/components/ThePanel";
import GitHubFeed from "@/components/GitHubFeed";
import LogOff from "@/components/LogOff";
import SignupForm from "@/components/SignupForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarqueeTicker />
      <CreatorShowcase />
      <FeaturedStrip />
      <CraigslistIndex />
      <ArtGallery />
      <DailyJoke />
      <SpotlightSections />
      <BlockBanner />
      <AgentIntro />
      <VersusPreview />
      <ThePanel />
      <GitHubFeed />
      <LogOff />
      <SignupForm />
      <Footer />
    </main>
  );
}
