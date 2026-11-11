"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { MenuIcon, MoonIcon, SunIcon, XIcon } from "lucide-react"
import { useTheme } from "next-themes"
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
  scroll = false,
}: {
  title: string
  children: React.ReactNode
  className?: string
  /** let wide content scroll sideways on narrow screens instead of being clipped */
  scroll?: boolean
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-3 ${className}`}>
      <h3 className="text-xs font-medium tracking-wide text-ink-3 uppercase">
        {title}
      </h3>
      <div
        className={`flex min-w-0 flex-1 justify-center rounded-card bg-surface p-3 shadow-card sm:p-4 ${
          scroll ? "overflow-x-auto" : ""
        }`}
      >
        <div className="max-w-full min-w-0">{children}</div>
      </div>
    </div>
  )
}

/** Two-column grid on desktop; panels size to their content so nothing stretches into empty space. */
function Pair({ children }: { children: React.ReactNode }) {
  return <div className="grid items-start gap-6 lg:grid-cols-2">{children}</div>
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // next-themes only knows the theme on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  const dark = mounted && resolvedTheme === "dark"
  return (
    <button
      type="button"
      data-sound="tick"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme (D)"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-2 shadow-btn transition-colors hover:bg-hover"
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [active, setActive] = React.useState("overview")
  const [menuOpen, setMenuOpen] = React.useState(false)
  const tabsRef = React.useRef<HTMLElement>(null)

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

  React.useEffect(() => {
    // Scroll only the tab strip. scrollIntoView() would also scroll the page sideways.
    const nav = tabsRef.current
    const tab = nav?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (!nav || !tab) return
    nav.scrollTo({
      left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2,
      behavior: "smooth",
    })
  }, [active])

  React.useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  if (!user) return null

  const firstName = user.name.split(" ")[0]
  const handleSignOut = () => {
    signOut()
    toast.success("Signed out")
    router.push("/signin")
  }

  return (
    <div className="bui flex h-svh bg-canvas text-ink">
      <InteractionSounds />

      {/* Sidebar (desktop) */}
      <aside className="hidden h-full shrink-0 lg:block">
        <SidebarNav
          fill
          footerLabel="Sign out"
          onFooterClick={handleSignOut}
          onNewChat={() =>
            document
              .getElementById("chat")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </aside>

      {/* Sidebar (mobile drawer) */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              data-sound-silent
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 bg-canvas shadow-overlay"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <SidebarNav
                fill
                footerLabel="Sign out"
                onFooterClick={handleSignOut}
                onNewChat={() => {
                  setMenuOpen(false)
                  document
                    .getElementById("chat")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              />
              <button
                type="button"
                data-sound="release"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="absolute top-3 right-[-44px] flex size-8 items-center justify-center rounded-full bg-surface text-ink shadow-btn"
              >
                <XIcon className="size-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            data-sound="press"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-2 shadow-btn transition-colors hover:bg-hover lg:hidden"
          >
            <MenuIcon className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              <span className="sm:hidden">Hi, {firstName}</span>
              <span className="hidden sm:inline">
                Good to see you, {firstName}
              </span>{" "}
              <span aria-hidden>👋</span>
            </h1>
            <p className="truncate text-sm text-ink-2">
              <Shimmer>Creamery Ops agent is monitoring 12 suppliers</Shimmer>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:inline-flex">
              <ValuePill tone="green">All systems normal</ValuePill>
            </span>
            <span className="hidden md:inline-flex">
              <EntityChip name={user.name} />
            </span>
            <SoundToggle />
            <ThemeToggle />
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Section tabs */}
        <nav
          ref={tabsRef}
          className="flex shrink-0 [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line bg-surface px-4 py-2 sm:px-6 [&::-webkit-scrollbar]:hidden"
          aria-label="Sections"
        >
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-tab={s.id}
              aria-current={active === s.id ? "true" : undefined}
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
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:gap-12 sm:px-6 sm:py-8">
            <Section
              id="overview"
              title="Overview"
              description="Sales, stock and supplier health at a glance."
            >
              <Pair>
                <Panel title="Insights">
                  <InsightCards />
                </Panel>
                <Panel title="Filter table" scroll>
                  <FilterTable />
                </Panel>
              </Pair>
              <Panel title="Supplier records">
                <RecordsTable />
              </Panel>
            </Section>

            <Section
              id="agent"
              title="Agent activity"
              description="What your agent is doing right now, and how it got there."
            >
              <Pair>
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
              </Pair>
              <Panel title="Workflow" scroll>
                <Flowchart />
              </Panel>
            </Section>

            <Section
              id="chat"
              title="Assistant"
              description="Ask questions, get sourced answers, and send follow-ups."
            >
              <Pair>
                <Panel title="Chat">
                  <ChatComposer />
                </Panel>
                <Panel title="Streaming answer">
                  <StreamingText />
                </Panel>
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
              </Pair>
            </Section>

            <Section
              id="decisions"
              title="Decisions"
              description="Human-in-the-loop approvals and agent recommendations."
            >
              <Pair>
                <Panel title="Approval">
                  <ApprovalCard
                    onSubmitted={() => toast.success("Answers submitted")}
                  />
                </Panel>
                <Panel title="Recommendation">
                  <RecommendationCard />
                </Panel>
              </Pair>
            </Section>

            <Section
              id="data"
              title="Data"
              description="Search, filter and review proposed changes."
            >
              <Pair>
                <Panel title="Search">
                  <SearchList />
                </Panel>
                <Panel title="Proposed edits" scroll>
                  <DiffTable />
                </Panel>
              </Pair>
            </Section>

            <Section
              id="build"
              title="Build"
              description="Tune the agent, review code, and act on selected text."
            >
              <Pair>
                <Panel title="Fine-tune">
                  <FineTuneCard />
                </Panel>
                <Panel title="Code" scroll>
                  <CodeBlock />
                </Panel>
              </Pair>
              <Panel title="Selection actions" scroll>
                <SelectionActions />
              </Panel>
            </Section>
          </div>
        </main>
      </div>
    </div>
  )
}
