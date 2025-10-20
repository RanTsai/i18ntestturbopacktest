// app/[locale]/how-to/youtube-views/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import ViewStripScroller from "@/components/ui/faq/view-strip-scroller";
import { auth } from "@clerk/nextjs/server";

const relatedItems = [
  {
    href: "/how-to/youtube-suggested",
    imgSrc: "/how-to/curiosity-lane.png", // 放在 /public/how-to/
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
    href: "/how-to/youtube-home",
    imgSrc: "/how-to/attention-market.png",
    alt: "Overview of YouTube Views",
    label: "Overview",
  },
];

export const metadata: Metadata = {
  title: "The Four Viewer Intents That Decide Your CTR",
  description:
    "Learn how viewer intent shapes your YouTube thumbnail strategy. See your design like your audience, match their mindset, and boost your click-through rate (CTR).",
  keywords: [
    "YouTube thumbnail",
    "viewer intent",
    "click-through rate",
    "thumbnail psychology",
    "thumbnail strategy",
  ],
  openGraph: {
    title: "The Four Viewer Intents That Decide Your CTR",
    description:
      "See your thumbnails the way viewers do. Match mindset, not just aesthetics—and grow CTR with intent-aligned design.",
    url: "https://yourdomain.com/how-to/youtube-thumbnail-viewer-intent",
    type: "article",
  },
  alternates: {
    canonical: "https://yourdomain.com/how-to/youtube-thumbnail-viewer-intent",
  },
};

