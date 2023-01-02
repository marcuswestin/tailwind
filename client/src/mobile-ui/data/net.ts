import Log from './Log'
import flags from './flags'

export const net = {
  cacheRequests: false,
  async post(url: string, params: any) {
    let jsonReq = JSON.stringify(params)
    let cacheKey = 'net-cache:' + url + ':' + jsonReq
    if (flags.cacheRequests && cacheKey in localStorage) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return JSON.parse(localStorage[cacheKey])
    }
    const res = await fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: jsonReq,
    })
    if (res.ok) {
      const jsonRes = await res.json()
      localStorage.setItem(cacheKey, JSON.stringify(jsonRes))
      return jsonRes
    } else {
      Log.panic('Request error:', res.status, res.statusText, url, params)
    }
  },
}
