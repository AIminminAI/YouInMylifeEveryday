interface PreorderData {
  theme?: string
  willingness?: string
  physical?: string
  wechat?: string
  timestamp: string
}

const preorders: PreorderData[] = []

export const onRequestPost: PagesFunction = async (context) => {
  const contentType = context.request.headers.get('content-type') || ''

  let data: Record<string, string> = {}
  if (contentType.includes('json')) {
    data = await context.request.json()
  }

  const entry: PreorderData = {
    ...data,
    timestamp: new Date().toISOString(),
  }

  preorders.push(entry)

  return new Response(
    JSON.stringify({ success: true, total: preorders.length }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}

export const onRequestGet: PagesFunction = async (context) => {
  return new Response(
    JSON.stringify({ total: preorders.length, data: preorders }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
