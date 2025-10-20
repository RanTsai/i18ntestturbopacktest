// app/[locale]/how-to/ai-analysis/page.tsx
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
    href: "/how-to/youtube-suggested",
    imgSrc: "/how-to/suggested-view-2.png",
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
    href: "/how-to/youtube-search",
    imgSrc: "/how-to/search-view.png",
    alt: "Search View Preview",
    label: "Search View",
  },
  {
    href: "/how-to/youtube-views",
    imgSrc: "/how-to/over-view.png",
    alt: "Overview of YouTube Views",
    label: "Overview",
  },
];

export const metadata: Metadata = {
  title: "AI-Analysis: Turn Scores Into Clicks",
  description:
    "Learn how to interpret and act on AI thumbnail scores. Understand Clickability, Clarity, Relevance, Emotion, and Branding — and how to adjust your design across Home, Suggested, Mobile, and Search contexts.",
  keywords: [
    "AI thumbnail analyzer",
    "YouTube thumbnail analysis",
    "click-through rate optimization",
    "viewer psychology",
    "thumbnail design AI",
    "YouTube thumbnail clarity",
  ],
  openGraph: {
    title: "AI-Analysis: Turn Scores Into Clicks",
    description:
      "Learn how to interpret and act on AI thumbnail scores across Home, Suggested, Mobile, and Search contexts.",
    url: "https://yourdomain.com/how-to/ai-analysis",
    type: "article",
    images: [{ url: "https://yourdomain.com/how-to/ai-analysis.png" }],
  },
  alternates: {
    canonical: "https://yourdomain.com/how-to/ai-analysis",
  },
};

