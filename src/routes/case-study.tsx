import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /case-study is retired — the content now lives at /work/marlow-sons-cabinetry.
 * The old URL must keep resolving: it is linked from elsewhere and may be indexed,
 * so this route permanently redirects instead of 404ing.
 */
export const Route = createFileRoute("/case-study")({
  beforeLoad: () => {
    throw redirect({
      to: "/work/$slug",
      params: { slug: "marlow-sons-cabinetry" },
      statusCode: 301,
    });
  },
});
