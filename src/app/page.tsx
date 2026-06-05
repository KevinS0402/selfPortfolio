import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CaseStudyPreview } from "@/components/sections/CaseStudyPreview";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ImpactSnapshot } from "@/components/sections/ImpactSnapshot";
import { OtherWorksCreative } from "@/components/sections/OtherWorksCreative";
import { ProductThinking } from "@/components/sections/ProductThinking";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { SkillsMatrix } from "@/components/sections/SkillsMatrix";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ImpactSnapshot />
        <ProjectShowcase />
        <CaseStudyPreview />
        <ProductThinking />
        <OtherWorksCreative />
        <SkillsMatrix />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
