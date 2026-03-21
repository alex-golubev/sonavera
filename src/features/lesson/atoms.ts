import { AppRpc } from '~/rpc/client'

export const DEFAULT_LESSON_LANGUAGE = 'en'

export const getConnectionInfo = AppRpc.mutation('GetConnectionInfo')

export const startLessonRequest = (language: string = DEFAULT_LESSON_LANGUAGE) => ({
  payload: { language }
})
