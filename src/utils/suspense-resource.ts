type Status = 'idle' | 'pending' | 'success' | 'error'

function makeDeferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const p = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { p, resolve, reject }
}

export function makeSuspenseResource<T = unknown>() {
  let status: Status = 'idle'
  let value: T | undefined = undefined
  let savedError: unknown = undefined
  let activePromise: Promise<T> | null = null
  let deferred: { p: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } | null = null

  function begin(p: Promise<T>) {
    if (status === 'pending') return
    status = 'pending'
    activePromise = p

    p.then((r) => {
      value = r
      status = 'success'
      if (deferred) {
        deferred.resolve(r)
        deferred = null
      }
      activePromise = null
    }).catch((e) => {
      savedError = e
      status = 'error'
      if (deferred) {
        deferred.reject(e)
        deferred = null
      }
      activePromise = null
    })
  }

  function markReady(v?: T) {
    status = 'success'
    value = v as T | undefined
    activePromise = null
    if (deferred) {
      deferred.resolve(value as T)
      deferred = null
    }
  }

  function read(): T {
    if (status === 'success') return value as T
    if (status === 'error') throw savedError
    if (status === 'pending' && activePromise) 
      throw activePromise

    if (!deferred) {
      const d = makeDeferred<T>()
      deferred = d
    }
    throw deferred.p
  }

  function getStatus() {
    return status
  }

  return { read, begin, markReady, getStatus } as const
}

// exported alias for the resource shape so callers can type props
export type SuspenseResource = ReturnType<typeof makeSuspenseResource<unknown>>
