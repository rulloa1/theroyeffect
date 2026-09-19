import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Logo } from "@/components/Logo";

const TITLE = "Connect an AI assistant — The Roy Effect";
const DESCRIPTION =
  "Step-by-step instructions for connecting ChatGPT, Claude, Claude Code or another AI assistant to The Roy Effect.";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectPage,
});

const APP_NAME = "The Roy Effect";
const SLUG = "the-roy-effect";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs font-bold tracking-widest text-white transition-colors hover:border-[#DFBA73] hover:text-[#DFBA73]"
      aria-label={label}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="mt-4 space-y-3 font-mono text-sm leading-[1.6] text-white/80">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="shrink-0 font-bold text-[#DFBA73]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5 md:p-6">
      <h3 className="font-display text-xl uppercase text-white">{title}</h3>
      {children}
    </div>
  );
}

function ConnectPage() {
  const [mcpUrl, setMcpUrl] = useState("");

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  const shownUrl = mcpUrl || "https://theroyeffect.com/mcp";
  const claudeLink = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(
    APP_NAME,
  )}&connectorUrl=${encodeURIComponent(shownUrl)}`;
  const claudeCodeCommand = `claude mcp add --scope user --transport http ${SLUG} '${shownUrl.replaceAll("'", "'\\''")}'`;

  return (
    <main className="min-h-screen bg-[#030014] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-4xl">
        <Logo variant="compact" size="md" href="/" className="mb-12" />
        <span className="font-mono text-xs tracking-widest text-[#FF3333]">AI ASSISTANTS</span>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl">
          Connect an assistant to {APP_NAME}
        </h1>
        <p className="mt-5 max-w-2xl font-mono text-sm leading-[1.6] text-white/70">
          Add this site to ChatGPT, Claude or another AI assistant so it can look up my services and
          send me an inquiry on your behalf.
        </p>

        <section className="mt-10 border border-[#DFBA73]/40 bg-white/[0.03] p-5 md:p-6">
          <h2 className="font-mono text-xs font-bold tracking-widest text-[#DFBA73]">
            CONNECTION ADDRESS
          </h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white">
              {shownUrl}
            </code>
            <CopyButton value={shownUrl} label="Copy the connection address" />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Set it up</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Panel title="ChatGPT">
              <Steps
                items={[
                  <>
                    Open{" "}
                    <a
                      className="text-[#DFBA73] underline"
                      href="https://chatgpt.com/#settings/Connectors/Advanced"
                      target="_blank"
                      rel="noreferrer"
                    >
                      ChatGPT settings
                    </a>{" "}
                    and turn on Developer mode (read the risk notice shown there). If you don&apos;t
                    see it, ask a ChatGPT admin to enable it.
                  </>,
                  <>
                    Open the{" "}
                    <a
                      className="text-[#DFBA73] underline"
                      href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins"
                      target="_blank"
                      rel="noreferrer"
                    >
                      new plugin dialog
                    </a>
                    .
                  </>,
                  <>
                    Enter the name “{APP_NAME}” and paste the address above into the URL field.
                  </>,
                  <>
                    Review the details, tick “I understand and want to continue” (ChatGPT shows this
                    for every custom connection), then click Create.
                  </>,
                  <>Turn it on from the chat box, then ask ChatGPT to use {APP_NAME}.</>,
                ]}
              />
            </Panel>

            <Panel title="Claude">
              <Steps
                items={[
                  <>
                    Open the{" "}
                    <a
                      className="text-[#DFBA73] underline"
                      href={claudeLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      prefilled Claude connector form
                    </a>
                    .
                  </>,
                  <>Review the details and click Add.</>,
                  <>
                    If the form doesn&apos;t open, go to Claude&apos;s Connectors page, choose “Add
                    custom connector”, name it “{APP_NAME}” and paste the address above.
                  </>,
                  <>Turn the connector on from the chat box, then ask Claude to use {APP_NAME}.</>,
                ]}
              />
            </Panel>

            <Panel title="Claude Code">
              <Steps
                items={[
                  <>Run this in a terminal:</>,
                  <>
                    Start Claude Code and run <code className="text-[#DFBA73]">/mcp</code> to check
                    it&apos;s connected.
                  </>,
                  <>Ask Claude Code to use {APP_NAME}.</>,
                ]}
              />
              <div className="mt-4 flex flex-col gap-3">
                <code className="break-all border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white">
                  {claudeCodeCommand}
                </code>
                <CopyButton value={claudeCodeCommand} label="Copy the Claude Code command" />
              </div>
            </Panel>

            <Panel title="Other assistants">
              <Steps
                items={[
                  <>Open your assistant&apos;s connector or MCP server settings.</>,
                  <>Create a new remote connection.</>,
                  <>Name it “{APP_NAME}” and paste the address above.</>,
                  <>Finish any sign-in prompts.</>,
                  <>Enable it, then ask the assistant to use {APP_NAME}.</>,
                ]}
              />
            </Panel>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase text-white md:text-3xl">
            Refresh it after I update the site
          </h2>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-[1.6] text-white/70">
            Assistants remember what this site could do when you connected it, so refresh the
            connection to pick up anything new.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Panel title="ChatGPT">
              <Steps
                items={[
                  <>Open the Plugins page and select {APP_NAME}.</>,
                  <>Scroll to “Information” and click Refresh.</>,
                  <>
                    ChatGPT can&apos;t change an existing address — if it changed, delete the entry
                    and set it up again with the address above.
                  </>,
                  <>Start a new chat and ask ChatGPT to use {APP_NAME}.</>,
                ]}
              />
            </Panel>
            <Panel title="Claude">
              <Steps
                items={[
                  <>Open the Connectors page and select {APP_NAME}.</>,
                  <>Refresh or update the connector.</>,
                  <>
                    Claude can&apos;t change an existing address — if it changed, remove the
                    connector and add it again with the address above.
                  </>,
                  <>Ask Claude to use {APP_NAME}.</>,
                ]}
              />
            </Panel>
            <Panel title="Claude Code">
              <Steps
                items={[
                  <>Start a new Claude Code session — it reloads on connect.</>,
                  <>
                    If the address changed, run{" "}
                    <code className="text-[#DFBA73]">claude mcp remove {SLUG}</code> and run the
                    install command again.
                  </>,
                  <>Ask Claude Code to use {APP_NAME}.</>,
                ]}
              />
            </Panel>
            <Panel title="Other assistants">
              <Steps
                items={[
                  <>Open your assistant&apos;s connector settings.</>,
                  <>Select the connection for {APP_NAME}.</>,
                  <>Refresh the tools, reload or reconnect it.</>,
                  <>If the address changed, paste the latest one from above.</>,
                  <>Start a new chat and ask the assistant to use {APP_NAME}.</>,
                ]}
              />
            </Panel>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/audit"
            className="bg-[#FF3333] px-5 py-3 font-mono text-xs font-bold tracking-widest text-black"
          >
            GET A FREE AUDIT
          </Link>
          <Link
            to="/"
            className="border border-white/20 px-5 py-3 font-mono text-xs tracking-widest text-white"
          >
            BACK HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
