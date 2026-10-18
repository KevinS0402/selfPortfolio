import type { CSSProperties } from "react";

export function HeroName() {
  const letters = (word: string, offset: number) => [...word].map((letter, index) => <span key={index} className="hero-type-letter" style={{ "--letter-delay": `${(.12 + (offset + index) * .095).toFixed(3)}s` } as CSSProperties}>{letter}</span>);
  return <h1 className="hero-name is-typing-name"><span className="sr-only">Kevin Song</span><span className="hero-type-word" aria-hidden="true">{letters("Kevin", 0)}</span>{" "}<em className="hero-type-word" aria-hidden="true">{letters("Song", 5)}</em></h1>;
}
