const Log = {
  panic(...params: any[]) {
    console.error('Loc.panic:', ...params)
    try {
      // Try to use JSON.stringify on params.
      throw new Error(`Log.panic: ${JSON.stringify(params)}`)
    } catch (_) {
      // Fall back to toString() if JSON.stringify throws on e.g circular structure
      throw new Error(`Log.panic: ${params.map(val => val.toString())}`)
    }
  },
}

export default Log
