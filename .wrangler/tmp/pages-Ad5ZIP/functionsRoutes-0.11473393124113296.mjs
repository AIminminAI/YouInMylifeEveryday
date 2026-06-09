import { onRequest as __api_pay_ts_onRequest } from "D:\\Huhb\\AIProject\\HelperForBusyUByHY\\YouInMylifeEveryday\\functions\\api\\pay.ts"
import { onRequest as __api_timeline_ts_onRequest } from "D:\\Huhb\\AIProject\\HelperForBusyUByHY\\YouInMylifeEveryday\\functions\\api\\timeline.ts"

export const routes = [
    {
      routePath: "/api/pay",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_pay_ts_onRequest],
    },
  {
      routePath: "/api/timeline",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_timeline_ts_onRequest],
    },
  ]