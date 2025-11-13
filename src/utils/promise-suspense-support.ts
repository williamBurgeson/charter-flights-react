type Status = 'idle' | 'pending' | 'success' | 'error'
let status: Status = 'idle'
let result: unknown = undefined
let savedError: unknown = undefined
let activePromise: Promise<unknown> | null = null

let deferredPromise: Promise<unknown> | null = null
let deferredResolve: ((v?: unknown) => void) | null = null
let deferredReject: ((e?: unknown) => void) | null = null

export function makeDeferred() {
  let resolve: (v?: unknown) => void = () => {}
  let reject: (e?: unknown) => void = () => {}
  const p = new Promise<unknown>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { p, resolve, reject }
}

export function beginPromise(p: Promise<unknown>) {
  if (status === 'pending') return
  status = 'pending'
  activePromise = p

  if (deferredResolve && deferredReject) {
    p.then((r) => {
      result = r
      status = 'success'
      if (deferredResolve) deferredResolve(r)
      activePromise = null
    }).catch((e) => {
      savedError = e
      status = 'error'
      if (deferredReject) deferredReject(e)
      activePromise = null
    })
    deferredResolve = null
    deferredReject = null
    deferredPromise = null
    return
  }

  p.then((r) => {
    status = 'success'
    result = r
    activePromise = null
  }).catch((e) => {
    status = 'error'
    savedError = e
    activePromise = null
  })
}

export function markPromiseReady(value?: unknown) {
  status = 'success'
  result = value
  activePromise = null
  if (deferredResolve) {
    deferredResolve(value)
    deferredResolve = null
    deferredReject = null
    deferredPromise = null
  }
}

export function readPromise() {
  if (status === 'success') return result
  if (status === 'error') throw savedError
  if (status === 'pending' && activePromise) throw activePromise

  if (!deferredPromise) {
    const d = makeDeferred()
    deferredPromise = d.p
    deferredResolve = d.resolve
    deferredReject = d.reject
  }
  throw deferredPromise
}