export default async function ViewerIntentArticlePage() {
  const { userId } = await auth();
  const path = `/${userId ? "signedin" : "free"}`;

  return (
    <main className="mx-auto px-6 py-16 text-foreground max-w-[80ch] lg:max-w-[90ch]">
      <article itemScope itemType="https://schema.org/Article">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold" itemProp="headline">
            The Four Viewer Intents That Decide Your CTR
          </h1>
          <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
            Learn how viewer intent shapes your YouTube thumbnail strategy. See your design like your audience, match their mindset, and boost your click-through rate (CTR).
          </p>
          <meta itemProp="author" content="Koboya AI" />
          <meta itemProp="inLanguage" content="en" />
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
          <h3 id="see-like-viewer">
            <strong>See Your YouTube Thumbnails the Way Viewers Do</strong>
          </h3>
          <p>
            <em>(Because you’re not your audience — and that’s the whole point.)</em>
          </p>
          <div className="my-10 border-t border-border/40" />

          <h3>1️⃣ Let’s be real — your thumbnail decides your fate.</h3>
          <p>If you’ve made your first video, you already know this.</p>
          <p>You upload. You’re excited. You wait. No clicks. We’ve all been there.</p>
          <p>It’s hard to get clicks.</p>
          <p>
            If you’ve made a dozen videos, you understand it even better — it’s <em>really</em> hard to get clicks.
            Even your best design doesn’t.
          </p>
          <p>But —</p>
          <p>
            Your <strong>YouTube thumbnail</strong> decides whether all your late nights, caffeine-fueled edits, and storytelling genius actually <em>get seen</em>.
          </p>

          <p className="flex items-center gap-3 flex-wrap">
            I learned this the hard way.
            <Image
              src="/how-to/crying-cat.png"
              alt="Crying cat meme representing frustration"
              width={96}
              height={96}
              className="rounded-lg border border-border max-h-24 w-auto"
            />
          </p>

          <p>
            After going through all thumbnail tutorials. I cranked the contrast to the max, boosted the saturation until my eyes hurt, and threw in all effects I could find.
          </p>
          <p>But that’s not enough, I needed a face, with exaggerated emotion. Then...</p>

          <p>Will you click this for business advices?</p>
          <figure className="my-10">
            <Image
              src="/how-to/how-to-build-a-business.png"
              alt="Click-heavy business thumbnail with celebrity face and saturated colors"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>

          <p>I don’t know about you, I find it bright, but confusing</p>
          <p>How about just something simple like this?</p>
          <figure className="my-10">
            <Image
              src="/how-to/best-advices-for-small-businesses.png"
              alt="Simple, clear business advice thumbnail with trustworthy portrait"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>

          <p className="mb-2">What I realized is that</p>
          <p>It’s not about design — it’s <strong>strategy</strong>.</p>
          <p>And in this overcrowded arena, being “pretty” doesn’t help. <strong>Being aligned does.</strong></p>

          <p>
            That’s why the{" "}
            <Link href={`${path}/youtube-preview`} className="text-yellow-400 underline">
              <strong>Preview tool</strong>
            </Link>{" "}
            exists — to help you see your thumbnail the way your viewers do.
          </p>
          <p>When you understand what they expect, you stop guessing and start <strong>boosting your CTR</strong> on purpose.</p>

          <p>So what do they expect?</p>
          <div className="my-10 border-t border-border/40" />

          <h3>2️⃣ Viewers have moods — and your thumbnail has to match them.</h3>
          <p>A person on the home feed isn’t the same as someone searching “how to get more views.”</p>
          <p>One is relaxed and exploring, anything could be interesting. The other is desperate, looking for an exact answer.</p>
          <p>Different <strong>view = different mindset = different expectation</strong>.</p>
          <p>There are four main mindsets behind every YouTube click. And if you start designing for those mindsets, you’re already steps ahead.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>3️⃣ The Four Viewer Intents</h3>
          <p>Viewers come to YouTube with roughly 4 main intents.</p>

          {/* === Comparison Table with sticky header + visual rows === */}
          <div className="relative overflow-x-auto my-6 rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
                <tr>
                  <th className="p-3 text-left">Intent</th>
                  <th className="p-3 text-left">What They’re Doing</th>
                  <th className="p-3 text-left">What They Want</th>
                  <th className="p-3 text-left">What Works</th>
                </tr>
              </thead>
              <tbody>
                {/* Problem Solving */}
                <tr className="border-t border-border/50">
                  <td className="p-3">🧩 <strong>Problem Solving</strong></td>
                  <td className="p-3">Searching for answers</td>
                  <td className="p-3">Fast, direct solutions</td>
                  <td className="p-3">“How to ___” / “Fix this in 5 min”</td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/10 rounded-lg p-4">
                      <figure className="rounded-md overflow-hidden border border-border">
                        <Image
                          src="/how-to/how-to-make-a-tie.png"
                          alt="Problem solving example: clear How-to with result"
                          width={640}
                          height={360}
                          className="w-full h-auto object-cover aspect-video"
                          sizes="(max-width: 768px) 100vw, 640px"
                        />
                        <figcaption className="text-xs text-muted-foreground p-2">
                          Clear “How to” + result promise
                        </figcaption>
                      </figure>
                      <figure className="rounded-md overflow-hidden border border-border">
                        <Image
                          src="/how-to/how-to-sum-in-excel.png"
                          alt="Problem solving example: time-bound Excel tutorial"
                          width={640}
                          height={360}
                          className="w-full h-auto object-cover aspect-video"
                          sizes="(max-width: 768px) 100vw, 640px"
                        />
                        <figcaption className="text-xs text-muted-foreground p-2">
                          Time-bound angle (2 mins)
                        </figcaption>
                      </figure>
                    </div>
                  </td>
                </tr>

                {/* Education */}
                 <tr>
                  <th className="p-3 text-left">Intent</th>
                  <th className="p-3 text-left">What They’re Doing</th>
                  <th className="p-3 text-left">What They Want</th>
                  <th className="p-3 text-left">What Works</th>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="p-3">📚 <strong>Education</strong></td>
                  <td className="p-3">Learning or improving skills</td>
                  <td className="p-3">Insight, context, understanding</td>
                  <td className="p-3">Calm, topic-driven, credible</td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3">
                    <figure className="rounded-md border border-border w-full max-w-[640px] mx-auto overflow-hidden">
                      <Image
                        src="/how-to/recession-explained.png"
                        alt="Educational example: data-centric recession thumbnail"
                        width={640}
                        height={360}
                        className="w-full h-auto object-cover aspect-video"
                        sizes="(max-width: 768px) 100vw, 640px"
                      />
                    </figure>
                  </td>
                </tr>

                {/* Entertainment */}
                <tr>
                  <th className="p-3 text-left">Intent</th>
                  <th className="p-3 text-left">What They’re Doing</th>
                  <th className="p-3 text-left">What They Want</th>
                  <th className="p-3 text-left">What Works</th>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="p-3">🎭 <strong>Entertainment</strong></td>
                  <td className="p-3">Relaxing, escaping boredom</td>
                  <td className="p-3">Emotion, novelty, curiosity</td>
                  <td className="p-3">Expressive faces, storytelling</td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3">
                    <figure className="rounded-md border border-border w-full max-w-[640px] mx-auto overflow-hidden">
                      <Image
                        src="/how-to/mr-beast-lion.jpg"
                        alt="Entertainment example: expressive reaction-driven thumbnail"
                        width={640}
                        height={360}
                        className="w-full h-auto object-cover aspect-video"
                        sizes="(max-width: 768px) 100vw, 640px"
                      />
                    </figure>
                  </td>
                </tr>

                {/* Brain-Dead Scroll */}
                 <tr>
                  <th className="p-3 text-left">Intent</th>
                  <th className="p-3 text-left">What They’re Doing</th>
                  <th className="p-3 text-left">What They Want</th>
                  <th className="p-3 text-left">What Works</th>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="p-3">⚡ <strong>Brain-Dead Scroll</strong></td>
                  <td className="p-3">Uncontrollably swiping through videos</td>
                  <td className="p-3">Quick dopamine hit</td>
                  <td className="p-3">Bold, punchy, instant payoff</td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-3">
                    <figure className="rounded-md border border-border w-full max-w-[360px] mx-auto bg-muted/10 p-2 overflow-hidden">
                      <Image
                        src="/how-to/braindead.png"
                        alt="Shorts-style example: bold, punchy visual"
                        width={300}
                        height={300}
                        className="w-full h-auto object-contain"
                        sizes="(max-width: 768px) 80vw, 360px"
                      />
                    </figure>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>When one thumbnail tries to do all 4, the message is unclear</p>
          <figure className="my-10">
            <Image
              src="/how-to/all-4-intents.png"
              alt="Overloaded thumbnail that tries to satisfy all intents"
              width={300}
              height={200}
              className="rounded-lg border border-border mx-auto"
              sizes="(max-width: 768px) 90vw, 300px"
            />
          </figure>

          <p>One thumbnail doesn’t need to dominate all four. Start with one — and speak directly to it.</p>
          <p>Each type of viewer scrolls with a different <em>purpose</em>. Each viewer has different intent in different time.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>4️⃣ Why it matters — context changes everything.</h3>
          <p>Your thumbnail might be great — just not <em>for that moment.</em></p>
          <p>A design that feels “too serious” in an entertainment mood could feel <em>perfect</em> in an educational mindset.</p>
          <p>Don’t aim to please everyone.</p>
          <p>
            Aim to <strong>fulfill one</strong>, so viewers clearly know what to expect — and so does the algorithm.
          </p>
          <p>In the end, it’s all supply and demand. By aligning, you make the <em>supply</em> match the <em>demand</em>.</p>
          <p>That’s why your <strong>YouTube thumbnail strategy</strong> must adapt to intent — not the other way around.</p>
          <p>Knowing is half the battle — testing is the other half.</p>

          <div className="my-10 border-t border-border/40" />

          <h3>5️⃣ Test it. Don’t guess it.</h3>
          <p>You can’t see your own work clearly. You made it. That’s why you need to step into your viewer’s shoes.</p>

          <blockquote>
            <p>🧠 <strong>You can quickly check:</strong></p>
            <ol>
              <li><strong>Shrink test:</strong> Does it still stand out at 1/3 size?</li>
              <li><strong>Context check:</strong> Does it fit the viewer’s mood or intent?</li>
              <li><strong>Emotion test:</strong> What does it make you <em>feel</em> in 0.5 seconds?</li>
            </ol>
          </blockquote>

          <p>
            Use{" "}
            <Link href={`${path}/youtube-preview`} className="text-yellow-400 underline">
              <strong>Preview</strong>
            </Link>{" "}
            to check your <strong>YouTube thumbnails</strong> in different views. See if your design still stands out at one-third size — or if it melts into the noise.
          </p>
          <p>If it doesn’t punch through, tweak it. You’ll feel the difference in your <strong>CTR</strong>.</p>

          <p className="text-center mt-6 py-10">
            <Link
              href={`${path}/youtube-preview`}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-5 py-3 rounded-md hover:bg-yellow-300 transition"
            >
              Try the free Preview →
            </Link>
          </p>


          <h3>6️⃣ Final thought — good thumbnails don’t trick people.</h3>
          <p>Great thumbnails don’t lie; they <strong>translate</strong>.</p>
          <p>They turn your story into one frame that instantly connects with the right audience.</p>
          <p>See like a viewer, not a designer. Talk to humans, not algorithms.</p>
          <p>
            And if you’re not sure what your audience sees — that’s exactly what the{" "}
            <Link href={`${path}/youtube-preview`} className="text-yellow-400 underline">
              <strong>Preview tool</strong>
            </Link>{" "}
            is for.
          </p>

          <blockquote>
            <p>
              <strong>Go see your YouTube thumbnail like your viewers do — before they scroll past it.</strong>
            </p>
          </blockquote>
        </section>
      </article>

      <div className="mt-16">
        <h3 className="text-xl font-semibold text-yellow-400 mb-3">Explore other views</h3>
        <ViewStripScroller
          items={relatedItems}
          height={180}
          speedSec={48}
          direction="left"
          pauseOnHover
        />
        <p className="text-sm text-muted-foreground italic">
          Built by one person. Powered by way too much coffee ☕.
        </p>
      </div>
    </main>
  );
}
