import { AppRpc } from '~/rpc/client'

export const ping = AppRpc.mutation('Ping')
export const getConnectionInfo = AppRpc.mutation('GetConnectionInfo')
