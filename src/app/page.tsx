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
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-6 pt-20 pb-20 lg:flex-row lg:items-center lg:gap-32 lg:px-8 lg:pt-40 lg:pb-32">
        {/* Left Column: Typography */}
        <div className="flex w-full max-w-2xl flex-col items-center text-center lg:items-start lg:text-left lg:w-[50%]">
          <div className="mb-12 inline-flex items-center gap-3 rounded-full border border-neutral-100 bg-white/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400 dark:shadow-none">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[pulse_3s_ease-in-out_infinite]"></div>
            <span>AI Voice Model 2.0</span>
          </div>

          <h1 className="mb-10 text-5xl font-medium leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-6xl md:text-7xl lg:text-[4.2rem] [text-shadow:0_1px_2px_rgba(0,0,0,0.05)]">
            Master languages <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-500 pb-2 drop-shadow-[0_1px_3px_rgba(52,211,153,0.15)]">
              without scripts
            </span>
          </h1>

          <p className="mb-14 max-w-110 text-lg font-light leading-relaxed text-neutral-500 dark:text-neutral-400 lg:text-xl [text-shadow:0_1px_2px_rgba(0,0,0,0.05)]">
            Learn through real conversations. An AI tutor that listens, speaks, and corrects your pronunciation live.
          </p>

          <div className="w-full max-w-70">
            <HomeLessonStartButton />
          </div>
        </div>

        {/* Right Column: Visual Interactive UI Elements */}
        <div className="relative w-full lg:w-[50%] h-125 lg:h-150 flex items-center justify-center mt-4 lg:mt-24">
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
