import React from "react";
import { useAuth } from "../../hooks/useAuth";
import HeroSection from "./HeroSection";
import HomeStats from "./HomeStats";
import BentoFeatures from "./BentoFeatures";
import ProcessTimeline from "./ProcessTimeline";
import AudiencePersonas from "./AudiencePersonas";

/**
 * Home Component
 * Entry-level landing page for SkillBridge AI.
 * Displays hero content, interactive terminal mockup playground, bento feature grids,
 * timelines, and user personas. Modularized for maximum maintainability.
 */
const Home = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      <HeroSection user={user} />
      <HomeStats />
      <BentoFeatures />
      <ProcessTimeline />
      <AudiencePersonas />
    </div>
  );
};

export default Home;
