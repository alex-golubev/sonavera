import { AppClient } from '$lib/rpc/client'

export const pingAtom = AppClient.query('Ping', undefined as void)
