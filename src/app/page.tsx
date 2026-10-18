import { StructuredData } from "@/components/ui/StructuredData";
import { pageStructuredData } from "@/lib/structuredData";
import { site } from "@/lib/site";
import { Arrow } from "@/components/ui/Arrow";
import { Portrait } from "@/components/ui/Portrait";
import { WorldExplorer } from "@/components/sections/WorldExplorer";
import { LinkedInPosts } from "@/components/sections/LinkedInPosts";
import { HeroName } from "@/components/ui/HeroName";
import { HeroInteraction, MagneticLink } from "@/components/ui/HeroInteraction";
import { ContourField } from "@/components/ui/ContourField";

export default function Home() {
  return <div className="art-home universe-home journey-home"><StructuredData data={pageStructuredData({ path: "/", name: site.title, description: site.description })}/>
    <HeroInteraction><ContourField className="hero-contours" /><div className="container home-hero-grid">
      <div className="home-intro"><HeroName />
        <p className="home-statement">Building opportunities.<br /><em>Creating experiences.</em></p>
        <p className="home-throughline">Through software, music, and bringing people together.</p>
        <div className="home-context"><p>CS + Business at Vanderbilt <span>· Ingram Scholar</span></p><p>Product &amp; Engineering at Elysian</p></div>
        <div className="hero-actions"><MagneticLink href="#explore" className="button button-primary explore-button">Explore<Arrow direction="down" /></MagneticLink><MagneticLink href="/about/#contact-form" className="button button-secondary">Say hi<Arrow /></MagneticLink></div>
      </div>
      <div className="home-portrait"><Portrait /><p className="portrait-caption">A few different worlds. <span>One Kevin.</span></p></div>
    </div><div className="hero-bottom container"><span>Software / community / music</span><a href="#explore">Follow the thread<Arrow direction="down" /></a></div></HeroInteraction>
    <WorldExplorer />
    <LinkedInPosts />
  </div>;
}
