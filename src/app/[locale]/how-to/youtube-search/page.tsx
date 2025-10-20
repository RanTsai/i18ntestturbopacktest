// app/[locale]/how-to/youtube-search/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import ViewStripScroller from "@/components/ui/faq/view-strip-scroller";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const relatedItems = [
  {
    href: "/how-to/youtube-home",
    imgSrc: "/how-to/attention-market.png",
    alt: "Home Feed Preview",
    label: "Home View",
  },
  {
    href: "/how-to/youtube-mobile",
    imgSrc: "/how-to/purple-cow-test.png",
    alt: "Mobile View Preview",
    label: "Mobile View",
  },
  {
    href: "/how-to/youtube-suggested",
    imgSrc: "/how-to/suggested-view-2.png",
    alt: "Suggested View Preview",
    label: "Suggested View",
  },
  {
    href: "/how-to/youtube-views",
    imgSrc: "/how-to/over-view.png",
    alt: "Overview of YouTube Views",
    label: "Overview",
  },
];

export const metadata: Metadata = {
  title: "The Search View: Picked, Not Pushed",
  description:
    "Understand how viewers decide in YouTube Search: keyword → title → thumbnail → trust → click. Use this page to align your title and thumbnail with search intent.",
  keywords: [
    "YouTube Search thumbnails",
    "search intent",
    "YouTube SEO",
    "title and thumbnail alignment",
    "keyword relevance",
    "precision over curiosity",
  ],
  openGraph: {
    title: "The Search View: Picked, Not Pushed",
    description:
      "In Search, viewers aren’t browsing — they’re eliminating. Learn how keyword precision and trustworthy thumbnails win clicks.",
    url: "https://yourdomain.com/how-to/youtube-search",
    type: "article",
    images: [{ url: "https://yourdomain.com/how-to/youtube-search.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Search View: Picked, Not Pushed",
    description:
      "YouTube Search rewards relevance, not noise. Align your title and thumbnail with intent to earn the click.",
    images: ["https://yourdomain.com/how-to/youtube-search.png"],
  },
  alternates: {
    canonical: "https://yourdomain.com/how-to/youtube-search",
  },
};

export default async function YouTubeSearchHowToPage() {
  const { userId } = await auth();
  const path = `/${userId ? "signedin" : "free"}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "The Search View: Picked, Not Pushed",
        "description":
          "A guide to designing titles and thumbnails that align with YouTube Search intent to build trust and win the click.",
        "author": { "@type": "Person", "name": "Thumbnail Analyzer" },
        "inLanguage": "en",
        "datePublished": "2025-10-10",
        "dateModified": "2025-10-10",
        "image": ["https://yourdomain.com/how-to/youtube-search.png"],
        "mainEntityOfPage": "https://yourdomain.com/how-to/youtube-search",
      },
      {
        "@type": "HowTo",
        "name": "How to Use the YouTube Search Test",
        "description":
          "Check whether your title and thumbnail match search intent and look trustworthy among competing results.",
        "inLanguage": "en",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Enter a search term",
            "text": "Pretend you are the viewer and type the phrase they would use.",
          },
          {
            "@type": "HowToStep",
            "name": "Check your title",
            "text": "Does it match why someone searches this term and promise a fast, clear solution?",
          },
          {
            "@type": "HowToStep",
            "name": "Check your thumbnail",
            "text": "Does it look relevant, credible, and trustworthy enough to earn the click among ten similar results?",
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto px-6 py-16 text-foreground max-w-[80ch] lg:max-w-[90ch]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article itemScope itemType="https://schema.org/Article">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold" itemProp="headline">
            The Search View: Picked, Not Pushed.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
            (The place where viewers don’t get distracted — they get selective.)
          </p>

          <meta itemProp="author" content="Thumbnail Analyzer" />
          <meta itemProp="inLanguage" content="en" />

          <figure className="mt-8">
            <Image
              src="/how-to/youtube-search.png"
              alt="YouTube Search view explanation hero"
              width={1200}
              height={675}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 1024px) 95vw, 1200px"
              priority
            />
          </figure>
        </header>

        <section
          className="prose prose-lg dark:prose-invert leading-8 prose-headings:tracking-tight max-w-none"
          itemProp="articleBody"
        >
          {/* ⬇️ 完整原文，保持段落與斷句 */}
          <div className="my-10 border-t border-border/40" />

          <h3>1️⃣ The Place Where YouTube Works Differently</h3>
          <p>Every view on YouTube starts from curiosity — except this one.</p>
          <p>In Search, people don’t stumble upon videos.</p>
          <p>They demand them.</p>
          <p>This is the one place where viewers, creators, and YouTube all agree on a single thing: <strong>purpose.</strong></p>
          <p>It’s not about catching eyes.</p>
          <p>It’s about <strong>being the answer.</strong></p>

          <div className="my-10 border-t border-border/40" />


          <h3>2️⃣ Tunnel Vision: The Search Mindset</h3>
          <p>When it’s 10 minutes before your upload,</p>
          <p>And you realize your video has no audio.</p>
          <p>You search “how to fix no sound after export.”</p>
          <p>What do you want to watch?</p>
          <p>A 10-minute vlog about someone’s cat?</p>
          <br/>
          <p>Probably not.</p>
          <br/>
          <p>You become instantly irritable,</p>
          <p>like, the video starts with: “Hey guys, welcome back to my channel! Before we dive in, here’s a quick story about how my cat discovered reverb…”</p>
          <p>You can already feel your soul leaving your body.</p>
          <br/>
          <p>Then another one begins:</p>
          <p>“So before we start, don’t forget to like and subscribe, this will tell the algorithm I’m a good person, I’d really appreciate it, because it’ll greatly help me—”</p>
          <p>You’re gone.</p>
          <br/>
          <p>But if that’s the <em>only</em> video that might help,</p>
          <p>you come back, skip around, find the answer —</p>
          <p>and leave.</p>
          <br/>
          <p>See?</p>
          <br/>
          <p>When options are narrowed down, the viewer has <strong>no choice.</strong></p>
          <p>How likely is it that a matching video gets clicked?</p>
          <br/>
          <p>And here’s the twist:</p>
          <blockquote>
            <p>This is also where small channels win.</p>
          </blockquote>
          <p>Because in this moment, it doesn’t matter how many subs you have —</p>
          <p>it only matters if you’re the one who solves the problem <em>faster than anyone else.</em></p>
          <p>That’s not marketing.</p>
          <p>That’s <strong>rescue.</strong></p>
          <br/>
          <p>But not every search is this urgent,</p>
          <p>when viewers search for “funny cats”, they might accept “funny dogs”, or even “funny people”</p>
          <p>because there are 4 different search intents,</p>
          <p>but there’s one thing in common,</p>
          <br/>
          <p>The decision order is inverted.</p>

          <div className="my-10 border-t border-border/40" />


          <h3>3️⃣ The Inverted Order</h3>
          <p>From the moment viewers search,</p>
          <p>Their brain scans for <strong>keywords</strong>, both in titles and thumbnails.</p>
          <ol>
            <li><strong>Keyword</strong> – grabs attention.</li>
            <li><strong>Title</strong> – delivers the promise.</li>
            <li><strong>Thumbnail</strong> – seals the trust.</li>
          </ol>
          <br/>
          <p>That’s the reverse of how the Home Feed, Mobile view, and Suggested Videos work.</p>
          <p>There, it’s thumbnail <em>→ title → emotion → curiosity → click.</em></p>
          <p>Here, it’s keyword <em>→ title → thumbnail → logic → trust → click.</em></p>
          <p>The difference changes everything.</p>
          <br/>
          <p>If your keyword doesn’t hit the intent, nothing else matters — your video never even enters the decision zone.</p>
          <p>And if your thumbnail looks sloppy or untrustworthy,</p>
          <p>the viewer assumes your answer is too.</p>
          <p>Because in Search, the thumbnail isn’t decoration — it’s a credibility test.</p>
          <p>So don’t try to be exciting.</p>
          <p>Try to look <strong>promising.</strong></p>
          <p>Search doesn’t care who you are — just what you solve.</p>

          <div className="my-10 border-t border-border/40" />


          <h3>4️⃣ How Viewers Actually Decide</h3>
          <p>Let’s replay what really happens — not the theory, but the reflex:</p>
          <ol>
            <li>They search a term.</li>
            <li>Their eyes dart through results, hunting for a <strong>matching phrase (in titles and thumbnails).</strong></li>
            <li>They stop at one title that hits the exact problem they typed.</li>
            <li>They glance at the thumbnail to verify it looks <em>relevant, credible, trustworthy.</em></li>
            <li>They click, skim the first seconds, maybe fast-forward.</li>
            <li>If it’s not what they wanted — they’re gone.</li>
          </ol>
          <br/>
          <p>And they repeat this cycle again and again.</p>
          <p>It’s mechanical. Efficient. Ruthless.</p>
          <p>Because Search viewers are not exploring — they’re eliminating.</p>
          <p>You’re not competing for attention —</p>
          <p>you’re competing for <strong>precision.</strong></p>
          <br/>
          <p>That’s what makes the Search view brutal — but fair.</p>
          <p>It rewards relevance, not noise.</p>

          <div className="my-10 border-t border-border/40" />


          <h3>5️⃣ How to Use This Page</h3>
          <p>This test helps you see whether your title and thumbnail align with <strong>search intent</strong>, not just aesthetics.</p>
          <p>Here’s how:</p>
          <ol>
            <li>
              <strong>Enter a search term.</strong>
              <p>Pretend you’re the viewer typing that phrase.</p>
              <p>Don’t think like a creator — think like someone trying to solve a problem fast.</p>
            </li>
            <li>
              <strong>Check your title.</strong>
              <p>Does it match <em>why</em> someone would search this term?</p>
              <p>Does it promise to solve their problem quickly or clearly?</p>
            </li>
            <li>
              <strong>Check your thumbnail.</strong>
              <p>Does it look relevant and promising?</p>
              <p>Would someone scanning ten results stop here with confidence?</p>
            </li>
          </ol>
          <br/>
          <p>Remember — in the search view, you don’t need to stand out.</p>
          <p>You just need to look like the <strong>right answer.</strong></p>
          <p>Because at this stage, “different” isn’t better —</p>
          <p><strong>reliable is.</strong></p>

          <div className="text-center mt-8">
            <Link
              href={`${path}/youtube-preview`}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-5 py-3 rounded-md hover:bg-yellow-300 transition"
            >
              Try the free Preview →
            </Link>
          </div>


          <div className="my-10 border-t border-border/40" />


          <h3>6️⃣ From Precision to Trust</h3>
          <p>Search is cold traffic — but it’s honest traffic.</p>
          <p>These viewers don’t click because they’re curious;</p>
          <p>they click because they believe you might save them time, or solve their problem.</p>
          <br/>
          <p>That’s why your first impression here matters more than anywhere else.</p>
          <p>If you deliver exactly what they came for — clearly, fast, and without fluff —</p>
          <p>you’ve just earned something algorithms can’t fake: <strong>trust.</strong></p>
          <br/>

          <p>And when that happens, they remember.</p>
          <br/>
          <p>Next time they see your face or title on the home feed,</p>
          <p>you’re no longer a stranger.</p>
          <p>You’re the one who <em>helped.</em></p>
          <p>That’s how a single search view becomes the start of belief.</p>
          <br/>
          <p>Because The Search View isn’t about grabbing attention.</p>
          <p>It’s about <strong>earning it</strong> —one keyword at a time.</p>
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
