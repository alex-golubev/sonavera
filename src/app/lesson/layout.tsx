import type { ReactNode } from 'react'

export default function LessonLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">{children}</div>
}
