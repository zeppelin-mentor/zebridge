import React from "react";
import PromoBanner from "@/components/landing/PromoBanner";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import IntegrationBanner from "@/components/landing/IntegrationBanner";
import AppPreview from "@/components/landing/AppPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import ToolsCatalog from "@/components/landing/ToolsCatalog";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import BlogSection from "@/components/landing/BlogSection";
import BottomCta from "@/components/landing/BottomCta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ZeBridge',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Universal tooling platform for AI agents. Connect Claude, Cursor, Windsurf, and Gemini to secure, real-world tools via Model Context Protocol (MCP)',
    creator: {
      '@type': 'Organization',
      name: 'Zeppelin Labs',
      url: 'https://zeppelinlabs.digital',
      email: 'team@zeppelinlabs.digital',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '1',
    },
    featureList: [
      'Model Context Protocol (MCP) Server',
      'REST API Endpoints',
      'PDF Manipulation Tools',
      'Image Processing',
      'Document Generation',
      'QR Code Generator',
      'OCR Text Extraction',
      'Secure API Key Authentication',
    ],
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zeppelin Labs',
    url: 'https://zeppelinlabs.digital',
    logo: 'https://zebridge.vercel.app/logo.png',
    email: 'team@zeppelinlabs.digital',
    sameAs: [
      'https://zebridge.vercel.app',
    ],
    founder: {
      '@type': 'Person',
      name: 'Zeppelin Labs Team',
    },
    description: 'Building tools that connect AI agents to the real world',
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      
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

      {/* Platform Workflow explaining ZeBridge */}
      <HowItWorks />

      {/* Implemented Tools Catalog */}
      <ToolsCatalog />

      {/* Features details (MCP, REST API, Sandbox environment) */}
      <Features />

      {/* Transparent pricing plans */}
      <Pricing />

      {/* Latest blog posts */}
      <BlogSection />

      {/* Onboarding bottom CTA banner */}
      <BottomCta />

      {/* Footer metadata details */}
      <Footer />
    </div>
    </>
  );
}
