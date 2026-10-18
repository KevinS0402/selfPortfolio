export type LinkedInPost = {
  id: string;
  title: string;
  summary: string;
  url: string;
  embedUrl: string;
  height: number;
  publishedAt?: string;
  location?: string;
  topics?: string[];
  hashtags?: string[];
};

// Selected public posts, newest first. Resolve and verify the actual embed URN;
// a post's activity ID can differ from its ugcPost ID.
export const linkedinPosts: LinkedInPost[] = [
  {
    id: "7505058926422323200",
    title: "A season of firsts in New York",
    summary: "Kevin’s first LinkedIn post: joining Vanderbilt’s inaugural NYC cohort and starting product and engineering work at Elysian.",
    url: "https://www.linkedin.com/posts/kevinsong0402_this-semester-has-been-a-season-of-firsts-ugcPost-7505058926422323200-btvy/",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7505058926422323200?collapsed=1",
    height: 720,
    publishedAt: "2026-09-14T00:24:46.133Z",
    location: "New York City",
    topics: ["Vanderbilt NYC", "Product & engineering", "Applied AI", "Elysian"],
    hashtags: [],
  },
];
