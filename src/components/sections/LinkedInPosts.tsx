import Image from "next/image";
import { media } from "@/data/media";
import { linkedinPosts } from "@/data/linkedinPosts";
import { Arrow } from "@/components/ui/Arrow";
import { ContourField } from "@/components/ui/ContourField";
import { Reveal } from "@/components/ui/Reveal";

const postDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

export function LinkedInPosts() {
  if (!linkedinPosts.length) return null;
  return <section className="container linkedin-section" aria-labelledby="linkedin-heading">
    <ContourField className="linkedin-atmosphere"/>
    <Reveal><div className="section-heading"><h2 id="linkedin-heading">What I’ve been up to</h2><p>A few things happening lately.</p></div></Reveal>
    <div className="linkedin-posts">{linkedinPosts.map(post => <Reveal variant="unfold" key={post.id}><article className="linkedin-post">
      <div className="post-editorial liquid-glass">
        <header className="post-author"><Image src={media.portrait[320].webp} width={48} height={48} alt="" /><div><strong>Kevin Song</strong><span>Shared on LinkedIn</span></div><span className="linkedin-mark" aria-hidden="true">in</span></header>
        <div className="post-metadata">{post.publishedAt && <time dateTime={post.publishedAt}>{postDate.format(new Date(post.publishedAt))}</time>}{post.location && <span>{post.location}</span>}</div>
        <h3>{post.title}</h3><p>{post.summary}</p>
        {!!post.topics?.length && <div className="post-topics"><span className="code-caption">Topics</span><ul aria-label="Post topics">{post.topics.map(topic => <li key={topic}>{topic}</li>)}</ul></div>}
        {!!post.hashtags?.length && <p className="post-hashtags">{post.hashtags.map(tag => tag.startsWith("#") ? tag : `#${tag}`).join(" ")}</p>}
        <a className="text-link" href={post.url} target="_blank" rel="noreferrer">Read on LinkedIn<Arrow direction="external" /></a>
      </div>
      <Reveal className="linkedin-frame liquid-glass" variant="unfold"><iframe src={post.embedUrl} height={post.height} width="504" loading="lazy" title={`LinkedIn post by Kevin Song: ${post.title}`} referrerPolicy="strict-origin-when-cross-origin" /><a href={post.url} target="_blank" rel="noreferrer" className="embed-fallback">Open the original post on LinkedIn<Arrow direction="external" /></a></Reveal>
    </article></Reveal>)}</div>
  </section>;
}
