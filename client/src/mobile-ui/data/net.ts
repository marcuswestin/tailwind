export const net = {
  cache: true,
  async post(url: string, params: any) {
    let jsonReq = JSON.stringify(params)
    let cacheKey = 'net-cache:' + url + ':' + jsonReq
    if (this.cache && cacheKey in localStorage) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return JSON.parse(localStorage[cacheKey])
    }
    const res = await fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: jsonReq,
    })
    const jsonRes = await res.json()
    localStorage.setItem(cacheKey, JSON.stringify(jsonRes))
    return jsonRes
  },
}
