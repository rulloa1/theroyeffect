import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

const TITLE = "The Roy Effect Studio — Privacy Policy";
const DESCRIPTION =
  "How The Roy Effect Studio (Queue Commander) accesses, uses, stores and deletes data from connected Google, YouTube, Facebook, Instagram and TikTok accounts.";

export const Route = createFileRoute("/studio_/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/studio/privacy` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/studio/privacy` }],
  }),
  component: StudioPrivacyPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl uppercase tracking-tight text-white">{children}</h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-mono text-sm font-bold uppercase tracking-widest text-[#DFBA73]">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 font-mono text-sm leading-relaxed text-white/70">{children}</p>;
}

function Scope({ children }: { children: React.ReactNode }) {
  return <code className="bg-white/5 px-1.5 py-0.5 text-[0.8em] text-white/90">{children}</code>;
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
      <Link to="/studio/terms" className={GOLD_LINK}>
        TERMS OF SERVICE
      </Link>
    </nav>
  );
}

function StudioPrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030014]">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="px-5 pb-16 pt-28 md:px-10 md:pt-36">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl leading-[0.95] text-white md:text-5xl">
            The Roy Effect Studio — Privacy Policy
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/50">
            The Roy Effect Studio (also called Queue Commander) · Effective date: October 4, 2026
          </p>

          <CrossLinks />

          <P>
            This Privacy Policy explains how <strong>The Roy Effect</strong> ("we", "us") handles
            information in <strong>The Roy Effect Studio</strong>, also known as{" "}
            <strong>Queue Commander</strong> (the "App"). The App is a tool Rory Ulloa uses to
            schedule and publish his own videos to his own YouTube channel and Facebook Page, and
            possibly to his own TikTok and Instagram accounts.
          </P>

          <div className="mt-6 rounded border border-white/10 bg-white/5 p-5">
            <p className="font-mono text-sm leading-relaxed text-white/80">
              <strong className="text-white">Summary:</strong> The App only accesses the connected
              accounts that the account owner authorizes. It uses that access to upload and publish
              the owner's own videos and to show basic channel and video stats. We do not sell,
              rent, or share your data, and we do not use it for advertising.
            </p>
          </div>

          <H2>1. Information the App accesses</H2>
          <H3>Google / YouTube</H3>
          <P>When you connect a Google account, the App asks for the following OAuth scopes:</P>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>
              <Scope>https://www.googleapis.com/auth/youtube.upload</Scope>: to upload videos to
              your YouTube channel and set their title, description, privacy status and scheduled
              publish time.
            </li>
            <li>
              <Scope>https://www.googleapis.com/auth/youtube.readonly</Scope>: to read your channel
              details and your list of videos, so the App can show what's been uploaded and confirm
              scheduled posts.
            </li>
            <li>
              <Scope>https://www.googleapis.com/auth/yt-analytics.readonly</Scope>: to read basic
              YouTube Analytics for your channel (for example views and watch time) and show them
              in the App.
            </li>
          </ul>
          <H3>Facebook (Meta)</H3>
          <P>
            When you connect a Facebook account, the App asks for Page permissions that let it list
            the Facebook Pages you manage and publish videos and posts to the Page you choose (for
            example <Scope>pages_show_list</Scope>, <Scope>pages_read_engagement</Scope> and{" "}
            <Scope>pages_manage_posts</Scope>). If Instagram or TikTok publishing is added later,
            the App will ask only for the permissions needed to publish your own content to your own
            accounts and read basic stats about it.
          </P>
          <H3>Other information</H3>
          <P>
            The App stores the video files, titles, descriptions, thumbnails and schedule times you
            add to your queue, plus the OAuth access and refresh tokens it needs to act for you. The
            App does not collect your contacts, your location, payment information or the content of
            other people's accounts.
          </P>

          <H2>2. How we use information</H2>
          <P>Information is used only to:</P>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>
              upload, schedule and publish the account owner's own videos to the owner's connected
              YouTube channel, Facebook Page and other connected accounts;
            </li>
            <li>show basic channel, Page and video information and stats inside the App;</li>
            <li>keep the App running securely and fix problems.</li>
          </ul>
          <P>
            We do not sell, rent, trade or share your information with third parties. We do not use
            it for advertising, profiling or any purpose unrelated to the features above. Data goes
            to Google (YouTube) or Meta (Facebook/Instagram) only when the App calls their APIs to
            carry out an action you asked for.
          </P>

          <H2>3. AI-assisted content suggestions</H2>
          <P>
            The Roy Effect Studio sends aggregate performance statistics for the owner's own videos
            (such as views, watch time, average view duration, likes, comments and shares) to an AI
            language model service, which generates topic, script and caption suggestions for future
            videos. Only these statistics and the app's own video titles and captions are sent. No
            Google account credentials, tokens or other Google user data are sent. This data is not
            used to develop, improve or train generalized AI or machine-learning models, and its use
            complies with the Google API Services User Data Policy, including the Limited Use
            requirements.
          </P>

          <H2>4. Google API Services User Data Policy and Limited Use</H2>
          <P>
            The App's use and transfer to any other app of information received from Google APIs
            will follow the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className={GOLD_LINK}
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. In particular:
          </P>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>
              We use Google user data only to provide or improve the user-facing features described
              in this policy, which are visible and prominent in the App's interface.
            </li>
            <li>
              We transfer Google user data to others only when needed to provide or improve those
              features, to comply with applicable law, or as part of a merger, acquisition or sale
              of assets with notice to users.
            </li>
            <li>
              We do not use or transfer Google user data to serve ads, including retargeting,
              personalized or interest-based ads.
            </li>
            <li>
              We do not sell Google user data, and we do not use or transfer it to determine
              creditworthiness or for lending purposes.
            </li>
            <li>
              No person reads Google user data unless you give affirmative consent for specific
              data, it is needed for security purposes (for example investigating abuse), it is
              needed to comply with applicable law, or the data is aggregated and anonymized for
              internal operations.
            </li>
            <li>
              We do not use Google user data to develop, improve or train generalized or
              non-personalized AI or machine-learning models.
            </li>
          </ul>
          <P>
            The App uses YouTube API Services. By using the YouTube features you also agree to the{" "}
            <a href="https://www.youtube.com/t/terms" className={GOLD_LINK}>
              YouTube Terms of Service
            </a>
            , and Google's handling of your data is covered by the{" "}
            <a href="https://policies.google.com/privacy" className={GOLD_LINK}>
              Google Privacy Policy
            </a>
            .
          </P>

          <H2>5. Storage and security of tokens</H2>
          <P>
            OAuth access and refresh tokens are stored securely, kept out of public code and logs,
            and protected with access controls. They are used only to carry out the actions
            described in this policy. Connections to Google and Meta use encrypted HTTPS.
          </P>

          <H2>6. Data retention and deletion</H2>
          <P>
            We keep tokens and queue data only while an account is connected and the data is needed
            to provide the App's features. When an account is disconnected or access is revoked, its
            tokens are deleted and stop working. Cached channel information and stats are deleted
            when they are no longer needed.
          </P>
          <P>
            <strong className="text-white">To request deletion</strong> of any data the App holds
            about you, including stored tokens, email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request`}
              className={GOLD_LINK}
            >
              rory@theroyeffect.com
            </a>{" "}
            with the subject "Data deletion request". We will delete the data and confirm by email
            within 30 days. This also serves as the data deletion instructions for the App's Meta
            (Facebook) integration.
          </P>

          <H2>7. How to revoke access</H2>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed text-white/70">
            <li>
              <strong className="text-white">Google / YouTube:</strong> go to{" "}
              <a href="https://myaccount.google.com/permissions" className={GOLD_LINK}>
                https://myaccount.google.com/permissions
              </a>
              , choose The Roy Effect Studio and select "Remove access".
            </li>
            <li>
              <strong className="text-white">Facebook:</strong> go to{" "}
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                className={GOLD_LINK}
              >
                Facebook Settings → Business Integrations
              </a>{" "}
              (or{" "}
              <a href="https://www.facebook.com/settings?tab=applications" className={GOLD_LINK}>
                Apps and Websites
              </a>
              ), find The Roy Effect Studio and select "Remove".
            </li>
            <li>
              <strong className="text-white">Instagram / TikTok (if connected):</strong> remove the
              App from the connected apps section of that platform's account settings.
            </li>
          </ul>
          <P>
            After you revoke access, the App can no longer act for you. You can also email us to
            delete any remaining data, as described above.
          </P>

          <H2>8. Children</H2>
          <P>
            The App is not intended for children under 13 and does not knowingly collect information
            from them.
          </P>

          <H2>9. Changes to this policy</H2>
          <P>
            We may update this policy from time to time. Changes will be posted on this page with a
            new effective date.
          </P>

          <H2>10. Contact</H2>
          <P>Questions or requests about this Privacy Policy:</P>
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
    </div>
  );
}
