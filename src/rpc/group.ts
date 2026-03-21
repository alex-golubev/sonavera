import { RpcGroup } from '@effect/rpc'
import { LessonRpcGroup } from '~/features/lesson/rpc'

export class AppRpcGroup extends RpcGroup.make().merge(LessonRpcGroup) {}
