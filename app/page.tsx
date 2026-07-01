import React from "react";
import PromoBanner from "@/components/landing/PromoBanner";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import IntegrationBanner from "@/components/landing/IntegrationBanner";
import AppPreview from "@/components/landing/AppPreview";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B0F19] text-white">
      {/* Promo banner at absolute top */}
      <PromoBanner />

      {/* Floating Transparent Navigation Header */}
      <Header />

      {/* Hero section */}
      <Hero />

      {/* Interactive Mock Dashboard Preview window */}
      <AppPreview />

      {/* Trust banner listing supported AI clients */}
      <IntegrationBanner />

      {/* Features details (MCP, REST API, Sandbox environment) */}
      <Features />

      {/* Transparent pricing plans */}
      <Pricing />

      {/* Footer metadata details */}
      <Footer />
    </div>
  );
}
