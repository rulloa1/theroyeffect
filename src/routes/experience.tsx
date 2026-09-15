import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollCanvasSequence } from "@/components/ScrollCanvasSequence";

const TITLE = "Kinetic Experience — The Roy Effect";
const DESCRIPTION =
  "A scroll-linked canvas experience engineered down to the microscopic tolerance.";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.theroyeffect.com/experience" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.theroyeffect.com/experience" }],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <ScrollCanvasSequence
        frameCount={120}
        sequenceFolder="/sequence"
        framePrefix="frame_"
        frameExtension=".webp"
      />
    </main>
  );
}
