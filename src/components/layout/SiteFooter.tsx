import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { CopyEmail } from "@/components/ui/CopyEmail";

export function SiteFooter() {
  return <footer id="contact" className="site-footer art-footer"><Reveal><div className="container footer-composition"><div className="footer-introduction"><h2><a href="/about/#contact-form">Something we should build together?<Arrow/></a></h2><p>An idea, an opportunity, or a music rec. Say hi.</p></div><a className="contact-address" href="mailto:kevin.song.1@vanderbilt.edu">kevin.song.1@vanderbilt.edu</a><CopyEmail /><nav aria-label="Social links"><a href="https://www.linkedin.com/in/kevinsong0402/" target="_blank" rel="noreferrer">LinkedIn<Arrow direction="external" /></a><a href="https://github.com/KevinS0402" target="_blank" rel="noreferrer">GitHub<Arrow direction="external" /></a></nav></div></Reveal></footer>;
}
