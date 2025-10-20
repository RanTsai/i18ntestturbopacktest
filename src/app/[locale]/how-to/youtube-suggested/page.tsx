  // app/[locale]/how-to/youtube-suggested/page.tsx
  import type { Metadata } from "next";
  import Link from "next/link";
  import ViewStripScroller from "@/components/ui/faq/view-strip-scroller";
  import Image from "next/image";
  import { auth } from "@clerk/nextjs/server";

  const relatedItems = [
    {
      href: "/how-to/youtube-home",
      imgSrc: "/how-to/attention-market.png",
      alt: "Home Feed Preview",
      label: "Home Feed",
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
    title: "Suggested Video: The Real Battlefield",
    description:
      "Suggested Videos is where small creators actually stand a chance. Learn how relevance and context make your video the natural next step.",
    keywords: [
      "YouTube Suggested Videos",
      "Up Next",
      "YouTube recommendation",
      "thumbnail relevance",
      "context over design",
      "trust by association",
    ],
    openGraph: {
      title: "Suggested Video: The Real Battlefield",
      description:
        "The real battle isn't the Home Feed—it's the Suggested Videos lane. See how to become the next click through relevance and context.",
      url: "https://yourdomain.com/how-to/youtube-suggested",
      type: "article",
      images: [{ url: "https://yourdomain.com/how-to/youtube-suggested-2.png" }],
    },
    alternates: {
      canonical: "https://yourdomain.com/how-to/youtube-suggested",
    },
  };

  export default async function SuggestedVideoRealBattlefieldPage() {
    const { userId } = await auth();
    const path = `/${userId ? "signedin" : "free"}`;

    return (
      <main className="mx-auto px-6 py-16 text-foreground max-w-[80ch] lg:max-w-[90ch]">
        <article itemScope itemType="https://schema.org/Article">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold" itemProp="headline">
              Suggested Video: The Real Battlefield
            </h1>

            <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
              (Where small creators actually stand a chance.)
            </p>

            <meta itemProp="author" content="Thumbnail Analyzer" />
            <meta itemProp="inLanguage" content="en" />

            <figure className="mt-8">
              <Image
                src="/how-to/suggested-view-2.png"
                alt="Suggested Videos: The Real Battlefield"
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
            <div className="my-10 border-t border-border/40" />

            <h3>1️⃣ Everyone talks about winning the Home Feed.</h3>

            <p>But let&apos;s be honest — if you&apos;re a small channel, how often do you really beat the giants there?</p>

            <p>Viewers already <em>trust</em> those creators. They&apos;ve been clicking them for years.</p>

            <p>That&apos;s not a fair fight.</p>

            <p>The Home Feed is the first battlefield.</p>

            <p>The <strong>real</strong> one — the one where things actually happen — is right next to it:</p>

            <p><strong>the Suggested Videos.</strong></p>

            <div className="my-10 border-t border-border/40" />


            <h3>2️⃣ The Second Attention Market</h3>

            <p>If the Home Feed runs on reputation, Suggested Videos runs on <strong>relevance</strong>.</p>

            <p>Viewers here aren&apos;t randomly scrolling anymore.</p>

            <p>They&apos;re already watching, focused, curious — halfway invested.</p>

            <p>Your job now isn&apos;t to shout louder; it&apos;s to <em>fit perfectly</em>.</p>

            <p>They&apos;ve just watched a video, and now they&apos;re asking,</p>

            <p>“What&apos;s the next piece of this story?”</p>

            <blockquote>
              <p>In the Suggested Videos, your video is more relevant to the video playing on the left.</p>
            </blockquote>

            <div className="my-10 border-t border-border/40" />

            <h3>3️⃣ My 30-View Miracle</h3>

            <p>Many years ago I once had a video of a abandoned channel that sat there for over a year.</p>
            <figure className="mt-8 text-center group">
              <a
                href="https://youtu.be/0Md1M6NPgkM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform duration-300 group-hover:scale-105"
              >
                <Image
                  src="/how-to/siren-head-thriller.png"
                  alt="Siren head thriller thumbnail"
                  width={300}
                  height={200}
                  className="rounded-lg border border-border mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  sizes="(max-width: 1024px) 95vw, 1200px"
                  priority
                />
                <figcaption className="mt-2 text-sm text-muted-foreground group-hover:text-foreground font-medium">
                  Siren Head Thriller
                </figcaption>
              </a>
            </figure>


            <p>Thirty views. Not thirty thousand — just thirty.</p>
            <p>Per month.</p>
            <p>Then, out of nowhere, it exploded — a thousand views overnight</p>
            <p>And then every day.</p>
            <figure className="mt-8">
              <Image
                src="/how-to/blow-up-1.png"
                alt="Blow up 1"
                width={300}
                height={200}
                className="rounded-lg border border-border mx-auto"
                sizes="(max-width: 1024px) 95vw, 1200px"
                priority
              />
            </figure>
            <p>I wanted to find out why, so that I can repeat it.</p>
            <p>The finding?</p>

            <p>A bigger channel&apos;s popular video started recommending mine.</p>
            <figure className="mt-8 text-center group">
              <a
                href="https://youtu.be/zYhVLkKXjWY?si=4xxjxxo3Mx5xA5qY"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform duration-300 group-hover:scale-105"
              >
                <Image
                  src="/how-to/siren-head.jpg"
                  alt="Siren head thriller thumbnail"
                  width={300}
                  height={200}
                  className="rounded-lg border border-border mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  sizes="(max-width: 1024px) 95vw, 1200px"
                  priority
                />
                <figcaption className="mt-2 text-sm text-muted-foreground group-hover:text-foreground font-medium">
                  The Siren Head Movie
                </figcaption>
              </a>
            </figure>


            <p>My thumbnail didn&apos;t stand out on the Home Feed at all,</p>

            <p>but next that video, it became <em>irresistible.</em></p>

            <p>The topic aligned perfectly — it felt like a natural “next step.”</p>

            <p>So, to test the theory.</p>

            <p>I made another one with a similar connection.</p>
            <figure className="mt-8 text-center group">
              <a
                href="https://youtu.be/ZsS_RN-WKr4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform duration-300 group-hover:scale-105"
              >
                <Image
                  src="/how-to/siren-head-weird-movie-trailer.jpg"
                  alt="Siren head weird movie trailer thumbnail"
                  width={300}
                  height={200}
                  className="rounded-lg border border-border mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  sizes="(max-width: 1024px) 95vw, 1200px"
                  priority
                />
                <figcaption className="mt-2 text-sm text-muted-foreground group-hover:text-foreground font-medium">
                  The Siren Head Weird Movie Trailer
                </figcaption>
              </a>
            </figure>

            <p>It blew up again.</p>
            <figure className="mt-8">
              <Image
                src="/how-to/blow-up-2.png"
                alt="Blow up 2"
                width={300}
                height={200}
                className="rounded-lg border border-border mx-auto"
                sizes="(max-width: 1024px) 95vw, 1200px"
                priority
              />
            </figure>
            <p>That&apos;s when I learned something important:</p>

            <p><strong>context can do what design alone can&apos;t.</strong></p>

            <p>Because, the first video selects audience for your video.</p>

            <div className="my-10 border-t border-border/40" />

            <h3>4️⃣ How It Works</h3>

            <p>When viewers first explore a topic, they probably click what&apos;s familiar — the big channels.</p>

            <p>But once they&apos;ve watched a few videos and start asking related questions,</p>

            <p>they become curious wanderers.</p>

            <p>That&apos;s the window.</p>

            <p>Because now, the algorithm is matching <em>intent</em>, not fame.</p>

            <p>And when those viewers find value in your video,</p>

            <p>the next time they see your face on the Home Feed,</p>

            <p>you&apos;re no longer a stranger.</p>

            <p>That&apos;s how trust quietly transfers.</p>

            <blockquote>
              <p>One good “Suggested Videos” moment can rewrite your channel&apos;s history.</p>
            </blockquote>

            <p>The next thing is to figure out, how to link your video to another, but that&apos;s another story.</p>

            <div className="my-10 border-t border-border/40" />


            <h3>5️⃣ How to Use This Page</h3>

            <p>This page helps you see if your video <em>deserves</em> to be next —</p>
            <figure className="mt-8">
              <Image
                src="/how-to/youtube-suggested-2.png"
                alt="Suggested Videos preview page"
                width={1200}
                height={675}
                className="rounded-lg border border-border mx-auto"
                sizes="(max-width: 1024px) 95vw, 1200px"
                priority
              />
            </figure>

            <p>not louder, not flashier, just relevant.</p>

            <p>So that when it does, it gets clicks.</p>

            <p><strong>Here&apos;s how it works:</strong></p>

            <ol>
              <li>
                <p><strong>Enter a search term.</strong></p>
                <p>Find real videos in your topic area.</p>
              </li>
              <li>
                <p><strong>Drag your thumbnail and hit “Mix.”</strong></p>
                <p>Place your video next to theirs — this is what viewers actually see.</p>
              </li>
              <li>
                <p><strong>Pick a video to connect with.</strong></p>
                <p>Drop your thumbnail beside it or click any video on the right to compare.</p>
              </li>
              <li>
                <p><strong>Now ask yourself:</strong></p>
                <ul>
                  <li>Does my video feel naturally connected to this one?</li>
                  <li>Would a viewer <em>expect</em> mine to come next?</li>
                  <li>Does my thumbnail look interesting <em>in that context</em>?</li>
                </ul>
              </li>
            </ol>

            <blockquote>
              <p>You&apos;re not fighting for the first click anymore —</p>
              <p>you&apos;re fighting for the <strong>next</strong> one.</p>
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

            <h3>6️⃣ Final Thoughts: The Long Game</h3>

            <p>Don&apos;t stress if the Home Feed ignores you.</p>

            <p>The algorithm has another door — and this one&apos;s wide open.</p>

            <p>Suggested Videos is how small creators get discovered through <strong>trust by association</strong>.</p>

            <p>It&apos;s slower, quieter, but it lasts longer.</p>

            <p>Thumbnails and titles still matter, sure.</p>

            <p>But they&apos;re only part of a bigger, much more interesting game…</p>

            <p>and that&apos;s a story for the next page.</p>
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
