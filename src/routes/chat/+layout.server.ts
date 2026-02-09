import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals }) => {
  const user = locals.user
  return user ? { user } : redirect(303, '/auth/login')
}
