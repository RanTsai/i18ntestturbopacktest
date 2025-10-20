// app/[locale]/how-to/youtube-home/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ViewStripScroller from "@/components/ui/faq/view-strip-scroller";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const relatedItems = [
  {
    href: "/how-to/youtube-suggested",
    imgSrc: "/how-to/curiosity-lane.png",
    alt: "Suggested View Preview",
    label: "Suggested View",
  },
  {
    href: "/how-to/youtube-mobile",
    imgSrc: "/how-to/purple-cow-test.png",
    alt: "Mobile View Preview",
    label: "Mobile View",
  },
  {
    href: "/how-to/youtube-views",
    imgSrc: "/how-to/over-view.png",
    alt: "Overview of YouTube Views",
    label: "Overview",
  },
];

export const metadata: Metadata = {
  title: "Home Feed: The Attention Market",
  description:
    "Understand why YouTube's Home Feed is an attention market. Learn how to design for visibility (not just beauty), test in context, and win your viewer's first two seconds.",
  keywords: [
    "YouTube Home Feed",
    "attention market",
    "YouTube thumbnail",
    "CTR",
    "thumbnail psychology",
    "visibility vs beauty",
  ],
  openGraph: {
    title: "Home Feed: The Attention Market",
    description:
      "The Home Feed isn't a gallery—it's a filter for attention. See how to design for visibility, test in context, and earn clicks.",
    url: "https://yourdomain.com/how-to/youtube-home",
    type: "article",
    images: [{ url: "https://yourdomain.com/how-to/attention-market.png" }],
  },
  alternates: {
    canonical: "https://yourdomain.com/how-to/youtube-home",
  },
};

