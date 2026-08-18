import { redirect } from "next/navigation";

/**
 * Stories are posts of kind "story". Rather than maintain a second listing
 * with its own pagination, this route funnels into the one archive so there is
 * a single crawlable, canonical set of URLs.
 */
export default function StoriesPage() {
  redirect("/news?kind=story");
}
