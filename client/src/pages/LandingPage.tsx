import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import TechStackSection from "@/components/landing/TechStackSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import EngineeringSection from "@/components/landing/EngineeringSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <TechStackSection />
        <FeaturesSection />
        <WorkflowSection />
        <ArchitectureSection />
        <EngineeringSection />
        <ShowcaseSection />
      </main>
      <Footer />
    </div>
  );
}
