import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import ogImageAsset from "@/assets/og-preview.jpg.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { captureClientError, initSentryClient } from "../lib/sentry/client";
import { AuthProvider } from "@/hooks/useAuth";
import { FirebaseProvider } from "@/integrations/firebase/provider";
import { SiteFooter } from "@/components/SiteFooter";
import { VoiceConcierge } from "@/components/VoiceConcierge";
import { SiteHeader } from "@/components/SiteHeader";
import { DepthController } from "@/components/DepthController";
import { ArrowUpRight } from "lucide-react";

function NotFoundComponent() {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen items-center bg-[#030014] px-5 pb-20 pt-28 md:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <span className="font-mono text-xs tracking-widest text-[#FF3333]">ERROR 404</span>
          <h1 className="mt-3 font-display text-[5rem] uppercase leading-[0.85] text-white sm:text-8xl md:text-9xl">
            Wrong turn.
          </h1>
          <p className="mt-5 max-w-md font-mono text-sm leading-7 text-white/75">
            That page doesn&apos;t exist or has moved. Here&apos;s where people usually want to go.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#FF3333] px-5 py-3 font-mono text-[11px] font-bold tracking-widest text-black transition-colors hover:bg-[#FF5555]"
            >
              BACK HOME <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 font-mono text-[11px] tracking-widest text-white transition-colors hover:border-[#DFBA73]"
            >
              SEE THE WORK
            </Link>
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 font-mono text-[11px] tracking-widest text-white transition-colors hover:border-[#DFBA73]"
            >
              FREE AUDIT
            </Link>
          </div>
        </div>
      </div>
    </>
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
    <div className="flex min-h-screen items-center bg-[#030014] px-5 py-20 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <span className="font-mono text-xs tracking-widest text-[#FF3333]">SOMETHING BROKE</span>
        <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">
          This page didn&apos;t load
        </h1>
        <p className="mt-5 max-w-md font-mono text-sm leading-7 text-white/75">
          Something went wrong on my end. Try again, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex cursor-pointer items-center gap-2 bg-[#FF3333] px-5 py-3 font-mono text-[11px] font-bold tracking-widest text-black transition-colors hover:bg-[#FF5555]"
          >
            TRY AGAIN
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 font-mono text-[11px] tracking-widest text-white transition-colors hover:border-[#DFBA73]"
          >
            GO HOME
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://www.theroyeffect.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}${ogImageAsset.url}`;

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.theroyeffect.com/#person",
      name: "Rory Ulloa",
      url: "https://www.theroyeffect.com",
      jobTitle: "Creative Director & UI/UX Designer",
      email: "rory@theroyeffect.com",
      telephone: "281-323-0450",
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
      "@id": "https://www.theroyeffect.com/#service",
      name: "The Roy Effect",
      slogan: "Design With Purpose",
      url: "https://www.theroyeffect.com",
      telephone: "281-323-0450",
      founder: { "@id": "https://www.theroyeffect.com/#person" },
      priceRange: "$$$$",
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
      { property: "og:site_name", content: "The Roy Effect" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      // Site-wide social preview; routes with a better image override this.
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "theme-color", content: "#030014" },
      { name: "google-site-verification", content: "77GixI64Yh4THH1-qNE6EXBc87IRpeA76Jo1KHyaTCA" },
      { name: "google-site-verification", content: "abyZ_limkEmpSFo8qAaXN9SRvACJ8wTWriZNi-XPtAI" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@300..700&family=IBM+Plex+Mono:wght@300;400;500&display=swap",
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
    const id = window.setTimeout(() => {
      if (document.querySelector('script[data-widget-id="6aa0be0d4d65227e4e8be214"]')) return;
      const script = document.createElement("script");
      script.src = "https://widgets.leadconnectorhq.com/loader.js";
      script.dataset["resourcesUrl"] = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
      script.dataset["widgetId"] = "6aa0be0d4d65227e4e8be214";
      script.dataset["source"] = "WEB_USER";
      document.body.appendChild(script);
    }, 20_000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FirebaseProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#FF3333] focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:font-bold focus:tracking-widest focus:text-black"
          >
            SKIP TO CONTENT
          </a>
          <DepthController />
          <div id="main-content" tabIndex={-1}>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </div>
          <SiteFooter />
          <VoiceConcierge />
        </FirebaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
