// app/[locale]/how-to/youtube-mobile/page.tsx
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
  title: "Mobile: Scroll Stopper Test",
  description:
    "On YouTube mobile, you get ~0.3 seconds before the thumb scrolls. Learn how remarkability and clarity beat flashy design, and test your thumbnail in a realistic mobile feed.",
  keywords: [
    "YouTube mobile thumbnails",
    "scroll stopper",
    "remarkability",
    "clarity over design",
    "dopamine hit",
    "0.3 seconds",
  ],
  openGraph: {
    title: "Mobile: Scroll Stopper Test",
    description:
      "You have ~0.3s on mobile to stop the scroll. See how behavior, remarkability, and clarity shape effective YouTube thumbnails—then test yours in a realistic feed.",
    url: "https://yourdomain.com/how-to/youtube-mobile",
    type: "article",
    images: [{ url: "https://yourdomain.com/how-to/purple-cow-test.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile: Scroll Stopper Test",
    description:
      "You have ~0.3s on mobile to stop the scroll. Learn why remarkability and clarity win—then test your thumbnail in a realistic feed.",
    images: ["https://yourdomain.com/how-to/purple-cow-test.png"],
  },
  alternates: {
    canonical: "https://yourdomain.com/how-to/youtube-mobile",
  },
};

export default async function YouTubeMobileHowToPage() {
  const { userId } = await auth();
  const path = `/${userId ? "signedin" : "free"}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Mobile: Scroll Stopper Test",
        "description":
          "A guide to designing YouTube mobile thumbnails that stop the scroll using remarkability and clarity.",
        "author": { "@type": "Person", "name": "Thumbnail Analyzer" },
        "inLanguage": "en",
        "datePublished": "2025-10-10",
        "dateModified": "2025-10-10",
        "image": ["https://yourdomain.com/how-to/purple-cow-test.png"],
        "mainEntityOfPage": "https://yourdomain.com/how-to/youtube-mobile",
      },
      {
        "@type": "HowTo",
        "name": "How to Use the Mobile Scroll Stopper Test",
        "description":
          "Test your YouTube mobile thumbnail inside a realistic feed and self-check remarkability and clarity.",
        "inLanguage": "en",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Enter a search term",
            "text": "Find videos around the same topic as yours.",
          },
          {
            "@type": "HowToStep",
            "name": "Drag your thumbnail and hit “Mix.”",
            "text": "See how it looks in a real mobile feed — one at a time.",
          },
          {
            "@type": "HowToStep",
            "name": "Scroll and self-check",
            "text":
              "Ask: Is it instantly understandable? Recognizable to the target audience? Still remarkable among others?",
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
            Mobile: Scroll Stopper Test
          </h1>
          <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
            (Because your thumbnail has 0.3 seconds to earn its existence.)
          </p>

          <meta itemProp="author" content="Thumbnail Analyzer" />
          <meta itemProp="inLanguage" content="en" />

          <figure className="mt-8">
            <Image
              src="/how-to/purple-cow-test.png"
              alt="Mobile scroll stopper preview"
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
          {/* ⬇️ 完整原文，保持 <p> 斷句與結構不變 */}
          <div className="my-10 border-t border-border/40" />


          <h3>1️⃣ Mobile Youtube is a very strange place.</h3>
          <p>One day I was scrolling.</p>
          <p>For some unknown reason, YouTube recommended this weird video to me.</p>
          <p>There was no graphic design in the thumbnail at all</p>
          <figure className="mt-8 text-center">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/HHA1cPctV-4"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg border border-border mx-auto"
            ></iframe>
            <figcaption className="mt-2 text-sm text-muted-foreground">
              Title: Monkey appears, spins and then screams.
            </figcaption>
          </figure>
          <p>The title was plain and boring.</p>
          <p>And for some mysterious reason, I clicked. (By the way, I rarely watch Shorts.)</p>
          <p>The monkey delivered every bit in the title, nothing more, nothing less. It wasn&apos;t a clickbait.</p>
          <p>And for some other unknown reason, I just couldn&apos;t stop rewatching. I hope you&apos;re not weird like me.</p>
          <p>But if you are, welcome to the club.</p>
          <p>
            And if you&apos;re not, I&apos;m pretty sure there are other strange videos recommended for some reasons that hook you
            the same way.
          </p>
          <br />
          <p>But why?</p>

          <div className="my-10 border-t border-border/40" />

          <h3>2️⃣ The Reality of Mobile: The Scroll</h3>
          <p>I asked myself, how can I do this to other people?</p>
          <p>I noticed most people watch YouTube on mobile</p>
          <p>Sometimes we watch channels they already know, but other times, we aren&apos;t really trying to do anything</p>
          <p>It&apos;s not “searching for content” — it&apos;s like hoping something interesting finds us</p>
          <p>Think about how many times you opened YouTube that…</p>
          <p>You didn&apos;t plan it — your thumb did.</p>
          <p>You told yourself “just one video,”</p>
          <p>and 40 minutes later you were deep into “why pigeons hate drones.”</p>
          <p>That&apos;s the mindset your thumbnail is fighting against.</p>
          <p>Not curiosity — <strong>addiction</strong>.</p>
          <p>Its job isn&apos;t to convince a focused viewer, but to interrupt a distracted one.</p>

          <div className="my-10 border-t border-border/40" />

          <p>How?</p>
          <div className="my-10 border-t border-border/40" />


          <h3>3️⃣ The Scroll Stopper</h3>
          <p>
            On mobile, a viewer sees one thumbnail at a time — and they&apos;re already thinking about the next one. Every
            swipe is muscle memory.
          </p>
          <p>The thumb moves by itself.</p>
          <p>The thumbnail appears first, the title follows.</p>
          <p>The viewer first sees thumbnail, if it&apos;s interesting VISUALLY, then they read the title.</p>
          <p>They&apos;re not asking, “Is this about me?”</p>
          <p>They&apos;re not asking, “Is the thumbnail well designed?”</p>
          <p>They&apos;re asking, “???”</p>
          <p>You get <strong>0.3 seconds</strong> to trigger interest before the thumb moves again.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>4️⃣ The Myth of the Purple Cow</h3>
          <p>MrBeast once said, “Be a purple cow” — </p>
          <p>When passing by a purple cow, you&apos;d probably turn your head because you&apos;ve never seen one.</p>
          <p>
            Purple cow, (<a href="https://en.wikipedia.org/wiki/Purple_Cow:_Transform_Your_Business_by_Being_Remarkable">an idea in marketing</a>),
            do something so new/big/strange that people can&apos;t ignore it.
          </p>
          <p>But now, with the AI power, the internet is full of cows with every color imaginable,</p>
          <p>and unimaginable</p>
          <p>When everything looks surprising, does surprise still work?</p>
          <p>Here&apos;s a better word for purple cow: <em>Remarkability</em>.</p>
          <p>
            (Where I learned about it{" "}
            <a href="https://x.com/wono_strategy/status/1615391012226228224">here</a>)
          </p>
          <p>
            The “purple cow” isn&apos;t weirdness — it&apos;s <strong>remarkability</strong>.
          </p>
          <blockquote>
            <p>“Oh, what is that?”</p>
          </blockquote>
          <p>They&apos;ll quickly have a look, and find themselves hooked. This often happens subconsciously.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>5️⃣ Remarkability and Clarity</h3>
          <p>But how do you communicate remarkable ideas that have probably never been seen or thought of by others?</p>
          <p>How can they understand an uncommon idea?</p>
          <p>This is where the thumbnail design happens.</p>
          <p>Not by shiny design, but present remarkability VISUALLY.</p>
          <p>Show the main object/idea first, as clear as humanly possible, get people to tell you if it is clear.</p>
          <p>Design elements are for brand recognition, not the message.</p>
          <p>Design is for your brand. <strong>Clarity is for the click.</strong></p>
          <p>If the message is too hard to understand, the viewer wouldn&apos;t even bother.</p>
          <p>The thumbnail has 0.3 second for make the viewer understand the message.</p>
          <p>• <em>Make them stop — <strong>then</strong> make them curious.</em></p>

          <div className="my-10 border-t border-border/40" />

          <h3>6️⃣ How to Use This Page</h3>
          <figure className="mt-8">
            <Image
              src="/how-to/youtube-mobile-2.png"
              alt="mobile Videos preview page"
              width={1200}
              height={675}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 1024px) 95vw, 1200px"
              priority
            />
          </figure>
          <p>
            This test helps you see whether your thumbnail can <strong>stop the scroll</strong> with its <em>remarkablility</em>.
          </p>
          <p><strong>Here&apos;s how:</strong></p>
          <ol>
            <li>
              <strong>Enter a search term.</strong> Find videos around the same topic as yours.
            </li>
            <li>
              <strong>Drag in your thumbnail and hit “Mix.”</strong> See how it looks in the real mobile feed — one at a
              time.
            </li>
            <li>
              <strong>Scroll and ask yourself:</strong>
              <ul>
                <li>Can someone instantly understand what this video is about?</li>
                <li>Are the objects recognizable by the target audience?</li>
                <li>Is it still remarkable even sitting among the other thumbnails?</li>
              </ul>
            </li>
          </ol>
          <blockquote>
            <p>Don&apos;t make viewers think.</p>
            <p>Thinking = scrolling away.</p>
            <p>“If they need to think, you&apos;ve already lost to the next monkey.”</p>
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

          <h3>7️⃣ Remarkability doesn&apos;t come from graphic design</h3>
          <p>Thumbnails and titles are just the packaging for your video ideas.</p>
          <p>The <em>idea</em> is the base of the packaging — the core ingredient that gives everything flavor.</p>
          <p>You can polish, glow, and animate a weak idea, but it&apos;ll still taste like nothing.</p>
          <p>Because design can make something <em>look</em> interesting, but only an idea can make it <em>worth</em> talking about.</p>
          <p>Remarkability isn&apos;t built in Photoshop. It&apos;s born from a thought so strong it deserves to exist — even without the thumbnail.</p>
          <p><strong>You don&apos;t design remarkability — you discover it.</strong></p>
          <p>How do you discover remarkable ideas? That&apos;s another story we&apos;ll talk about soon.</p>
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
