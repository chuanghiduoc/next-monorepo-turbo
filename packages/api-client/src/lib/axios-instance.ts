import axios, { type AxiosError, type AxiosRequestConfig } from "axios"

// Request paths MUST start with `/api/...`. In the browser baseURL is "" so
// requests stay same-origin and hit the proxy route; on the server we target
// BACKEND_URL directly to avoid a self-hop back through Next. No localhost
// fallback — a missing BACKEND_URL on the server must fail loudly, not silently
// hit the wrong host (it is validated at boot in instrumentation.ts).
const isServer = typeof window === "undefined"
const baseURL = isServer ? (process.env.BACKEND_URL ?? "") : ""

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const loginPath = "/login"
      if (!window.location.pathname.startsWith(loginPath)) {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        )
        window.location.replace(`${loginPath}?next=${next}`)
      }
    }
    return Promise.reject(error)
  }
)

export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = apiClient({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data as T)

  ;(promise as Promise<T> & { cancel?: () => void }).cancel = () => {
    source.cancel("Query was cancelled")
  }

  return promise
}

export type ApiError<T = { message?: string; code?: string }> = AxiosError<T>