export default async function AIAnalysisHowToPage() {
  const { userId } = await auth();
  const path = `/${userId ? "signedin" : "free"}`;

  return (
    <main className="mx-auto px-6 py-16 text-foreground max-w-[80ch] lg:max-w-[90ch]">
      <article itemScope itemType="https://schema.org/Article">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold" itemProp="headline">
            AI-Analysis: Turn Scores Into Clicks
          </h1>

          <p className="mt-3 text-sm text-muted-foreground" itemProp="description">
            (Because a number only matters when it helps you change something.)
          </p>

          <meta itemProp="author" content="Thumbnail Analyzer" />
          <meta itemProp="inLanguage" content="en" />

          <figure className="mt-8">
            <Image
              src="/how-to/ai-analysis.png"
              alt="AI-Analysis preview"
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
          <h3>1️⃣ Why Scores Exist — Not to Judge You, but to Guide You</h3>

          <p>Design isn’t a beauty contest.<br />It’s alignment.</p>

          <p>Every thumbnail either <em>fits</em> what viewers expect — or fights it.</p>

          <p>That’s what the AI-Analyzer measures:<br />how well your design aligns with real human psychology.</p>

          <p>Each score (Clickability, Clarity, Relevance, Emotion, Branding) tells you <em>where</em> your idea connects — and where it leaks.</p>

          <p>It’s not about perfection.<br />It’s about knowing <strong>what to fix first.</strong></p>

          <blockquote>
            <p>
              TL;DR: Don’t chase a perfect score.<br />
              Use it like a compass — to find your next smart move.
            </p>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>2️⃣ Four Contexts, Four Mindsets — One Analyzer</h3>

          <p>If you’ve read the previous guides, you already know:</p>

          <table>
            <thead>
              <tr>
                <th>Context</th>
                <th>What the viewer is doing</th>
                <th>What matters most</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🏠 <strong>Home Feed</strong></td>
                <td>Wandering with limited attention</td>
                <td>Clickability + Branding</td>
              </tr>
              <tr>
                <td>🎯 <strong>Suggested Videos</strong></td>
                <td>Continuing a topic</td>
                <td>Relevance + Clarity</td>
              </tr>
              <tr>
                <td>📱 <strong>Mobile Scroll</strong></td>
                <td>Half-distracted swiping</td>
                <td>Clickability + Emotion</td>
              </tr>
              <tr>
                <td>🔍 <strong>Search View</strong></td>
                <td>Problem-solving with intent</td>
                <td>Clarity + Relevance</td>
              </tr>
            </tbody>
          </table>

          <p>Each view has its own <em>psychology</em>, and each psychology changes which scores matter most.</p>

          <p>
            That’s why the Analyzer works like a <strong>“context switcher.”</strong><br />
            When you change the view — Home, Suggested, Mobile, or Search —<br />
            the weight of each score automatically shifts.
          </p>

          <blockquote>
            <p>Different battlefield.<br />Same weapon — but tuned for that fight.</p>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>3️⃣ The Five Core Metrics — and What They Actually Mean</h3>

          <h4>🧠 <strong>Clarity — “Can I understand this in 0.3 seconds?”</strong></h4>
          <p>If people can’t tell <em>what your video is about</em>, they won’t even read the title.</p>
          <p><strong>Low clarity looks like:</strong></p>
          <ul>
            <li>Too many elements</li>
            <li>Words smaller than your thumbnail preview</li>
            <li>Complex lighting or overlapping colors</li>
          </ul>
          <p><strong>Fix it by:</strong></p>
          <ul>
            <li>Focusing on one main subject</li>
            <li>Reducing colors and text</li>
            <li>Turning abstract ideas into visual nouns (objects people instantly recognize)</li>
          </ul>

          <h4>🎯 <strong>Relevance — “Does this fit what I’m looking for?”</strong></h4>
          <p>Viewers don’t want random — they want <em>connected.</em></p>
          <p><strong>Low relevance looks like:</strong></p>
          <ul>
            <li>A thumbnail that doesn’t match the topic or title</li>
            <li>A mood that feels off for the context</li>
            <li>Symbols or visuals that mislead the searcher</li>
          </ul>
          <p><strong>Fix it by:</strong></p>
          <ul>
            <li>Matching the tone and key objects of similar videos</li>
            <li>Using real keywords or familiar imagery</li>
            <li>Showing <em>continuity</em> — not chaos</li>
          </ul>

          <h4>⚡ <strong>Clickability — “Do I feel a reason to click right now?”</strong></h4>
          <p>Clickability is urgency plus clarity.<br />It’s the “What’s in it for me?” test.</p>
          <p><strong>Low clickability looks like:</strong></p>
          <ul>
            <li>Neutral faces, no tension</li>
            <li>Flat results (“just a picture of something”)</li>
            <li>No clear promise or payoff</li>
          </ul>
          <p><strong>Fix it by:</strong></p>
          <ul>
            <li>Showing conflict or result (“Before / After”)</li>
            <li>Using bold contrasts or strong directional lines</li>
            <li>Making your <em>promise</em> visible — not just readable</li>
          </ul>

          <h4>❤️ <strong>Emotion — “Does it make me feel something?”</strong></h4>
          <p>Logic gets attention. Emotion gets action.</p>
          <p><strong>Low emotion looks like:</strong></p>
          <ul>
            <li>No reaction or movement</li>
            <li>Bland color palette</li>
            <li>Perfect design that feels robotic</li>
          </ul>
          <p><strong>Fix it by:</strong></p>
          <ul>
            <li>Adding expressions or motion cues</li>
            <li>Introducing an <em>odd</em> element that creates curiosity</li>
            <li>Playing with lighting and framing to amplify the mood</li>
          </ul>

          <h4>🪶 <strong>Branding — “Do I recognize you without reading?”</strong></h4>
          <p>Branding builds familiarity. But it’s seasoning, not the meal.</p>
          <p><strong>Low branding looks like:</strong></p>
          <ul>
            <li>Every thumbnail looks different</li>
            <li>Your corner logo or tone disappears</li>
            <li>You look like everyone else</li>
          </ul>
          <p><strong>Fix it by:</strong></p>
          <ul>
            <li>Keeping a consistent corner mark or accent color</li>
            <li>Using one recognizable visual trait (font, tone, lighting)</li>
            <li>But always make <strong>clarity &gt; logo</strong></li>
          </ul>

          <blockquote>
            <p><strong>⚠️ Red-Line Rules</strong></p>
            <ul>
              <li>High Clickability + Low Relevance = clickbait → low retention</li>
              <li>High Emotion + Low Clarity = “wow” → scroll away</li>
              <li>High Branding + Low Clarity = self-promotion → no clicks</li>
            </ul>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>4️⃣ How to Use the Analyzer</h3>

          <ol>
            <li>
              <p><strong>Upload up to 6 thumbnails</strong><br />Drag, drop, or click to upload.<br />Resolution helps, but message clarity matters more than pixels.</p>
            </li>
            <li>
              <p><strong>Get the AI Review</strong><br />Click “Get Review.”<br />Instantly see how your design aligns with viewer psychology and curiosity.</p>
            </li>
            <li>
              <p><strong>Read the Radar</strong><br />The radar visual shows which areas are strong — and which break the alignment.</p>
            </li>
            <li>
              <p><strong>Select a Viewing Context</strong><br />Switch between Home / Suggested / Mobile / Search.<br />Watch how weights shift — that’s your <em>battlefield lens.</em></p>
            </li>
            <li>
              <p>
                <strong>Act, Don’t Admire</strong><br />
                Start with the lowest score that appears <strong>first</strong> in the viewer’s decision sequence.<br />
                — In Search → fix Clarity first<br />
                — In Mobile → fix Clickability<br />
                — In Suggested → fix Relevance<br />
                — In Home → refine Branding + Clickability
              </p>
            </li>
            <li>
              <p><strong>Use the Youtube Preview</strong><br />Preview how your thumbnail looks beside real YouTube videos.<br />Does it blend in — or hold its ground?</p>
            </li>
            <li>
              <p><strong>Iterate Intelligently</strong><br />Change one thing.<br />Test again.<br />Keep what improves the score <em>and</em> still fits your story.</p>
            </li>
          </ol>

          <blockquote>
            <p>✳️ Rule of thumb: <strong>One edit, one test.</strong><br />Never change everything at once — you’ll never know what worked.</p>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>5️⃣ Quick Fix Reference</h3>

          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>First Fix</th>
                <th>Second Fix</th>
                <th>Visual Reminder</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Clarity</td>
                <td>Enlarge subject</td>
                <td>Reduce text</td>
                <td>“Understandable in 0.3s”</td>
              </tr>
              <tr>
                <td>Relevance</td>
                <td>Add topic keyword</td>
                <td>Include matching object</td>
                <td>“Feels connected”</td>
              </tr>
              <tr>
                <td>Clickability</td>
                <td>Show contrast / conflict</td>
                <td>Show result</td>
                <td>“Visible promise”</td>
              </tr>
              <tr>
                <td>Emotion</td>
                <td>Add reaction / motion</td>
                <td>Light and color contrast</td>
                <td>“Makes me feel”</td>
              </tr>
              <tr>
                <td>Branding</td>
                <td>Keep consistent corner / tone</td>
                <td>Don’t overpower message</td>
                <td>“Recognizable but clear”</td>
              </tr>
            </tbody>
          </table>

          <div className="my-10 border-t border-border/40" />

          <h3>6️⃣ Common Mistakes</h3>

          <ul>
            <li>Chasing 100/100 — instead of relevance per context.</li>
            <li>Improving design, ignoring psychology.</li>
            <li>Fixing every score at once (no learning).</li>
            <li>Forgetting that <em>each scene has its own gravity.</em></li>
          </ul>

          <blockquote>
            <p>Remember: the AI isn’t grading you.<br />It’s showing where the human brain gets lost.</p>
          </blockquote>

          <div className="my-10 border-t border-border/40" />

          <h3>7️⃣ The Real Goal — Build Iteration as a Habit</h3>

          <p>Winning thumbnails aren’t made. They’re <em>refined.</em></p>

          <p>
            The Analyzer teaches you the same reflex YouTube teaches viewers:<br />
            <strong>see → test → react → repeat.</strong>
          </p>

          <p>You don’t need to impress the AI.<br />You just need to learn faster than everyone else.</p>

          <p>
            That’s how you turn five numbers into one result:<br />
            <strong>more people seeing what you worked so hard to create.</strong>
          </p>

          <div className="my-10 border-t border-border/40" />

          <h3>8️⃣ Next Steps</h3>

          <ul>
            <li>
              <Link href={`${path}/thumbnail/thumbnai-analysis`}><strong>Try AI-Analysis (Free)</strong></Link> → Upload → Get Review → Adjust
            </li>
            <li>
              <Link href={`${path}/thumbnail/youtube-preview`}><strong>Open Youtube Preview</strong></Link> → Test your thumbnail in real YouTube feeds
            </li>
            <li>
              <Link href="/signup"><strong>Sign Up</strong></Link> → Unlock goal-based advice &amp; version tracking
            </li>
          </ul>

          <div className="my-10 border-t border-border/40" />

          <h3>Summary Takeaways</h3>

          <ul>
            <li>Scores aren’t judgment — they’re direction.</li>
            <li>Each viewing context changes which score matters most.</li>
            <li>Always fix clarity before creativity.</li>
            <li>Use “One Edit → One Test” to learn faster.</li>
            <li>Align design with psychology, not just aesthetics.</li>
            <li><strong>Clarity catches eyes. Relevance earns trust.</strong></li>
          </ul>

          <div className="my-10 border-t border-border/40" />

          <h3>SEO Metadata</h3>

          <p><strong>Description:</strong><br />Learn how to interpret and act on AI thumbnail scores. Understand Clickability, Clarity, Relevance, Emotion, and Branding — and how to adjust your design across Home, Suggested, Mobile, and Search contexts.</p>

          <p><strong>Keywords:</strong><br />{["AI thumbnail analyzer", "YouTube thumbnail analysis", "click-through rate optimization", "viewer psychology", "thumbnail design AI", "YouTube thumbnail clarity"]}</p>

          <p><strong>Slug:</strong><br />ai-thumbnail-analysis-how-to-use</p>
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
