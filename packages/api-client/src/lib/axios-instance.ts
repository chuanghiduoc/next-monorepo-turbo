import axios, { type AxiosError, type AxiosRequestConfig } from "axios"

/**
 * Browser → Next /api/* proxy → backend.
 * Server (RSC / route handlers) → backend directly via BACKEND_URL.
 *
 * Generated request paths (Orval / handwritten) MUST start with `/api/...`,
 * matching the backend swagger. The proxy route at `app/api/[...path]/route.ts`
 * forwards anything under `/api` to the backend.
 *
 * On the server, baseURL becomes absolute so axios can resolve URLs.
 */
const isServer = typeof window === "undefined"
const baseURL = isServer
  ? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  : ""

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
