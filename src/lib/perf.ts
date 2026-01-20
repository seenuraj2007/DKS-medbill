export const perf = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(name)
    }
  },
  measure: (name: string, start: string, end: string) => {
    if (typeof performance !== 'undefined') {
      performance.measure(name, start, end)
    }
  },
  getEntries: () => {
    if (typeof performance !== 'undefined') {
      return performance.getEntries()
    }
    return []
  },
  clearMarks: () => {
    if (typeof performance !== 'undefined') {
      performance.clearMarks()
    }
  }
}

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const startMark = `${name}-start`
  const endMark = `${name}-end`
  
  perf.mark(startMark)
  
  return fn()
    .then(result => {
      perf.mark(endMark)
      perf.measure(name, startMark, endMark)
      return result
    })
    .catch(error => {
      perf.mark(endMark)
      perf.measure(name, startMark, endMark)
      throw error
    })
}