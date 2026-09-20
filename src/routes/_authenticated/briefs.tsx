import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminListBriefs, adminDownloadBriefPdf } from "@/utils/briefs.functions";
import { btnGhostSm, emptyState, label, panel } from "@/components/signal/signal-ui";

export const Route = createFileRoute("/_authenticated/briefs")({
  head: () => ({
    meta: [
      { title: "Project Briefs — theroyeffect.com" },
      {
        name: "description",
        content: "Every project brief submitted through the site, with a PDF of each one.",
      },
      { property: "og:title", content: "Project Briefs — theroyeffect.com" },
      {
        property: "og:description",
        content: "Every submitted project brief, viewable and downloadable as a PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BriefsPage,
});

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function Field({ name, value }: { name: string; value: string | null | undefined }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="border-t border-white/10 pt-3">
      <p className={label}>{name.toUpperCase()}</p>
      <p className="mt-1 text-[13px] whitespace-pre-wrap text-white/75">{value}</p>
    </div>
  );
}

function BriefsPage() {
  const listBriefs = useServerFn(adminListBriefs);
  const downloadPdf = useServerFn(adminDownloadBriefPdf);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-briefs"],
    queryFn: () => listBriefs(),
  });

  const briefs = data?.briefs ?? [];

  const handleDownload = async (id: string) => {
    setPdfId(id);
    try {
      const res = await downloadPdf({ data: { id } });
      if (!res.success || !res.pdfBase64) throw new Error(res.error || "Failed");
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${res.pdfBase64}`;
      link.download = res.filename || "brief.pdf";
      link.click();
      toast.success("Brief PDF downloaded");
    } catch {
      toast.error("Could not build that PDF");
    } finally {
      setPdfId(null);
    }
  };

  return (
    <div className="signal-root relative min-h-screen bg-[#030014] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3" />
          BACK TO HUB
        </Link>

        <h1 className="mt-6 font-display text-[clamp(28px,5vw,44px)] uppercase text-white">
          Project briefs
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/45">
          {isLoading
            ? "LOADING…"
            : `${briefs.length} ${briefs.length === 1 ? "SUBMISSION" : "SUBMISSIONS"}`}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 font-mono text-[11px] text-white/40">
              <Loader2 className="size-4 animate-spin" />
              Loading briefs…
            </div>
          ) : briefs.length === 0 ? (
            <div className={emptyState}>
              <p className="font-display text-[22px] uppercase text-white/70">No briefs yet</p>
              <p className="mt-2 font-mono text-[11px] text-white/40">
                Briefs submitted at /brief land here automatically.
              </p>
            </div>
          ) : (
            briefs.map((brief) => {
              const open = openId === brief.id;
              return (
                <article key={brief.id} className={`p-[18px] ${panel}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-[1_1_240px]">
                      <h2 className="text-[19px] uppercase text-white">{brief.name}</h2>
                      <p className="mt-1 font-mono text-[11px] text-white/45">
                        {brief.email}
                        {brief.company ? ` · ${brief.company}` : ""} · {brief.project_type} ·{" "}
                        {date(brief.created_at)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : brief.id)}
                      className={btnGhostSm}
                      aria-expanded={open}
                    >
                      {open ? "HIDE" : "VIEW"}
                    </button>

                    <button
                      type="button"
                      disabled={pdfId === brief.id}
                      onClick={() => void handleDownload(brief.id)}
                      className={btnGhostSm}
                    >
                      <Download className="size-3" />
                      {pdfId === brief.id ? "BUILDING…" : "DOWNLOAD PDF"}
                    </button>
                  </div>

                  {open && (
                    <div className="mt-4 flex flex-col gap-3">
                      <Field name="Goals" value={brief.goals} />
                      <Field name="Audience" value={brief.audience} />
                      <Field name="Deliverables" value={brief.deliverables} />
                      <Field name="References & links" value={brief.references_links} />
                      <Field name="Budget" value={brief.budget} />
                      <Field name="Timeline" value={brief.timeline} />
                      <Field name="Anything else" value={brief.extra} />
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
