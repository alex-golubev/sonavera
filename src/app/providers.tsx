'use client'

import { RegistryProvider } from '@effect-atom/atom-react'
import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RegistryProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </RegistryProvider>
  )
}
