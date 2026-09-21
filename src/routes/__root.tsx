import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import spaceGroteskLatin from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
import archivoLatin from "@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { captureClientError, initSentryClient } from "../lib/sentry/client";
import { AuthProvider } from "@/hooks/useAuth";
import { FirebaseProvider } from "@/integrations/firebase/provider";
import { SiteFooter } from "@/components/SiteFooter";

const SQUARE_BUTTON =
  "inline-flex items-center justify-center rounded-none px-6 min-h-12 font-mono text-xs font-bold tracking-widest";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center bg-[var(--ground)] px-[var(--gutter)] py-[var(--section-y)]">
      <div className="mx-auto w-full max-w-7xl">
        <span className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">404</span>
        <h1 className="mt-4 font-portfolio text-[length:var(--type-h2)] font-bold leading-none text-[var(--ink)]">
          This page isn't here.
        </h1>
        <p className="mt-4 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
          The link may be old, or the page moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            hash="work"
            className={`${SQUARE_BUTTON} border border-[var(--line)] text-[var(--ink)]`}
          >
            BACK TO THE WORK
          </Link>
          <Link to="/audit" className={`${SQUARE_BUTTON} bg-[var(--furnace)] text-black`}>
            GET YOUR FREE AUDIT
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    captureClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center bg-[var(--ground)] px-[var(--gutter)] py-[var(--section-y)]">
      <div className="mx-auto w-full max-w-7xl">
        <span className="font-mono text-xs font-bold tracking-widest text-[var(--gold)]">ERROR</span>
        <h1 className="mt-4 font-portfolio text-[length:var(--type-h2)] font-bold leading-none text-[var(--ink)]">
          This page didn't load.
        </h1>
        <p className="mt-4 max-w-[60ch] font-portfolio-body text-base leading-relaxed text-[var(--ink-muted)]">
          Something went wrong on our end. You can try again, or head back to the work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={`${SQUARE_BUTTON} border border-[var(--line)] text-[var(--ink)]`}
          >
            TRY AGAIN
          </button>
          <a href="/audit" className={`${SQUARE_BUTTON} bg-[var(--furnace)] text-black`}>
            GET YOUR FREE AUDIT
          </a>
        </div>
      </div>
    </div>
  );
}

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://theroyeffect.com/#person",
      name: "Rory Ulloa",
      jobTitle: "Creative Director & UI/UX Designer",
      url: "https://theroyeffect.com/about",
      worksFor: { "@id": "https://theroyeffect.com/#business" },
      email: "rory@theroyeffect.com",
      telephone: "+1-281-323-0450",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
      knowsAbout: [
        "User Interface Design",
        "User Experience Design",
        "Brand Identity Systems",
        "Design Systems",
        "No-Code Development",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://theroyeffect.com/#business",
      name: "The Roy Effect",
      url: "https://theroyeffect.com",
      logo: "https://theroyeffect.com/favicon.png",
      email: "rory@theroyeffect.com",
      telephone: "+1-281-323-0450",
      founder: { "@id": "https://theroyeffect.com/#person" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
      areaServed: { "@type": "City", name: "Houston" },
      openingHours: "Mo-Fr 09:00-17:00",
      priceRange: "$2,500–$8,000",
      sameAs: ["https://www.google.com/maps?cid=8301339460554210785"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Design & Build Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Brand Sprint",
              description: "Brand strategy, logo system, and visual guidelines.",
            },
            price: "2500",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website / UI-UX",
              description: "Full visual design and clickable prototype for digital products.",
            },
            price: "5000",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Design + Build",
              description: "End-to-end design paired with a production no-code build.",
            },
            price: "8000",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Design Retainer",
              description: "Ongoing monthly creative direction and UI/UX partnership.",
            },
            price: "3000",
            priceCurrency: "USD",
          },
        ],
      },
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rory Ulloa — Creative Director & UI/UX Designer" },
      {
        name: "description",
        content:
          "Portfolio & studio of Rory Ulloa, an independent Creative Director and UI/UX designer crafting bold brand systems, high-contrast digital experiences and no-code builds.",
      },
      { name: "author", content: "Rory Ulloa" },
      { property: "og:title", content: "Rory Ulloa — Creative Director & UI/UX Designer" },
      {
        property: "og:description",
        content:
          "Bold brand systems, high-contrast digital experiences and production-ready builds by Rory Ulloa.",
      },
      { property: "og:site_name", content: "theroyeffect.com" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "77GixI64Yh4THH1-qNE6EXBc87IRpeA76Jo1KHyaTCA" },
      { name: "google-site-verification", content: "abyZ_limkEmpSFo8qAaXN9SRvACJ8wTWriZNi-XPtAI" },
    ],
    links: [
      // Fonts are self-hosted; these two files are above the fold.
      {
        rel: "preload",
        href: spaceGroteskLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: archivoLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(STRUCTURED_DATA),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Boot error tracking after hydration; no-ops when no DSN is configured.
  useEffect(() => {
    void initSentryClient();
  }, []);

  useEffect(() => {
    const WIDGET_ID = "6aa0be0d4d65227e4e8be214";
    let done = false;

    const inject = () => {
      if (done) return;
      done = true;
      cleanup();
      if (document.querySelector(`script[data-widget-id="${WIDGET_ID}"]`)) return;
      const script = document.createElement("script");
      script.src = "https://widgets.leadconnectorhq.com/loader.js";
      script.dataset["resourcesUrl"] = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
      script.dataset["widgetId"] = WIDGET_ID;
      script.dataset["source"] = "WEB_USER";
      document.body.appendChild(script);
    };

    // Inject on the first sign of a real visitor, or after a short fallback —
    // whichever lands first. The fallback is what lets a non-interacting
    // headless compliance checker still see the widget in the DOM.
    const EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;
    const id = window.setTimeout(inject, 2_000);

    function cleanup() {
      window.clearTimeout(id);
      EVENTS.forEach((e) => window.removeEventListener(e, inject));
    }

    EVENTS.forEach((e) => window.addEventListener(e, inject, { once: true, passive: true }));
    return cleanup;
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSignedInTool = pathname.startsWith("/admin") || pathname.startsWith("/portal");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FirebaseProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          {/* The studio hub and client portal are signed-in tools, not marketing
              surfaces: the public footer stays off them. */}
          {!isSignedInTool && <SiteFooter />}
        </FirebaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
