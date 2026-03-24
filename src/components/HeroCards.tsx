export function AIChatCard() {
  return (
    <div className="absolute top-0 right-10 lg:right-6 z-10 transform rotate-[4deg] rounded-4xl border border-white/60 bg-white/70 p-6 lg:p-7 shadow-[0_8px_20px_rgba(0,0,0,0.04),0_20px_50px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-4 hover:-translate-x-2 hover:rotate-0 hover:scale-[1.05] hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06),0_40px_80px_-15px_rgba(0,0,0,0.16)] dark:border-white/5 dark:bg-neutral-900/60 dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] w-70 sm:w-[320px]">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm shadow-md">
          AI
        </div>
        <div>
          <p className="text-[14px] font-semibold text-neutral-900 dark:text-white leading-tight mb-0.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.08)]">
            Native Tutor
          </p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Paris, France</p>
        </div>
      </div>
      <p className="text-[15px] font-medium leading-relaxed text-neutral-600 dark:text-neutral-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.05)]">
        "Bonjour! Comment s'est passée ta journée? Prêt pour notre conversation?"
      </p>
    </div>
  )
}

export function VoiceRecordingCard() {
  return (
    <div className="absolute top-35 left-2.5 lg:left-0 z-20 transform -rotate-3 rounded-4xl border border-white/40 bg-white/60 p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-6 hover:translate-x-2 hover:rotate-0 hover:scale-[1.05] hover:z-50 hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.15)] dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.8)] w-70 sm:w-[320px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400 animate-[pulse_2s_infinite]"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Recording
          </span>
        </div>
        <span className="text-sm font-mono text-neutral-400">0:12</span>
      </div>
      {/* Fake Audio Waveform */}
      <div className="flex items-center justify-center gap-1.5 h-14">
        {[...Array(22)].map((_, i) => (
          <div
            key={`bar-${String(i)}`}
            className={`w-1.5 rounded-full bg-emerald-400 ${[3, 8, 12, 17, 21].includes(i) ? 'h-10' : [1, 5, 10, 15, 19].includes(i) ? 'h-6' : 'h-3'} opacity-80`}
            style={{ animation: `pulse ${1.5 + Math.random()}s infinite alternate` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function GrammarAnalysisCard() {
  return (
    <div className="absolute top-35 left-2.5 lg:left-0 z-20 transform -rotate-3 rounded-4xl border border-white/40 bg-white/60 p-7 lg:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-6 hover:translate-x-2 hover:rotate-0 hover:scale-[1.05] hover:z-50 hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.15)] dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.8)] w-70 sm:w-[320px]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]"></div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Analysis Active
          </span>
        </div>
      </div>

      <p className="text-[15px] font-medium leading-relaxed text-neutral-600 dark:text-neutral-300 mb-6">
        "Un café, <span className="line-through text-red-500/70 mr-1">pour</span>{' '}
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">s'il vous plaît</span>."
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <p className="text-[12.5px] font-semibold text-neutral-600 dark:text-neutral-400">
          Politeness & Formality fixed
        </p>
      </div>
    </div>
  )
}

export function PronunciationFeedbackCard() {
  return (
    <div className="absolute top-77 right-8 lg:right-20 z-30 transform rotate-12 rounded-3xl bg-neutral-900 p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-8 hover:-translate-x-2 hover:rotate-0 hover:scale-[1.05] hover:z-50 hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.4)] dark:bg-neutral-100 dark:border dark:border-neutral-200 text-white dark:text-neutral-900 w-60 sm:w-65">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium opacity-80 dark:opacity-70 tracking-wide">Pronunciation</span>
        <span className="text-xl font-bold text-emerald-400 dark:text-emerald-500 [text-shadow:0_0_8px_rgba(52,211,153,0.4)]">
          96%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-800 dark:bg-neutral-200 overflow-hidden mb-3">
        <div className="h-full w-[96%] rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
      </div>
      <p className="text-xs font-normal text-neutral-400 dark:text-neutral-500 leading-relaxed">
        Excellent intonation on the vowels. Keep going!
      </p>
    </div>
  )
}

export function ProgressAchievementCard() {
  return (
    <div className="absolute top-35 left-2.5 lg:left-0 z-20 transform -rotate-3 rounded-4xl border border-white/40 bg-white/60 p-5 lg:p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04),0_30px_60px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-6 hover:translate-x-2 hover:rotate-0 hover:scale-[1.05] hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06),0_50px_100px_-15px_rgba(0,0,0,0.18)] dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_50px_100px_-15px_rgba(0,0,0,0.8)] w-70 sm:w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Current Streak
        </h3>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M11.66 22a10 10 0 01-6.14-2 7.78 7.78 0 01-3-6C2.26 9.3 5 5 9.77 2c0 2 1.48 4 3 6 1.7-1.33 2.76-3.83 2-6 5.86 2 9.07 7.15 8.04 12A10 10 0 0111.66 22z" />
          </svg>
        </div>
      </div>

      <div className="flex items-end gap-2.5 mb-4 mt-1">
        <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-none [text-shadow:0_1px_3px_rgba(0,0,0,0.1)]">
          14
        </span>
        <span className="text-base font-medium text-neutral-400 dark:text-neutral-500 mb-0.5">Days</span>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-neutral-500 dark:text-neutral-400">Weekly Goal</span>
          <span className="text-emerald-500 font-bold [text-shadow:0_0_6px_rgba(16,185,129,0.3)]">5 / 7</span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div className="h-full w-[71%] rounded-full bg-linear-to-r from-emerald-400 to-emerald-500"></div>
        </div>
      </div>
    </div>
  )
}
