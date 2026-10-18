import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
export default function NotFound() { return <section className="container not-found"><span className="chapter-number">404</span><h1>This chapter isn’t here.</h1><p>Let’s get you back to something worth exploring.</p><Link href="/" className="button button-primary">All chapters<Arrow /></Link></section>; }
