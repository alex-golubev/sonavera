import {
  AIChatCard,
  GrammarAnalysisCard,
  ProgressAchievementCard,
  PronunciationFeedbackCard,
  VoiceRecordingCard
} from '~/components/HeroCards'
import { HomeLessonStartButton } from '~/features/lesson/components/HomeLessonStartButton'

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white selection:bg-emerald-500/30 dark:bg-neutral-950 font-sans">
      {/* Soft, breathing ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-175 w-full max-w-350 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-emerald-50/20 to-transparent opacity-80 dark:from-blue-900/10 dark:via-emerald-900/5 dark:opacity-100 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      {/* Large subtle orbs */}
      <div className="absolute top-[10%] left-[-20%] h-200 w-200 rounded-full bg-emerald-100/40 blur-[150px] filter dark:bg-emerald-900/10 pointer-events-none animate-float-delayed"></div>
      <div className="absolute right-[-10%] bottom-[0%] h-175 w-175 rounded-full bg-blue-100/40 blur-[150px] filter dark:bg-blue-900/10 pointer-events-none animate-float"></div>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-24 px-8 pt-32 pb-32 lg:flex-row lg:items-center lg:gap-32 lg:pt-40">
        {/* Left Column: Typography */}
        <div className="flex w-full max-w-2xl flex-col items-center text-center lg:items-start lg:text-left lg:w-[50%]">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-neutral-100 bg-white/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400 dark:shadow-none">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[pulse_3s_ease-in-out_infinite]"></div>
            <span>AI Voice Model 2.0</span>
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-6xl md:text-7xl lg:text-[4.5rem]">
            Master languages <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-500 font-extrabold pb-2">
              without scripts.
            </span>
          </h1>

          <p className="mb-14 max-w-125 text-xl font-light leading-relaxed text-neutral-500 dark:text-neutral-400">
            Drop the textbook. Engage in real-time vocal scenarios with an AI tutor that mimics native speakers, listens
            actively, and corrects your pronunciation live.
          </p>

          <div className="w-full max-w-70">
            <HomeLessonStartButton />
          </div>

          <div className="mt-16 flex items-center justify-center lg:justify-start gap-5 text-sm font-medium text-neutral-400 dark:text-neutral-500">
            <div className="flex -space-x-4">
              <div className="h-10 w-10 rounded-full border-[3px] border-white bg-neutral-100 shadow-sm dark:border-neutral-950 dark:bg-neutral-800"></div>
              <div className="h-10 w-10 rounded-full border-[3px] border-white bg-neutral-200 shadow-sm dark:border-neutral-950 dark:bg-neutral-700"></div>
              <div className="h-10 w-10 rounded-full border-[3px] border-white bg-emerald-50 flex items-center justify-center text-[11px] text-emerald-600 font-bold shadow-sm dark:border-neutral-950 dark:bg-emerald-900/30 dark:text-emerald-400">
                +5k
              </div>
            </div>
            <p className="tracking-wide">Active learners</p>
          </div>
        </div>

        {/* Right Column: Visual Interactive UI Elements */}
        <div className="relative w-full lg:w-[50%] h-125 lg:h-150 flex items-center justify-center mt-16 lg:mt-0">
          <div className="relative w-full max-w-105 h-120">
            {/* Extracted Interactive Cards */}
            <AIChatCard />
            {false && <VoiceRecordingCard />}
            {false && <GrammarAnalysisCard />}
            <ProgressAchievementCard />
            <PronunciationFeedbackCard />
          </div>
        </div>
      </main>
    </div>
  )
}
