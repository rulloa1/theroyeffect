import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getStripeEnvironment } from "@/lib/stripe";
import { buildSignals, type Signal } from "@/lib/signals";
import { SignalShell } from "@/components/signal/SignalShell";
import { btnGhostSm, btnPrimary, navPill } from "@/components/signal/signal-ui";
import { AdminSignalView, type SignalKpi } from "@/components/admin/AdminSignalView";

import {
  adminDeletePortfolioProject,
  adminListInquiries,
  adminListOrders,
  adminListPortfolioProjects,
  adminSendBalanceInvoice,
  adminUpdateInquiryStatus,
  adminUpdateProjectMilestone,
  adminUpsertPortfolioProject,
  type AdminBrief,
  type AdminOrder,
} from "@/utils/admin.functions";
import type { PortfolioProject } from "@/utils/projects.functions";
import {
  adminListProposals,
  adminCreateProposal,
  adminDeleteProposal,
  adminUpdateProposal,
  adminSendProposal,
  type ProjectProposal,
  DEFAULT_TERMS,
} from "@/utils/proposals.functions";

import { AdminProjectsView, type FilterTab } from "@/components/admin/AdminProjectsView";
import { AdminInquiriesView } from "@/components/admin/AdminInquiriesView";
import { AdminChatsView } from "@/components/admin/AdminChatsView";
import { adminListChats, adminUpdateChatStatus } from "@/utils/chats.functions";
import { AdminProposalsView } from "@/components/admin/AdminProposalsView";
import { AdminPortfolioCMS } from "@/components/admin/AdminPortfolioCMS";
import { AdminFinancialsView } from "@/components/admin/AdminFinancialsView";
import { AdminPipelineView } from "@/components/admin/AdminPipelineView";
import { AdminAutopilotView } from "@/components/admin/AdminAutopilotView";
import { AdminProspectsView } from "@/components/admin/AdminProspectsView";
import { AdminPortalView } from "@/components/admin/AdminPortalView";
import { AdminOnboardingView } from "@/components/admin/AdminOnboardingView";
import {
  adminListOnboarding,
  adminRunOnboarding,
  adminApproveOnboarding,
  adminRetryOnboarding,
  adminDismissOnboarding,
} from "@/utils/onboarding.functions";
import {
  adminListProspects,
  adminFindProspects,
  adminScanPending,
  adminDraftOutreach,
  adminSaveProspectDraft,
  adminSendOutreach,
  adminUpdateProspect,
  adminGenerateVariants,
  adminSelectVariant,
  adminSyncProspectCrm,
  adminProspectAnalytics,
} from "@/utils/prospects.functions";

