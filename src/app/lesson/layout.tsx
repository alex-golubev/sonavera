import type { ReactNode } from 'react'

export default function LessonLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950">{children}</div>
}
