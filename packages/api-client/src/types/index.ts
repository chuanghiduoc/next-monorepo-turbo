export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiErrorBody {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface ListQuery {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
}