import {
  adminListPipeline,
  adminUpdateLeadStage,
  adminUpdateBookingStatus,
  adminResolveFollowup,
} from "@/utils/crm.functions";
import {
  adminGetAutopilot,
  adminRunAutopilot,
  adminSetAutopilotStatus,
  adminApproveDraft,
  adminDismissDraft,
  adminRetryDraft,
  adminUpdateDraft,
} from "@/utils/automation.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Studio Command Hub — theroyeffect.com" },
      {
        name: "description",
        content:
          "Studio owner management hub: current projects, client leads, portfolio editor, and billing.",
      },
      { property: "og:title", content: "Studio Command Hub — theroyeffect.com" },
      { property: "og:description", content: "Studio owner dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

type MainView =
  | "SIGNAL"
  | "PROJECTS"
  | "PIPELINE"
  | "AUTOPILOT"
  | "SETUP"
  | "PROSPECTS"
  | "INQUIRIES"
  | "CHATS"
  | "PROPOSALS"
  | "PORTFOLIO"
  | "CLIENTPORTAL"
  | "FINANCIALS";

/**
 * Headline shown beside the logo for each view. SIGNAL is absent on purpose —
 * its headline counts what is actually in the queue.
 */
const VIEW_TITLES: Record<Exclude<MainView, "SIGNAL">, string> = {
  PROJECTS: "Current projects",
  PIPELINE: "Lead pipeline",
  AUTOPILOT: "Follow-up autopilot",
  SETUP: "New purchase setup",
  PROSPECTS: "Prospect finder",
  INQUIRIES: "Client leads",
  CHATS: "Website chat",
  PROPOSALS: "Proposals & contracts",
  PORTFOLIO: "Portfolio manager",
  CLIENTPORTAL: "Client portal",
  FINANCIALS: "Financials & stats",
};

function AdminPage() {
  const environment = getStripeEnvironment();
  const queryClient = useQueryClient();

  const listOrders = useServerFn(adminListOrders);
  const sendInvoice = useServerFn(adminSendBalanceInvoice);
  const updateMilestone = useServerFn(adminUpdateProjectMilestone);
  const listInquiries = useServerFn(adminListInquiries);
  const listChats = useServerFn(adminListChats);
  const updateChatStatus = useServerFn(adminUpdateChatStatus);
  const updateInquiry = useServerFn(adminUpdateInquiryStatus);
  const listPortfolio = useServerFn(adminListPortfolioProjects);
  const upsertPortfolio = useServerFn(adminUpsertPortfolioProject);
  const deletePortfolio = useServerFn(adminDeletePortfolioProject);
  const listProposals = useServerFn(adminListProposals);
  const createProposal = useServerFn(adminCreateProposal);
  const deleteProposal = useServerFn(adminDeleteProposal);
  const updateProposal = useServerFn(adminUpdateProposal);
  const sendProposal = useServerFn(adminSendProposal);
  const listPipeline = useServerFn(adminListPipeline);
  const updateLeadStage = useServerFn(adminUpdateLeadStage);
  const updateBookingStatus = useServerFn(adminUpdateBookingStatus);
  const resolveFollowup = useServerFn(adminResolveFollowup);
  const getAutopilot = useServerFn(adminGetAutopilot);
  const runAutopilot = useServerFn(adminRunAutopilot);
  const setAutopilotStatus = useServerFn(adminSetAutopilotStatus);
  const approveDraftFn = useServerFn(adminApproveDraft);
  const dismissDraftFn = useServerFn(adminDismissDraft);
  const retryDraftFn = useServerFn(adminRetryDraft);
  const updateDraftFn = useServerFn(adminUpdateDraft);
  const listProspects = useServerFn(adminListProspects);
  const findProspects = useServerFn(adminFindProspects);
  const scanPendingFn = useServerFn(adminScanPending);
  const draftOutreachFn = useServerFn(adminDraftOutreach);
  const saveProspectDraftFn = useServerFn(adminSaveProspectDraft);
  const sendOutreachFn = useServerFn(adminSendOutreach);
  const updateProspectFn = useServerFn(adminUpdateProspect);
  const generateVariantsFn = useServerFn(adminGenerateVariants);
  const selectVariantFn = useServerFn(adminSelectVariant);
  const syncProspectCrmFn = useServerFn(adminSyncProspectCrm);
  const prospectAnalyticsFn = useServerFn(adminProspectAnalytics);
  const listOnboarding = useServerFn(adminListOnboarding);
  const runOnboardingFn = useServerFn(adminRunOnboarding);
  const approveOnboardingFn = useServerFn(adminApproveOnboarding);
  const retryOnboardingFn = useServerFn(adminRetryOnboarding);
  const dismissOnboardingFn = useServerFn(adminDismissOnboarding);


  const [currentView, setCurrentView] = useState<MainView>("SIGNAL");
  const [snoozedSignals, setSnoozedSignals] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Modals state
  const [selectedBrief, setSelectedBrief] = useState<AdminBrief | null>(null);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Proposal form state
  const [proposalForm, setProposalForm] = useState<{
    briefId?: string;
    clientName: string;
    clientEmail: string;
    clientCompany: string;
    projectTitle: string;
    scopeDeliverables: string;
    timelineWeeks: string;
    totalPriceDollars: number;
    terms: string;
  }>({
    clientName: "",
    clientEmail: "",
    clientCompany: "",
    projectTitle: "",
    scopeDeliverables:
      "• Visual Direction Sprint (Type, Color, UI Language)\n• Full Mobile & Desktop Screen Designs in Figma\n• Complete Production Build & Interactive Animations\n• Stripe eCommerce / Payment Integration\n• SEO Meta Architecture & Performance Optimization\n• 2 Comprehensive Revision Rounds",
    timelineWeeks: "2–3 Weeks",
    totalPriceDollars: 5000,
    terms: DEFAULT_TERMS,
  });

  // Form state for editing/adding projects
  const [projectForm, setProjectForm] = useState<{
    id?: string;
    title: string;
    tagline: string;
    description: string;
    url: string;
    category: "Brand Identity" | "UI/UX" | "No-Code";
    metric: string;
    tags: string;
    isPublished: boolean;
  }>({
    title: "",
    tagline: "",
    description: "",
    url: "",
    category: "UI/UX",
    metric: "",
    tags: "",
    isPublished: true,
  });

  // Queries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["admin-orders", environment],
    queryFn: () => listOrders({ data: { environment } }),
    retry: false,
  });

  const { data: inquiriesData } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: () => listInquiries(),
    retry: false,
  });

  const { data: chatsData } = useQuery({
    queryKey: ["admin-chats"],
    queryFn: () => listChats(),
    retry: false,
    refetchInterval: 60_000,
  });

  const setChatStatus = async (conversationId: string, status: "new" | "handled") => {
    try {
      await updateChatStatus({ data: { conversationId, status } });
      await queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update chat");
    }
  };

  const { data: proposalsData } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: () => listProposals(),
    retry: false,
  });

  const { data: pipelineData } = useQuery({
    queryKey: ["admin-pipeline"],
    queryFn: () => listPipeline(),
    retry: false,
  });

  const { data: autopilotData } = useQuery({
    queryKey: ["admin-autopilot"],
    queryFn: () => getAutopilot(),
    retry: false,
  });

  const refreshAutopilot = () => queryClient.invalidateQueries({ queryKey: ["admin-autopilot"] });

  const { data: onboardingData } = useQuery({
    queryKey: ["admin-onboarding"],
    queryFn: () => listOnboarding(),
    retry: false,
  });

  const refreshOnboarding = () => queryClient.invalidateQueries({ queryKey: ["admin-onboarding"] });

  const runOnboardingQueue = async () => {
    setBusy("onboarding-run");
    try {
      const result = await runOnboardingFn();
      toast.success(
        result.processed > 0
          ? `${result.processed} purchase(s) set up.`
          : "Nothing waiting to set up.",
      );
      await refreshOnboarding();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Setup run failed");
    } finally {
      setBusy(null);
    }
  };

  const approveOnboarding = async (id: string) => {
    setBusy(id);
    try {
      await approveOnboardingFn({ data: { id } });
      await refreshOnboarding();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(null);
    }
  };

  const retryOnboarding = async (id: string) => {
    setBusy(id);
    try {
      const result = await retryOnboardingFn({ data: { id } });
      if (result.ok) toast.success("Setup re-run.");
      else toast.error(result.message ?? "Setup failed");
      await refreshOnboarding();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Setup failed");
    } finally {
      setBusy(null);
    }
  };

  const dismissOnboarding = async (id: string) => {
    setBusy(id);
    try {
      await dismissOnboardingFn({ data: { id } });
      await refreshOnboarding();
    } finally {
      setBusy(null);
    }
  };

  const runAutopilotScan = async () => {
    setBusy("autopilot-run");
    try {
      const result = await runAutopilot();
      if (result.status === "paused") toast.error(result.message ?? "Autopilot paused");
      else if (result.status === "skipped_locked") toast.info("A scan is already running.");
      else toast.success(`Scan complete — ${result.drafted} new draft(s).`);
      await refreshAutopilot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setBusy(null);
    }
  };

  const toggleAutopilot = async (paused: boolean) => {
    setBusy("autopilot-toggle");
    try {
      await setAutopilotStatus({ data: { paused } });
      toast.success(paused ? "Autopilot paused" : "Autopilot resumed");
      await refreshAutopilot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update autopilot");
    } finally {
      setBusy(null);
    }
  };

  const approveDraft = async (id: string) => {
    setBusy(id);
    try {
      const result = await approveDraftFn({ data: { id } });
      if (result.ok) toast.success("Follow-up sent.");
      else toast.error(result.message ?? "Not sent");
      await refreshAutopilot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send failed");
      await refreshAutopilot();
    } finally {
      setBusy(null);
    }
  };

  const dismissDraft = async (id: string) => {
    setBusy(id);
    try {
      await dismissDraftFn({ data: { id } });
      await refreshAutopilot();
    } finally {
      setBusy(null);
    }
  };

  const retryDraft = async (id: string) => {
    setBusy(id);
    try {
      await retryDraftFn({ data: { id } });
      await refreshAutopilot();
    } finally {
      setBusy(null);
    }
  };

  const saveDraft = async (id: string, subject: string, body: string) => {
    setBusy(id);
    try {
      await updateDraftFn({ data: { id, subject, body } });
      toast.success("Draft updated.");
      await refreshAutopilot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save draft");
    } finally {
      setBusy(null);
    }
  };


  const { data: prospectsData } = useQuery({
    queryKey: ["admin-prospects"],
    queryFn: () => listProspects(),
    retry: false,
  });

  const { data: prospectAnalytics } = useQuery({
    queryKey: ["admin-prospect-analytics"],
    queryFn: () => prospectAnalyticsFn(),
    retry: false,
  });

  const refreshProspects = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-prospect-analytics"] });
  };

  const generateProspectVariants = async (id: string) => {
    setBusy(`variants-${id}`);
    try {
      await generateVariantsFn({ data: { id } });
      toast.success("Two variants ready — pick one to send.");
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not write the variants");
    } finally {
      setBusy(null);
    }
  };

  const chooseProspectVariant = async (id: string, key: "A" | "B") => {
    setBusy(`variant-${id}`);
    try {
      await selectVariantFn({ data: { id, key } });
      toast.success(`Variant ${key} applied to the draft.`);
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply that variant");
    } finally {
      setBusy(null);
    }
  };

  const syncProspectPipeline = async () => {
    setBusy("sync-crm");
    try {
      const result = await syncProspectCrmFn();
      toast.success(`Synced — ${result.booked} call(s) and ${result.won} sale(s) matched.`);
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  };


  const findProspectsFor = async (industry: string) => {
    setBusy("find");
    try {
      const result = await findProspects({ data: { industry } });
      toast.success(
        `Found ${result.found} businesses — ${result.added} new, ${result.scanned} sites checked.`,
      );
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setBusy(null);
    }
  };

  const scanPendingSites = async () => {
    setBusy("scan");
    try {
      const { scanned } = await scanPendingFn();
      toast.success(`Checked ${scanned} more site(s).`);
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Site check failed");
    } finally {
      setBusy(null);
    }
  };

  const draftProspectEmail = async (id: string) => {
    setBusy(`draft-${id}`);
    try {
      await draftOutreachFn({ data: { id } });
      toast.success("Draft ready for your review.");
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not write the draft");
      await refreshProspects();
    } finally {
      setBusy(null);
    }
  };

  const saveProspectDraft = async (
    id: string,
    subject: string,
    body: string,
    contactEmail: string | null,
  ) => {
    setBusy(`save-${id}`);
    try {
      await saveProspectDraftFn({ data: { id, subject, body, contactEmail } });
      toast.success("Draft saved.");
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the draft");
    } finally {
      setBusy(null);
    }
  };

  const sendProspectEmail = async (id: string) => {
    setBusy(`send-${id}`);
    try {
      const result = await sendOutreachFn({ data: { id } });
      if (result.ok) toast.success("Email sent.");
      else toast.error(`Not delivered: ${result.reason}`);
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send failed");
      await refreshProspects();
    } finally {
      setBusy(null);
    }
  };

  const updateProspect = async (
    id: string,
    patch: { status?: string; contactEmail?: string | null },
  ) => {
    try {
      await updateProspectFn({ data: { id, ...patch } as never });
      await refreshProspects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update prospect");
    }
  };

  const { data: portfolioData } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: () => listPortfolio(),
    retry: false,
  });

  // Stats
  const activeProjectsCount = (ordersData?.orders ?? []).length;
  const unreadInquiriesCount = (inquiriesData?.inquiries ?? []).filter(
    (i) => i.status === "unread",
  ).length;
  const pendingBalanceTotal = (ordersData?.orders ?? [])
    .filter((o) => o.balance_due_cents > 0 && o.balance_status === "pending")
    .reduce((sum, o) => sum + o.balance_due_cents, 0);

  const refreshPipeline = () => queryClient.invalidateQueries({ queryKey: ["admin-pipeline"] });

  const changeLeadStage = async (leadId: string, stage: string) => {
    const res = await updateLeadStage({ data: { leadId, stage } });
    if (!res.success) throw new Error(res.error || "Update failed");
    await refreshPipeline();
  };

  const changeBookingStatus = async (bookingId: string, status: string) => {
    const res = await updateBookingStatus({ data: { bookingId, status } });
    if (!res.success) throw new Error(res.error || "Update failed");
    await refreshPipeline();
  };

  const closeFollowup = async (followupId: string, status: string) => {
    const res = await resolveFollowup({ data: { followupId, status } });
    if (!res.success) throw new Error(res.error || "Update failed");
    await refreshPipeline();
  };

  // Invoicing Action
  const invoiceBalance = async (orderId: string) => {
    setBusy(orderId);
    try {
      const result = await sendInvoice({ data: { orderId, environment } });
      if ("error" in result) throw new Error(result.error);
      toast.success("Balance invoice sent via Stripe");
      await queryClient.invalidateQueries({ queryKey: ["admin-orders", environment] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send invoice");
    } finally {
      setBusy(null);
    }
  };

  // Milestone Update Action
  const changeMilestone = async (briefId: string, newStatus: string) => {
    try {
      const res = await updateMilestone({ data: { briefId, projectStatus: newStatus } });
      if (!res.success) throw new Error(res.error || "Update failed");
      toast.success("Project milestone updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-orders", environment] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update milestone");
    }
  };

  // Inquiry Status Action
  const toggleInquiryStatus = async (
    inquiryId: string,
    status: "unread" | "replied" | "archived",
  ) => {
    try {
      await updateInquiry({ data: { inquiryId, status } });
      toast.success(`Message marked as ${status}`);
      await queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    } catch (_err) {
      toast.error("Failed to update message status");
    }
  };

  // Portfolio Project Actions
  const handleOpenEditProject = (project: PortfolioProject) => {
    setEditingProject(project);
    setProjectForm({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      url: project.url,
      category: project.category,
      metric: project.metric || "",
      tags: project.tags.join(", "),
      isPublished: project.is_published ?? true,
    });
    setIsNewProjectModalOpen(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      tagline: "",
      description: "",
      url: "https://",
      category: "Brand Identity",
      metric: "",
      tags: "UI/UX, Brand Identity, No-Code",
      isPublished: true,
    });
    setIsNewProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      toast.error("Title and description are required");
      return;
    }
    try {
      const tagsArray = projectForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await upsertPortfolio({
        data: {
          ...(projectForm.id ? { id: projectForm.id } : {}),
          title: projectForm.title,
          tagline: projectForm.tagline,
          description: projectForm.description,
          url: projectForm.url,
          category: projectForm.category,
          ...(projectForm.metric ? { metric: projectForm.metric } : {}),
          tags: tagsArray,
          isPublished: projectForm.isPublished,
        },
      });

      if (!res.success) throw new Error(res.error || "Save failed");
      toast.success(editingProject ? "Project updated" : "New project added to showcase");
      setIsNewProjectModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deletePortfolio({ data: { projectId } });
      toast.success("Project removed");
      await queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    } catch (_err) {
      toast.error("Failed to delete project");
    }
  };

  const submitProposal = async (mode: "draft" | "sent") => {
    if (!proposalForm.clientName || !proposalForm.clientEmail || !proposalForm.projectTitle) {
      toast.error("Client name, email, and project title are required");
      return;
    }
    const payload = {
      clientName: proposalForm.clientName,
      clientEmail: proposalForm.clientEmail,
      ...(proposalForm.clientCompany ? { clientCompany: proposalForm.clientCompany } : {}),
      projectTitle: proposalForm.projectTitle,
      scopeDeliverables: proposalForm.scopeDeliverables,
      timelineWeeks: proposalForm.timelineWeeks,
      totalPriceCents: Math.round(proposalForm.totalPriceDollars * 100),
      terms: proposalForm.terms,
    };

    try {
      if (editingProposalId) {
        const res = await updateProposal({ data: { id: editingProposalId, ...payload } });
        if (!res.success) throw new Error(res.error || "Failed to save proposal");
        if (mode === "sent") {
          const sent = await sendProposal({ data: { id: editingProposalId } });
          if (!sent.success) throw new Error(sent.error || "Failed to send proposal");
          toast.success(sent.emailed ? "Proposal sent to the client" : "Proposal published (email not delivered)");
        } else {
          toast.success("Draft saved");
        }
      } else {
        const res = await createProposal({
          data: {
            ...(proposalForm.briefId ? { briefId: proposalForm.briefId } : {}),
            ...payload,
            status: mode,
          },
        });
        if (!res.success || !res.proposal) throw new Error(res.error || "Failed to create proposal");
        if (mode === "sent") {
          const sent = await sendProposal({ data: { id: res.proposal.id } });
          toast.success(
            sent.success && sent.emailed
              ? "Proposal sent to the client"
              : "Proposal published (email not delivered)",
          );
        } else {
          toast.success("Draft saved");
        }
      }

      setIsProposalModalOpen(false);
      setEditingProposalId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving proposal");
    }
  };

  const handleSendProposalItem = async (id: string) => {
    try {
      const res = await sendProposal({ data: { id } });
      if (!res.success) throw new Error(res.error || "Send failed");
      toast.success(res.emailed ? "Proposal sent to the client" : "Proposal published (email not delivered)");
      await queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error sending proposal");
    }
  };

  const handleEditProposal = (prop: ProjectProposal) => {
    setProposalForm({
      clientName: prop.client_name,
      clientEmail: prop.client_email,
      clientCompany: prop.client_company || "",
      projectTitle: prop.project_title,
      scopeDeliverables: prop.scope_deliverables,
      timelineWeeks: prop.timeline_weeks,
      totalPriceDollars: prop.total_price_cents / 100,
      terms: prop.terms,
    });
    setEditingProposalId(prop.id);
    setIsProposalModalOpen(true);
  };

  const handleDeleteProposalItem = async (id: string) => {
    try {
      const res = await deleteProposal({ data: { id } });
      if (!res.success) throw new Error(res.error || "Delete failed");
      toast.success("Proposal deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting proposal");
    }
  };

  const handleOpenProposalFromBrief = (brief: AdminBrief) => {
    setProposalForm({
      briefId: brief.id,
      clientName: brief.name,
      clientEmail: brief.email,
      clientCompany: brief.company || "",
      projectTitle: `${brief.project_type} — Custom Scope Agreement`,
      scopeDeliverables:
        brief.deliverables ||
        "• Visual Direction Sprint (Type, Color, UI Language)\n• Custom Screen Designs in Figma (Desktop & Mobile)\n• Interactive WebGL Animations & Build Handover\n• Stripe eCommerce Integration\n• 2 Comprehensive Revision Rounds",
      timelineWeeks: brief.timeline || "2–3 Weeks",
      totalPriceDollars: brief.budget && brief.budget.includes("10,000") ? 10000 : 5000,
      terms: DEFAULT_TERMS,
    });
    setSelectedBrief(null);
    setEditingProposalId(null);
    setIsProposalModalOpen(true);
  };

  // The action queue: everything above that already needs a decision, ranked.
  // Snoozing lives here rather than in the view so the header count agrees with it.
  const allSignals = useMemo(
    () =>
      buildSignals({
        orders: ordersData?.orders ?? [],
        inquiries: inquiriesData?.inquiries ?? [],
        leads: pipelineData?.leads ?? [],
        proposals: proposalsData ?? [],
      }),
    [ordersData, inquiriesData, pipelineData, proposalsData],
  );
  const signals = allSignals.filter((s) => !snoozedSignals.includes(s.id));

  const pendingDrafts = (autopilotData?.drafts ?? []).filter((d) => d.status === "draft").length;

  const kpis: SignalKpi[] = [
    {
      label: "Active projects",
      value: String(activeProjectsCount),
      sub: "Commissions & retainers",
      pct: Math.min(100, activeProjectsCount * 20),
    },
    {
      label: "New inquiries",
      value: String(unreadInquiriesCount),
      sub: unreadInquiriesCount === 0 ? "Inbox up to date" : "Unread client messages",
      alert: unreadInquiriesCount > 0,
      pct: Math.min(100, unreadInquiriesCount * 20),
    },
    {
      label: "Pending balances",
      value: money(pendingBalanceTotal, "USD"),
      sub: "Awaiting completion",
      pct: pendingBalanceTotal > 0 ? 50 : 0,
    },
    {
      label: "Showcase work",
      value: String((portfolioData?.projects ?? []).length),
      sub: "Live portfolio items",
      pct: 100,
    },
  ];

  const actOnSignal = (signal: Signal) => {
    if (signal.target.kind === "invoice") {
      void invoiceBalance(signal.target.orderId);
      return;
    }
    setCurrentView(signal.target.view as MainView);
    window.scrollTo(0, 0);
  };

  const navItems: { key: MainView; label: string }[] = [
    { key: "SIGNAL", label: "SIGNAL" },
    { key: "PROJECTS", label: "PROJECTS" },
    { key: "PIPELINE", label: `PIPELINE (${(pipelineData?.leads ?? []).length})` },
    {
      key: "SETUP",
      label: `SETUP (${
        (onboardingData?.runs ?? []).filter((r) => r.status === "ready" || r.status === "failed")
          .length
      })`,
    },
    { key: "AUTOPILOT", label: `AUTOPILOT (${pendingDrafts})` },
    {
      key: "PROSPECTS",
      label: `PROSPECTS (${
        (prospectsData?.prospects ?? []).filter((p) => p.pain_score >= 20 && p.status === "new")
          .length
      })`,
    },
    { key: "INQUIRIES", label: `LEADS (${unreadInquiriesCount})` },
    {
      key: "CHATS",
      label: `CHAT (${(chatsData?.conversations ?? []).filter((c) => c.unread_count > 0).length})`,
    },
    { key: "PROPOSALS", label: `PROPOSALS (${(proposalsData ?? []).length})` },
    { key: "PORTFOLIO", label: "PORTFOLIO" },
    { key: "CLIENTPORTAL", label: "CLIENT PORTAL" },
    { key: "FINANCIALS", label: "FINANCIALS" },
  ];

  const headline =
    currentView === "SIGNAL"
      ? signals.length === 1
        ? "1 thing needs you"
        : `${signals.length} things need you`
      : VIEW_TITLES[currentView];

  return (
    <>
      <Toaster />
      <SignalShell
        eyebrow="STUDIO COMMAND HUB"
        headline={headline}
        nav={navItems}
        activeKey={currentView}
        onNavigate={setCurrentView}
        actions={
          <>
            <Link to="/account" className={navPill(false)}>
              ACCOUNT
            </Link>
            <Link to="/" className={navPill(false)}>
              LIVE SITE ↗
            </Link>
          </>
        }
      >
        {ordersError && (
          <p className="mb-6 border border-amber-300/40 bg-amber-300/[0.06] p-4 font-mono text-xs text-amber-300">
            You don’t have admin access on this account. Please sign in as an admin.
          </p>
        )}

        {/* Dynamic Views */}
        <div>
          {currentView === "SIGNAL" && (
            <AdminSignalView
              signals={signals}
              kpis={kpis}
              autopilotDrafts={pendingDrafts}
              /* Invoicing is the only queue action that blocks; `busy` holds the order id. */
              busy={busy ? `balance:${busy}` : null}
              onAct={actOnSignal}
              onSnooze={(id) => setSnoozedSignals((prev) => [...prev, id])}
              onReviewDrafts={() => {
                setCurrentView("AUTOPILOT");
                window.scrollTo(0, 0);
              }}
            />
          )}

          {currentView === "PROJECTS" && (
            <AdminProjectsView
              orders={ordersData?.orders ?? []}
              filterTab={filterTab}
              setFilterTab={setFilterTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSendInvoice={invoiceBalance}
              onUpdateMilestone={changeMilestone}
              onViewBrief={(b) => setSelectedBrief(b)}
              onCreateProposalFromBrief={handleOpenProposalFromBrief}
              busy={busy}
              money={money}
              date={date}
            />
          )}

          {currentView === "SETUP" && (
            <AdminOnboardingView
              runs={onboardingData?.runs ?? []}
              busy={busy}
              onRunQueue={runOnboardingQueue}
              onApprove={approveOnboarding}
              onRetry={retryOnboarding}
              onDismiss={dismissOnboarding}
              date={date}
              money={money}
            />
          )}

          {currentView === "AUTOPILOT" && (
            <AdminAutopilotView
              state={autopilotData}
              busy={busy}
              onRun={runAutopilotScan}
              onTogglePause={toggleAutopilot}
              onApprove={approveDraft}
              onDismiss={dismissDraft}
              onRetry={retryDraft}
              onSave={saveDraft}
              date={date}
            />
          )}

          {currentView === "PROSPECTS" && (
            <AdminProspectsView
              prospects={prospectsData?.prospects ?? []}
              analytics={prospectAnalytics}
              onGenerateVariants={generateProspectVariants}
              onSelectVariant={chooseProspectVariant}
              onSyncCrm={syncProspectPipeline}

              busy={busy}
              onFind={findProspectsFor}

              onScanPending={scanPendingSites}
              onDraft={draftProspectEmail}
              onSaveDraft={saveProspectDraft}
              onSend={sendProspectEmail}
              onUpdate={updateProspect}
              date={date}
            />
          )}

          {currentView === "CLIENTPORTAL" && <AdminPortalView />}

          {currentView === "PIPELINE" && (
            <AdminPipelineView
              leads={pipelineData?.leads ?? []}
              onUpdateStage={changeLeadStage}
              onUpdateBooking={changeBookingStatus}
              onResolveFollowup={closeFollowup}
              date={date}
            />
          )}

          {currentView === "INQUIRIES" && (
            <AdminInquiriesView
              inquiries={inquiriesData?.inquiries ?? []}
              briefs={ordersData?.briefs ?? []}
              onUpdateInquiryStatus={toggleInquiryStatus}
              onViewBrief={(b) => setSelectedBrief(b)}
              date={date}
            />
          )}

          {currentView === "CHATS" && (
            <AdminChatsView
              conversations={chatsData?.conversations ?? []}
              onUpdateStatus={setChatStatus}
              date={date}
            />
          )}

          {currentView === "PROPOSALS" && (
            <AdminProposalsView
              proposals={proposalsData ?? []}
              onCreateProposal={() => {
                setProposalForm({
                  clientName: "",
                  clientEmail: "",
                  clientCompany: "",
                  projectTitle: "Custom Design + Build Scope",
                  scopeDeliverables:
                    "• Visual Direction Sprint (Type, Color, UI Language)\n• Full Mobile & Desktop Screen Designs in Figma\n• Complete Production Build & Interactive Animations\n• Stripe eCommerce / Payment Integration\n• SEO Meta Architecture & Performance Optimization\n• 2 Comprehensive Revision Rounds",
                  timelineWeeks: "2–3 Weeks",
                  totalPriceDollars: 5000,
                  terms: DEFAULT_TERMS,
                });
                setEditingProposalId(null);
                setIsProposalModalOpen(true);
              }}
              onEditProposal={handleEditProposal}
              onSendProposal={handleSendProposalItem}
              onDeleteProposal={handleDeleteProposalItem}
              money={money}
              date={date}
            />
          )}

          {currentView === "PORTFOLIO" && (
            <AdminPortfolioCMS
              projects={portfolioData?.projects ?? []}
              onOpenNewModal={handleOpenNewProject}
              onEditProject={handleOpenEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentView === "FINANCIALS" && (
            <AdminFinancialsView orders={ordersData?.orders ?? []} money={money} date={date} />
          )}
        </div>
      </SignalShell>

      <div className="signal-root">
        {/* MODAL 1: BRIEF DETAIL VIEWER */}
        {selectedBrief && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-white/15 bg-[#030014] p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#FF3333]">
                    PROJECT BRIEF INTAKE
                  </span>
                  <h2 className="mt-1 font-display text-2xl uppercase text-white">
                    {selectedBrief.name}
                  </h2>
                  <p className="font-mono text-xs text-white/50">{selectedBrief.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBrief(null)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4 font-mono text-xs text-white/80">
                <div>
                  <span className="text-[#FF3333]">PROJECT TYPE:</span> {selectedBrief.project_type}
                </div>
                <div>
                  <span className="text-[#FF3333]">GOALS:</span> {selectedBrief.goals}
                </div>
                {selectedBrief.audience && (
                  <div>
                    <span className="text-[#FF3333]">TARGET AUDIENCE:</span>{" "}
                    {selectedBrief.audience}
                  </div>
                )}
                {selectedBrief.deliverables && (
                  <div>
                    <span className="text-[#FF3333]">DELIVERABLES:</span>{" "}
                    {selectedBrief.deliverables}
                  </div>
                )}
                {selectedBrief.budget && (
                  <div>
                    <span className="text-[#FF3333]">BUDGET RANGE:</span> {selectedBrief.budget}
                  </div>
                )}
                {selectedBrief.timeline && (
                  <div>
                    <span className="text-[#FF3333]">TIMELINE:</span> {selectedBrief.timeline}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => handleOpenProposalFromBrief(selectedBrief)}
                  className={btnPrimary}
                >
                  GENERATE PROPOSAL FROM BRIEF →
                </button>
                <button onClick={() => setSelectedBrief(null)} className={btnGhostSm}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD / EDIT PORTFOLIO PROJECT */}
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-white/15 bg-[#030014] p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#FF3333]">
                    PORTFOLIO CMS
                  </span>
                  <h2 className="mt-1 font-display text-2xl uppercase text-white">
                    {editingProject ? "Edit Showcase Project" : "Add Showcase Project"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="mt-6 space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-white/40">PROJECT TITLE</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">TAGLINE</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.tagline}
                    onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">CATEGORY</label>
                  <select
                    className="mt-1 w-full border border-white/15 bg-[#030014] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.category}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        category: e.target.value as "Brand Identity" | "UI/UX" | "No-Code",
                      })
                    }
                  >
                    <option value="Brand Identity">Brand Identity</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="No-Code">No-Code</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">LIVE DEMO URL</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.url}
                    onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">DESCRIPTION</label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">
                    FEATURE METRIC (OPTIONAL)
                  </label>
                  <input
                    placeholder="e.g. 40% faster checkout"
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.metric}
                    onChange={(e) => setProjectForm({ ...projectForm, metric: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">TAGS (COMMA SEPARATED)</label>
                  <input
                    placeholder="UI/UX, Brand Identity, No-Code Build"
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={projectForm.tags}
                    onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button type="submit" className={btnPrimary}>
                    SAVE PROJECT →
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewProjectModalOpen(false)}
                    className={btnGhostSm}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CREATE PROPOSAL */}
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-white/15 bg-[#030014] p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-[#FF3333]">
                    PROPOSAL BUILDER
                  </span>
                  <h2 className="mt-1 font-display text-2xl uppercase text-white">
                    {editingProposalId ? "Edit Scope Agreement" : "Create Scope Agreement"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProposalModalOpen(false);
                    setEditingProposalId(null);
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitProposal("sent");
                }}
                className="mt-6 space-y-4 font-mono text-xs"
              >
                <div>
                  <label className="block text-[10px] text-white/40">CLIENT NAME</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={proposalForm.clientName}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, clientName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">CLIENT EMAIL</label>
                  <input
                    type="email"
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={proposalForm.clientEmail}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, clientEmail: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">COMPANY NAME (OPTIONAL)</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={proposalForm.clientCompany}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, clientCompany: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">PROJECT TITLE</label>
                  <input
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={proposalForm.projectTitle}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, projectTitle: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40">SCOPE DELIVERABLES</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                    value={proposalForm.scopeDeliverables}
                    onChange={(e) =>
                      setProposalForm({ ...proposalForm, scopeDeliverables: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/40">TIMELINE</label>
                    <input
                      className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                      value={proposalForm.timelineWeeks}
                      onChange={(e) =>
                        setProposalForm({ ...proposalForm, timelineWeeks: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40">TOTAL PRICE ($ USD)</label>
                    <input
                      type="number"
                      className="mt-1 w-full border border-white/15 bg-white/[0.02] p-2 text-white focus:border-[#FF3333] focus:outline-none"
                      value={proposalForm.totalPriceDollars}
                      onChange={(e) =>
                        setProposalForm({
                          ...proposalForm,
                          totalPriceDollars: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => void submitProposal("draft")}
                    className={btnGhostSm}
                  >
                    SAVE DRAFT
                  </button>
                  <button type="submit" className={btnPrimary}>
                    SEND TO CLIENT →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProposalModalOpen(false);
                      setEditingProposalId(null);
                    }}
                    className={btnGhostSm}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
