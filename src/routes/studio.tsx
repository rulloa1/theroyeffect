import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

const TITLE = "The Roy Effect Studio";
const DESCRIPTION =
  "The Roy Effect Studio (also called Queue Commander) is The Roy Effect's tool for scheduling and publishing Rory Ulloa's own short videos to his YouTube channel and Facebook Page.";

const PRIVACY_URL = "https://rulloa1.github.io/3d/privacy/";
const TERMS_URL = "https://rulloa1.github.io/3d/terms/";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/studio` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/studio` }],
  }),
  component: StudioPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl uppercase tracking-tight text-white">{children}</h2>
  );
}

function StudioPage() {
  return (
    <div className="min-h-screen bg-[#030014]">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="px-5 pb-16 pt-28 md:px-10 md:pt-36">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl leading-[0.95] text-white md:text-6xl">
            The Roy Effect Studio
          </h1>

          <p className="mt-6 font-mono text-sm leading-relaxed text-white/70">
            The Roy Effect Studio (also called Queue Commander) is The Roy Effect's tool for
            scheduling and publishing Rory Ulloa's own short videos to his YouTube channel and
            Facebook Page.
          </p>

          <H2>What it does</H2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-white/70">
            What it does: queues videos, uploads them to YouTube through the YouTube Data API, posts
            them to The Roy Effect Facebook Page, and shows basic stats.
          </p>

          <H2>Operated by</H2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-white/70">
            Operated by The Roy Effect (Rory Ulloa). Contact:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[#DFBA73] underline underline-offset-4 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </p>

          <H2>Policies</H2>
          <ul className="mt-4 space-y-3 font-mono text-sm">
            <li>
              <a
                href={PRIVACY_URL}
                className="text-[#DFBA73] underline underline-offset-4 hover:text-white"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href={TERMS_URL}
                className="text-[#DFBA73] underline underline-offset-4 hover:text-white"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
