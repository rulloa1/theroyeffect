import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

const TITLE = "The Roy Effect Studio — Terms of Service";
const DESCRIPTION =
  "Terms of Service for The Roy Effect Studio (Queue Commander), The Roy Effect's tool for scheduling and publishing videos to connected YouTube and Facebook accounts.";

export const Route = createFileRoute("/studio_/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/studio/terms` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/studio/terms` }],
  }),
  component: StudioTermsPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl uppercase tracking-tight text-white">{children}</h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 font-mono text-sm leading-relaxed text-white/70">{children}</p>;
}

const GOLD_LINK =
  "text-[#DFBA73] underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]";

function CrossLinks() {
  return (
    <nav
      aria-label="Studio pages"
      className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-widest"
    >
      <Link to="/studio" className={GOLD_LINK}>
        ← THE ROY EFFECT STUDIO
      </Link>
      <Link to="/studio/privacy" className={GOLD_LINK}>
        PRIVACY POLICY
      </Link>
    </nav>
  );
}

function StudioTermsPage() {
  return (
    <div className="min-h-screen bg-[#030014]">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="px-5 pb-16 pt-28 md:px-10 md:pt-36">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl leading-[0.95] text-white md:text-5xl">
            The Roy Effect Studio — Terms of Service
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/50">
            The Roy Effect Studio (also called Queue Commander) · Effective date: October 4, 2026
          </p>

          <CrossLinks />

          <P>
            These Terms of Service ("Terms") cover your use of{" "}
            <strong>The Roy Effect Studio</strong>, also known as <strong>Queue Commander</strong>{" "}
            (the "App"), operated by <strong>The Roy Effect</strong> ("we", "us"). By using the App
            you agree to these Terms.
          </P>

          <H2>1. What the App does</H2>
          <P>
            The App is a tool for scheduling and publishing your own videos to your own connected
            accounts, such as a YouTube channel and a Facebook Page, and possibly TikTok and
            Instagram, and for showing basic stats about that content.
          </P>

          <H2>2. Your accounts and content</H2>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>You may connect only accounts that you own or are authorized to manage.</li>
            <li>
              You keep all rights to your content. You give the App permission to upload and publish
              that content to the accounts and at the times you choose.
            </li>
            <li>
              You are responsible for making sure your content follows the law and the rules of each
              platform, including the{" "}
              <a href="https://www.youtube.com/t/terms" className={GOLD_LINK}>
                YouTube Terms of Service
              </a>
              ,{" "}
              <a href="https://policies.google.com/privacy" className={GOLD_LINK}>
                Google Privacy Policy
              </a>
              , and{" "}
              <a href="https://www.facebook.com/terms.php" className={GOLD_LINK}>
                Meta Terms
              </a>
              .
            </li>
          </ul>

          <H2>3. Acceptable use</H2>
          <P>
            Do not use the App to post spam, infringe other people's rights, upload unlawful
            content, or get around any platform's limits or policies.
          </P>

          <H2>4. Third-party services</H2>
          <P>
            The App relies on YouTube API Services, Meta APIs and other third-party platforms. We do
            not control those services and are not responsible for their availability, changes or
            decisions (for example removing a video or limiting an account).
          </P>

          <H2>5. Privacy</H2>
          <P>
            How the App handles your data is described in our{" "}
            <Link to="/studio/privacy" className={GOLD_LINK}>
              Privacy Policy
            </Link>
            .
          </P>

          <H2>6. Disclaimer</H2>
          <P>
            The App is provided "as is" and "as available", without warranties of any kind. We do
            not guarantee that uploads or scheduled posts will always succeed or happen at an exact
            time. Please check important posts on the platform itself.
          </P>

          <H2>7. Limitation of liability</H2>
          <P>
            To the extent the law allows, The Roy Effect is not liable for any indirect, incidental
            or consequential damages, or for any loss of data, content, revenue or audience, that
            comes from using or being unable to use the App.
          </P>

          <H2>8. Ending use</H2>
          <P>
            You can stop using the App at any time and revoke its access, as described in the{" "}
            <Link to="/studio/privacy" className={GOLD_LINK}>
              Privacy Policy
            </Link>
            . We may suspend or end access to the App if these Terms are broken.
          </P>

          <H2>9. Changes</H2>
          <P>
            We may update these Terms from time to time. Changes will be posted on this page with a
            new effective date. If you keep using the App after a change, you accept the updated
            Terms.
          </P>

          <H2>10. Contact</H2>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className={GOLD_LINK}>
                rory@theroyeffect.com
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href="tel:+13464623734" className={GOLD_LINK}>
                (346) 462-3734
              </a>
            </li>
          </ul>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
