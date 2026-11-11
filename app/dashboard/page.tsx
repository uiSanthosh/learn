"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/atoms/Button"
import { EntityChip } from "@/components/atoms/EntityChip"
import { Shimmer } from "@/components/atoms/Shimmer"
import { ValuePill } from "@/components/atoms/ValuePill"
import ApprovalCard from "@/components/primitives/ApprovalCard"
import ChatComposer from "@/components/primitives/ChatComposer"
import CodeBlock from "@/components/primitives/CodeBlock"
import ContextCards from "@/components/primitives/ContextCards"
import DiffTable from "@/components/primitives/DiffTable"
import FilterTable from "@/components/primitives/FilterTable"
import FineTuneCard from "@/components/primitives/FineTuneCard"
import Flowchart from "@/components/primitives/Flowchart"
import InsightCards from "@/components/primitives/InsightCards"
import LoadingState from "@/components/primitives/LoadingState"
import PromptBar from "@/components/primitives/PromptBar"
import RecommendationCard from "@/components/primitives/RecommendationCard"
import RecordsTable from "@/components/primitives/RecordsTable"
import SearchList from "@/components/primitives/SearchList"
import SelectionActions from "@/components/primitives/SelectionActions"
import SidebarNav from "@/components/primitives/SidebarNav"
import StreamingText from "@/components/primitives/StreamingText"
import TaskRows from "@/components/primitives/TaskRows"
import ThinkingState from "@/components/primitives/ThinkingState"
import ToolChips from "@/components/primitives/ToolChips"
import { InteractionSounds, SoundToggle } from "@/components/interaction-sounds"
import { getSessionUser, signOut } from "@/lib/auth"

type User = { name: string; email: string }

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "agent", label: "Agent activity" },
  { id: "chat", label: "Assistant" },
  { id: "decisions", label: "Decisions" },
  { id: "data", label: "Data" },
  { id: "build", label: "Build" },
]

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink-2">{description}</p>
      </div>
      <div className="grid gap-6">{children}</div>
    </motion.section>
  )
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-3 ${className}`}>
      <h3 className="text-xs font-medium tracking-wide text-ink-3 uppercase">
        {title}
      </h3>
      <div className="min-w-0 rounded-card bg-surface p-4 shadow-card">
        {children}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [active, setActive] = React.useState("overview")

  React.useEffect(() => {
    const u = getSessionUser()
    if (!u) router.replace("/signin")
    // localStorage is only readable on the client, so sync it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setUser(u)
  }, [router])

  React.useEffect(() => {
    if (!user) return
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [user])

  if (!user) return null

  const firstName = user.name.split(" ")[0]

  return (
    <div className="bui flex h-svh bg-canvas text-ink">
      <InteractionSounds />
      {/* Sidebar */}
      <aside className="hidden h-full shrink-0 lg:block">
        <SidebarNav
          fill
          footerLabel="Sign out"
          onFooterClick={() => {
            signOut()
            toast.success("Signed out")
            router.push("/signin")
          }}
          onNewChat={() =>
            document
              .getElementById("chat")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-6 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">
              Good to see you, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="truncate text-sm text-ink-2">
              <Shimmer>Creamery Ops agent is monitoring 12 suppliers</Shimmer>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <ValuePill tone="green">All systems normal</ValuePill>
            <EntityChip name={user.name} />
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => {
                signOut()
                toast.success("Signed out")
                router.push("/signin")
              }}
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Section tabs */}
        <nav
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-surface px-6 py-2"
          aria-label="Sections"
        >
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`rounded-full px-3 py-1 text-sm whitespace-nowrap transition-colors ${
                active === s.id
                  ? "bg-accent-tint text-accent-ink"
                  : "text-ink-2 hover:bg-hover"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-8">
            <Section
              id="overview"
              title="Overview"
              description="Sales, stock and supplier health at a glance."
            >
              <Panel title="Insights">
                <InsightCards />
              </Panel>
              <Panel title="Supplier records">
                <RecordsTable />
              </Panel>
            </Section>

            <Section
              id="agent"
              title="Agent activity"
              description="What your agent is doing right now, and how it got there."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Loading state">
                  <LoadingState />
                </Panel>
                <Panel title="Thinking">
                  <ThinkingState />
                </Panel>
                <Panel title="Tasks">
                  <TaskRows />
                </Panel>
                <Panel title="Tool calls">
                  <ToolChips />
                </Panel>
              </div>
              <Panel title="Workflow">
                <Flowchart />
              </Panel>
            </Section>

            <Section
              id="chat"
              title="Assistant"
              description="Ask questions, get sourced answers, and send follow-ups."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Chat">
                  <ChatComposer />
                </Panel>
                <Panel title="Streaming answer">
                  <StreamingText />
                </Panel>
              </div>
              <Panel title="Prompt bar">
                <PromptBar
                  onSend={() =>
                    toast.info("Demo prompt bar: nothing was sent.")
                  }
                />
              </Panel>
              <Panel title="Retrieved context">
                <ContextCards />
              </Panel>
            </Section>

            <Section
              id="decisions"
              title="Decisions"
              description="Human-in-the-loop approvals and agent recommendations."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Approval">
                  <ApprovalCard
                    onSubmitted={() => toast.success("Answers submitted")}
                  />
                </Panel>
                <Panel title="Recommendation">
                  <RecommendationCard />
                </Panel>
              </div>
            </Section>

            <Section
              id="data"
              title="Data"
              description="Search, filter and review proposed changes."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Search">
                  <SearchList />
                </Panel>
                <Panel title="Filter table">
                  <FilterTable />
                </Panel>
              </div>
              <Panel title="Proposed edits">
                <DiffTable />
              </Panel>
            </Section>

            <Section
              id="build"
              title="Build"
              description="Tune the agent, review code, and act on selected text."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Fine-tune">
                  <FineTuneCard />
                </Panel>
                <Panel title="Selection actions">
                  <SelectionActions />
                </Panel>
              </div>
              <Panel title="Code">
                <CodeBlock />
              </Panel>
            </Section>
          </div>
        </main>
      </div>
    </div>
  )
}
