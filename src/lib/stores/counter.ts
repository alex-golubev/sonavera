/**
 * Test counter-store using @effect-rx
 */

import { Rx } from '$lib/effect-rx'

// Simple writable counter
export const counterRx = Rx.make(0)

// Derived Rx that doubles the counter
export const doubledRx = Rx.readable((get) => get(counterRx) * 2)