export default async function HomeFeedAttentionMarketPage() {
  const { userId } = await auth();
  const path = `/${userId ? "signedin" : "free"}`;

  return (
    <main className="mx-auto px-6 py-16 text-foreground max-w-[80ch] lg:max-w-[90ch]">
      <article itemScope itemType="https://schema.org/Article">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold" itemProp="headline">
            Home Feed: The Attention Market
          </h1>

          <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
            The Home Feed isn&apos;t a gallery—it&apos;s a filter for attention.
          </p>
          <p className="text-sm text-muted-foreground">
            Learn why visibility beats beauty,
          </p>
          <p className="text-sm text-muted-foreground">
            how to test thumbnails in context,
          </p>
          <p className="text-sm text-muted-foreground">
            and how to win the first two seconds.
          </p>

          <meta itemProp="author" content="Thumbnail Analyzer" />
          <meta itemProp="inLanguage" content="en" />

          <figure className="mt-8">
            <Image
              src="/how-to/attention-market.png"
              alt="Overview: Attention Market on YouTube Home Feed"
              width={1200}
              height={675}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 1024px) 95vw, 1200px"
              priority
            />
          </figure>
        </header>

        <section
          className="
            prose prose-lg dark:prose-invert leading-8
            prose-headings:tracking-tight
            prose-h3:mt-10 prose-h3:mb-3
            prose-p:my-4
            prose-ul:my-4 prose-ol:my-4 prose-li:my-1
            prose-blockquote:my-6 prose-img:my-6
            max-w-none
          "
          itemProp="articleBody"
        >
          <p>
            <em>(Welcome to the place where everyone&apos;s fighting for the same two seconds.)</em>
          </p>

          <p className="text-sm">Read:{" "}
            <Link
              href="https://x.com/wono_strategy/status/1615391012226228224"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              @wono_strategy on the Attention Market
            </Link>
          </p>

          <div className="my-10 border-t border-border/40" />

          <h3>1️⃣ The Harsh Truth Nobody Tells You</h3>

          <p>We all spend hours picking colors, adjusting contrast,</p>
          <p>and nudging text by a pixel—</p>
          <p>thinking viewers see this:</p>
          <figure className="my-10">
            <Image
              src="/how-to/viewers-see-thumbnail.png"
              alt="Attention to tiny detail thumbnail"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>

          <p>But when your video lands on YouTube’s home feed, they actually see this:</p>
          <figure className="my-10">
            <Image
              src="/how-to/busy-home-feed.png"
              alt="Busy YouTube Home Feed with many competing thumbnails"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>
          <p>where everything screams, “Pick me!”</p>

          <blockquote>
            <p>The first time I saw my own video on the Home Feed, I froze.</p>
            <p>The thumbnail I thought looked clean and perfect just… disappeared.</p>
            <p>That&apos;s when I realized—there&apos;s a difference between <em>looking good</em> and <em>getting noticed</em>.</p>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>2️⃣ What the “Attention Market” Really Means</h3>

          <p>The Home Feed isn&apos;t a gallery—</p>
          <p>it&apos;s a <strong>filter for attention</strong>.</p>

          <p>People arrive with <strong>limited time and unlimited options</strong>. often with a <strong>single intent</strong>.</p>
          <p>When they watch one video, they can&apos;t watch the others.</p>
          <figure className="my-10">
            <Image
              src="/how-to/audience-choose-one-video.png"
              alt="Audience choosing one video among many"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>
          <p>Because everyone’s time is limited — just like having $10 to spend</p>
          <p>You can&apos;t buy everything—</p>
          <p>you choose.</p>

          <p>Your thumbnail has to <em>sell</em> your video over the others,</p>
          <p>not by shouting louder</p>
          <p>but by being more convincing.</p>
          <br />
          <p>But How?</p>
          <br />
          <blockquote>
            <p>In the attention market, <strong>beauty doesn&apos;t win—visibility does</strong>.</p>
          </blockquote>

          <p>Visibility isn&apos;t louder colors or bigger faces—</p>
          <p>it&apos;s clarity about what&apos;s in it for them.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>3️⃣ Landing: The Algorithm&apos;s First Guess</h3>

          <p>When a viewer lands on Home,</p>
          <p>even YouTube&apos;s ultra-smart algorithm isn&apos;t sure what they want—yet.</p>

          <p>If <em>you</em> were the algorithm,</p>
          <p>what would you recommend to keep them?</p>
          <p>Probably something like:</p>
          <ul>
            <li>A topic they recently searched or watched</li>
            <li>A channel they&apos;ve been following</li>
            <li>A video rising fast among similar audiences</li>
            <li>A trending topic people like them engage with</li>
          </ul>

          <p>YouTube is guessing.</p>
          <p>And so are we.</p>
          <p>To maximize the chance they’ll click, we can follow different strategies, like the B.E.N.S framework</p>
          <p>but that’s another story</p>

          <div className="my-10 border-t border-border/40" />

          <h3>4️⃣ The Real Challenge</h3>

          <p>We can only design in creator&apos;s point of view, hoping the message is clear.</p>
          <p>In Canva or Photoshop, even when everything pops,</p>

          <p>it disappears on Youtube</p>
          <p>because your thumbnail doesn&apos;t live alone—</p>
          <p>it lives between creators like Mr. Beast</p>

          <figure className="my-10">
            <Image
              src="/how-to/mr-beast-views.png"
              alt="Mr. Beast with millions of views"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>

          <p> and Kurzgesagt</p>
          <figure className="my-10">
            <Image
              src="/how-to/kurzgezagt.png"
              alt="Kurzegezgt videos"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>
          <p>and ten other creators who already know how to hack attention.</p>
          <br />
          <p>But… not everyone loves them.</p>
          <p>There will always be someone who clicks your video</p>
          <p>for some unknown reason</p>

          <p>Your job isn&apos;t to win everyone—</p>
          <p>it&apos;s figure out that reason, and connect with <strong>them</strong>.</p>
          <p>More of them.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>5️⃣ What This Page Is For</h3>

          <p>This isn&apos;t a place to show off design.</p>
          <p>It&apos;s where you <strong>test if your thumbnail can survive the real world</strong>.</p>
          <figure className="mt-8">
            <Image
              src="/how-to/youtube-home-2.png"
              alt="Home feed preview page"
              width={1200}
              height={675}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 1024px) 95vw, 1200px"
              priority
            />
          </figure>
          <ol>  
            <li>
              <p><strong>Enter a search term.</strong></p>
              <p>Simulate the type of homepage your video would appear in.</p>
            </li>
            <li>
              <p><strong>Drag your thumbnail and hit “Mix.”</strong></p>
              <p>Watch it blend in—</p>
              <p>or disappear—</p>
              <p>among real videos.</p>
            </li>
            <li>
              <p><strong>Ask three brutally honest questions:</strong></p>
              <ul>
                <li>How fast can you find your video?</li>
                <li>Most-important: Is the topic clear and easy to understand?</li>
                <li>Would <em>you</em> click it?</li>
              </ul>
            </li>
          </ol>

          <blockquote>
            <p>No pressure—this isn&apos;t an exam.</p>
            <p>It&apos;s a mirror.</p>
            <p>If you can answer honestly,</p>
            <p>you&apos;re already ahead of most creators.</p>
          </blockquote>

          <p>Use{" "}
            <Link href={`${path}/youtube-preview`} className="text-yellow-400 underline">
              <strong>Preview</strong>
            </Link>{" "}
            to check your thumbnails in different views.
          </p>
          <p>See if your design still stands out at one-third size—</p>
          <p>or melts into the noise.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>6️⃣ Closing: The First Gate of Attention</h3>

          <p>Don&apos;t panic.</p>
          <p>The Home Feed is just the <strong>first gate</strong> in the attention game.</p>

          <p>Each viewing context—<strong>Home, Up Next, Search, Mobile</strong>—</p>
          <p>has its own psychology.</p>

          <p>What works here might flop elsewhere,</p>
          <p>and that&apos;s fine.</p>

          <p>The trick isn&apos;t one perfect thumbnail—</p>
          <p>it&apos;s understanding <strong>where</strong> your audience meets you,</p>
          <p>and <strong>why</strong> they stop.</p>

          <blockquote>
            <p>The Home Feed is just the beginning.</p>
            <p>The next battlefield is bigger, and your odds get better</p>
          </blockquote>

          <div className="text-center mt-8">
            <Link
              href={`${path}/youtube-preview`}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-5 py-3 rounded-md hover:bg-yellow-300 transition"
            >
              Try the free Preview →
            </Link>
          </div>

          <div className="my-10 border-t border-border/40" />

          <h3 className="!mt-0">✅ Summary Takeaways</h3>

          <ul>
            <li><strong>Attention Market</strong> = limited attention vs unlimited options.</li>
            <li><strong>Beauty ≠ Clickability</strong>—clarity and context win.</li>
            <li>The Home Feed tests visibility, not just design skill.</li>
            <li>Don&apos;t compete with everyone—resonate with someone.</li>
            <li>Test, observe, refine—then win those first two seconds.</li>
          </ul>
        </section>
      </article>

      <div className="mt-16">
        <h3 className="text-xl font-semibold text-yellow-400 mb-3">Explore other views</h3>
        <ViewStripScroller items={relatedItems} height={180} speedSec={48} direction="left" pauseOnHover />
        <p className="text-sm text-muted-foreground italic mt-3">
          Built by one person. Powered by way too much coffee ☕.
        </p>
      </div>
    </main>
  );
}
