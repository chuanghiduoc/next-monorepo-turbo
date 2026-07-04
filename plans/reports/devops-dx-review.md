# DevOps / DX / Vận hành — Review Report

**Dự án:** next-monorepo-turbo  
**Ngày đánh giá:** 2026-07-02  
**Reviewer:** Automated audit (read-only)  
**Phạm vi:** CI/CD, Docker, Observability, DX tooling, Config management, Gap so với Google-scale

---

## Điểm số tổng hợp

| Hạng mục             | Điểm       | Ghi chú                                                                |
| -------------------- | ---------- | ---------------------------------------------------------------------- |
| CI/CD pipeline       | 6/10       | Solid cơ bản, thiếu matrix, remote cache, deploy stage                 |
| Docker / Container   | 7/10       | Multi-stage tốt, healthcheck có, thiếu resource limits & secrets mount |
| Observability        | 3/10       | Chỉ có pino logging, không có tracing/metrics/error tracking           |
| Developer Experience | 7.5/10     | Husky, commitlint, renovate, knip, syncpack đều đủ                     |
| Config / Secrets     | 7/10       | t3-oss env validation tốt, thiếu secret scanning                       |
| **TỔNG**             | **6.1/10** | Boilerplate tốt cho team nhỏ, còn xa chuẩn Google-scale                |

---

## 1. CI/CD Pipeline

### File: `.github/workflows/ci.yml`

#### Điểm mạnh

- Concurrency group + `cancel-in-progress: true` — tránh queue chạy thừa.
- Telemetry bị tắt (`TURBO_TELEMETRY_DISABLED`, `NEXT_TELEMETRY_DISABLED`).
- `pnpm install --frozen-lockfile` đảm bảo reproducible.
- Turbo local cache với `actions/cache@v4`.

#### Phát hiện & Đề xuất

**[P0 — CRITICAL] Không có Turbo Remote Cache**

- Vị trí: `.github/workflows/ci.yml` — bước `Cache turbo`
- Mô tả: Hiện dùng `actions/cache` lưu `.turbo` folder cục bộ trong runner. Cache này bị xóa sau mỗi run trên runner mới, mất hoàn toàn lợi ích cross-PR. Với monorepo lớn, đây là bottleneck nghiêm trọng.
- Đề xuất: Kích hoạt Turbo Remote Cache qua `TURBO_TOKEN` + `TURBO_TEAM` (Vercel) hoặc self-host với `turbo-remote-cache` package.

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

---

**[P1 — HIGH] Một job duy nhất cho lint + typecheck + test + build**

- Vị trí: `ci.yml` job `verify`
- Mô tả: Tất cả 4 bước chạy tuần tự trong một job. Nếu `lint` mất 3 phút và `build` mất 8 phút, tổng ≥ 11 phút. Với matrix runner, có thể chạy song song.
- Đề xuất: Tách thành 2–3 job parallel: `lint-typecheck`, `test`, `build`. Dùng `needs:` cho sự phụ thuộc tối thiểu.

---

**[P1 — HIGH] Không có deploy pipeline**

- Vị trí: `.github/workflows/` — không có file deploy
- Mô tả: CI chỉ verify + test + build. Không có bước deploy lên staging/production, không có preview deployment cho PR.
- Đề xuất: Thêm workflow `deploy.yml` với stages: `staging` (push → main) và `production` (release tag). Tích hợp Vercel CLI hoặc Docker push + deploy.

---

**[P1 — HIGH] E2E chạy với `workers: 1` trên CI**

- Vị trí: `apps/web/playwright.config.ts` dòng 10
- Mô tả: `workers: process.env.CI ? 1 : undefined` — buộc serial trên CI, làm E2E chậm tuyến tính theo số test.
- Đề xuất: Dùng Playwright sharding: `--shard=1/4` trên 4 runners song song.

---

**[P2 — MEDIUM] Không có Node.js version matrix**

- Vị trí: `ci.yml` step `setup-node` — cố định `node-version: 20`
- Mô tả: Không test trên Node 22 (LTS mới). Đặc biệt quan trọng nếu package được publish.
- Đề xuất: Thêm `strategy.matrix.node: [20, 22]` hoặc ít nhất CI cảnh báo khi Node LTS mới ra.

---

**[P2 — MEDIUM] Không có branch protection rules trong repo**

- Vị trí: GitHub repo settings (không thể kiểm tra từ code)
- Mô tả: Không tìm thấy `CODEOWNERS` file. Không rõ có require PR review, status checks bắt buộc không.
- Đề xuất: Thêm file `.github/CODEOWNERS`. Enforce branch protection: require CI pass, require 1 review, no force push to main.

---

**[P3 — LOW] `SKIP_ENV_VALIDATION=1` hardcode trong CI**

- Vị trí: `ci.yml` và `e2e.yml` env block
- Mô tả: Bỏ qua env validation trong CI là pattern nguy hiểm — có thể mask lỗi cấu hình thực.
- Đề xuất: Cung cấp env vars thực (secrets/vars) trong CI thay vì skip validation hoàn toàn. Chấp nhận cho build-only stage nhưng không nên cho test stage.

---

### File: `.github/workflows/release.yml`

#### Điểm mạnh

- Dùng `changesets/action@v1` — chuẩn cho monorepo versioning.
- `permissions: contents: write, pull-requests: write, id-token: write` — khai báo rõ ràng.
- `fetch-depth: 0` để changelog đầy đủ.

#### Phát hiện

**[P2 — MEDIUM] Không có NPM_TOKEN cho publish thực**

- Mô tả: `changeset publish` cần `NPM_TOKEN` nếu publish lên npmjs. Hiện `access: restricted` trong changeset config nên package `web` bị ignore. Nếu sau này publish public, cần bổ sung.
- Đề xuất: Thêm `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` vào env block của release job.

---

## 2. Docker / Container

### File: `apps/web/Dockerfile`

#### Điểm mạnh

- **3-stage build chuẩn**: `pruner` (turbo prune) → `builder` → `runner`.
- **Non-root user**: `addgroup/adduser nodejs/nextjs`, `USER nextjs` — bảo mật tốt.
- **Alpine base**: image nhỏ, ít attack surface.
- **Standalone output**: `output: "standalone"` trong `next.config.ts` — chỉ bundle những gì cần.
- **chown đúng**: `--chown=nextjs:nodejs` khi copy artifacts.
- `NEXT_TELEMETRY_DISABLED=1` ở cả build và runtime.

#### Phát hiện

**[P1 — HIGH] Không có health check endpoint thực**

- Vị trí: `docker-compose.yml` healthcheck + `apps/web/app/api/[...path]/route.ts`
- Mô tả: Healthcheck gọi `/api/v1/health` nhưng đây là proxy route đến backend. Nếu backend down, container web sẽ bị mark unhealthy dù bản thân web app vẫn OK.
- Đề xuất: Tạo dedicated health route `/api/health` trong Next.js trả về `{ status: "ok" }` không phụ thuộc backend.

---

**[P2 — MEDIUM] Không có resource limits trong docker-compose**

- Vị trí: `docker-compose.yml`
- Mô tả: Không có `deploy.resources.limits` (CPU/memory). Container có thể chiếm hết tài nguyên host.
- Đề xuất:

```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
```

---

**[P2 — MEDIUM] Secrets được inject qua environment variables**

- Vị trí: `docker-compose.yml` — `environment` block
- Mô tả: Đây là cách phổ biến nhưng không lý tưởng. Secrets visible trong `docker inspect`, process list.
- Đề xuất: Dùng Docker secrets hoặc mount từ secret manager (Vault, AWS Secrets Manager) thay vì env plaintext.

---

**[P3 — LOW] ARG `NODE_VERSION` không pinned digest**

- Vị trí: `Dockerfile` dòng 1 — `ARG NODE_VERSION=20-alpine`
- Mô tả: `20-alpine` là mutable tag. Có thể bị supply chain attack nếu tag bị overwrite.
- Đề xuất: Pin bằng digest: `node:20-alpine@sha256:...` hoặc dùng Renovate để tự động update digest.

---

### File: `.dockerignore`

#### Điểm mạnh

- Exclude đúng: `node_modules`, `.next`, `.turbo`, `coverage`, `test-results`, `.env.*`
- Exclude `docs`, `plans`, `*.md` — giảm context không cần thiết.
- Whitelist `.env.example` với `!` pattern.

---

## 3. Observability

**[P0 — CRITICAL] Không có distributed tracing**

- Mô tả: Không tìm thấy OpenTelemetry, Jaeger, Zipkin, hay bất kỳ tracing library nào. Trong môi trường microservice (Next → Backend), không thể trace request end-to-end khi có lỗi.
- Đề xuất: Tích hợp `@vercel/otel` hoặc `@opentelemetry/sdk-node`. Next.js 15+ có built-in instrumentation hook qua `instrumentation.ts`.

---

**[P0 — CRITICAL] Không có error tracking**

- Mô tả: Không có Sentry, Datadog, Highlight, hay tương đương. Lỗi production chỉ xuất hiện trong logs, không có alert, không có stacktrace aggregation, không có user context.
- Đề xuất: Tích hợp `@sentry/nextjs` — setup với `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.

---

**[P0 — CRITICAL] Không có metrics / APM**

- Mô tả: Không có Prometheus metrics, không có APM (Datadog, New Relic). Không thể monitor p95 latency, error rate, throughput theo SLO.
- Đề xuất: Expose `/metrics` endpoint hoặc dùng Vercel Analytics + Speed Insights cho baseline. Với hệ thống lớn hơn: OpenTelemetry Metrics → Prometheus → Grafana.

---

**[P1 — HIGH] Pino logger thiếu request ID correlation**

- Vị trí: `apps/web/lib/logger.ts`
- Mô tả: Logger hiện tại chỉ có `base: { service: "web" }`. Không có `requestId` hay `traceId` trong mỗi log entry. Rất khó debug khi có nhiều concurrent requests.
- Đề xuất: Dùng `AsyncLocalStorage` để propagate `requestId` qua toàn bộ request lifecycle. Thêm middleware inject `x-request-id` header.

---

**[P2 — MEDIUM] Không có structured logging cho access log**

- Mô tả: Proxy route có `logger.debug(...)` nhưng không log đủ thông tin: user agent, IP, request ID. Logger cũng chỉ là server-only, không capture client-side errors.
- Đề xuất: Thêm middleware log tất cả request/response ở Next.js middleware layer.

---

## 4. Developer Experience

### Điểm mạnh tổng thể

- **Husky v9**: pre-commit (lint-staged + typecheck), pre-push (tests), commit-msg (commitlint) — đủ bộ.
- **Commitlint**: conventional commits, 11 type, max-length 100.
- **Renovate**: config tốt — automerge minor/patch, vulnerability alerts, lock file maintenance, pin critical packages (next, react, typescript, turbo).
- **Knip**: dead code detection với workspace config đầy đủ.
- **Syncpack**: version consistency across workspace packages.
- **Changesets**: versioning và release automation.
- **pnpm + corepack**: reproducible package manager.
- **engines field**: `"node": ">=20"` trong root package.json.
- **Turbopack dev**: `next dev --turbopack` — fast refresh.

#### Phát hiện

**[P1 — HIGH] `pnpm typecheck` chạy trong pre-commit là quá chậm**

- Vị trí: `.husky/pre-commit`
- Mô tả: `pnpm typecheck` chạy full TypeScript check cho toàn workspace trước mỗi commit. Với codebase lớn, đây có thể mất 30–60 giây, gây friction cao.
- Đề xuất: Chuyển typecheck về pre-push. Pre-commit chỉ giữ `lint-staged` (fast, per-file). CI sẽ bắt type error trước khi merge.

---

**[P2 — MEDIUM] Không có `lint-staged` config file riêng**

- Mô tả: Không tìm thấy `lint-staged.config.*` hay config trong package.json. Không rõ lint-staged được config như thế nào — có thể thiếu config dẫn đến chạy lint toàn bộ file thay vì chỉ staged files.
- Đề xuất: Thêm config tường minh:

```json
// package.json
"lint-staged": {
  "**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "**/*.{json,md,yaml}": ["prettier --write"]
}
```

---

**[P2 — MEDIUM] README.md không tồn tại ở root**

- Mô tả: Tìm kiếm `README.md` ở thư mục gốc không thấy (chỉ tìm thấy trong node_modules). Một dự án boilerplate không có README là thiếu sót nghiêm trọng cho onboarding.
- Đề xuất: Tạo `README.md` với: quick start, workspace structure, scripts reference, architecture overview, contribution guide.

---

**[P3 — LOW] Không có VSCode workspace extension recommendations**

- Mô tả: Chỉ thấy `.vscode/extensions.json` được whitelist trong .gitignore nhưng file không tồn tại.
- Đề xuất: Tạo `.vscode/extensions.json` với: ESLint, Prettier, Tailwind IntelliSense, TypeScript, Playwright.

---

**[P3 — LOW] Không có `CONTRIBUTING.md`**

- Mô tả: Không có guide cho contributor mới.
- Đề xuất: Thêm `.github/CONTRIBUTING.md` hoặc link từ README.

---

## 5. Config Management

#### Điểm mạnh

- **`@t3-oss/env-nextjs`**: env validation với Zod — best practice cho Next.js. Phân biệt rõ `server` vs `client` env.
- **`.env.example`** có và được track trong git. `.dockerignore` whitelist đúng.
- **`SKIP_ENV_VALIDATION`** flag để bypass trong CI/Docker build.
- Sensitive paths redact trong pino logger: `cookie`, `authorization`, `*.password`, `*.token`.
- **`emptyStringAsUndefined: true`** — tránh bug khi env var được set rỗng.

#### Phát hiện

**[P1 — HIGH] `.env.local` được commit vào git**

- Vị trí: `apps/web/.env.local` tồn tại trong repo
- Mô tả: File `.env.local` chứa giá trị local dev đang bị track bởi git (xuất hiện trong Glob result). Đây là anti-pattern nghiêm trọng — nếu dev vô tình thêm real credentials vào `.env.local`, sẽ bị commit và push.
- Đề xuất: Xác nhận `.env.local` trong `.gitignore` và chạy `git rm --cached apps/web/.env.local` nếu đang được track.

---

**[P2 — MEDIUM] Không có secret scanning**

- Mô tả: Không có `gitleaks`, `truffleHog`, hay GitHub Secret Scanning được cấu hình tường minh.
- Đề xuất: Enable GitHub Secret Scanning trong repo settings. Thêm `gitleaks` vào pre-commit hook hoặc CI.

---

**[P2 — MEDIUM] Không có `.env.production.example` hay môi trường docs**

- Mô tả: `.env.example` chỉ có 3 biến. Không có tài liệu mô tả env vars cho production, staging, test environments.
- Đề xuất: Tạo `docs/environment.md` liệt kê tất cả env vars, mục đích, giá trị mặc định, xem có required không.

---

## 6. Gap so với Google-scale

| Gap                      | Mức ưu tiên | Mô tả                                      | Đề xuất                                                    |
| ------------------------ | ----------- | ------------------------------------------ | ---------------------------------------------------------- |
| **Turbo Remote Cache**   | P0          | Không có, mỗi CI runner build từ đầu       | Vercel Remote Cache hoặc self-hosted                       |
| **Distributed Tracing**  | P0          | Không có OpenTelemetry/Jaeger              | `@vercel/otel` + `instrumentation.ts`                      |
| **Error Tracking**       | P0          | Không có Sentry/Highlight                  | `@sentry/nextjs`                                           |
| **Metrics / APM**        | P0          | Không có Prometheus/Datadog                | OTel Metrics hoặc Vercel Analytics                         |
| **Preview Deployments**  | P1          | Không có per-PR preview URL                | Vercel preview deploy hoặc Railway                         |
| **Deploy Pipeline**      | P1          | CI chỉ verify, không deploy                | Thêm deploy workflow staging + prod                        |
| **Canary / Blue-Green**  | P2          | Không có deployment strategy               | Vercel deployment protection, traffic split                |
| **Rollback mechanism**   | P2          | Không có automated rollback                | Pin docker image tags, Vercel instant rollback             |
| **SLO / SLA definition** | P2          | Không có SLO documents hoặc alerting rules | Định nghĩa SLO (p99 latency, error rate)                   |
| **Infra-as-Code**        | P2          | Không có Terraform/Pulumi                  | IaC cho cloud resources nếu scale lên                      |
| **Incident tooling**     | P3          | Không có runbook, incident playbook        | PagerDuty/OpsGenie integration                             |
| **Load testing**         | P3          | Không có k6/Artillery config               | Thêm performance baseline test                             |
| **SBOM / Supply chain**  | P3          | Không có Software Bill of Materials        | `pnpm audit` trong CI, Renovate vulnerability alerts đã có |
| **E2E Sharding**         | P1          | Serial E2E trên CI (1 worker)              | Playwright sharding across multiple runners                |
| **CODEOWNERS**           | P2          | Không có file                              | `.github/CODEOWNERS` định nghĩa ownership                  |

---

## 7. Tổng hợp theo mức ưu tiên

### P0 — Phải xử lý ngay (blocking cho production scale)

1. Kích hoạt **Turbo Remote Cache** — tiết kiệm 60–80% build time
2. Tích hợp **OpenTelemetry tracing** — không thể debug production không có tracing
3. Tích hợp **Sentry error tracking** — mù hoàn toàn khi có lỗi production
4. Thêm **Metrics / APM** — không thể enforce SLO nếu không đo được

### P1 — Cần xử lý trong sprint tiếp theo

5. Thêm **deploy pipeline** (staging + production)
6. **E2E sharding** trên CI
7. **Health check endpoint** riêng cho Next.js app (không phụ thuộc backend)
8. Tách job CI thành **parallel jobs**
9. Xem xét lại **pre-commit typecheck** (quá chậm, nên chuyển về pre-push)
10. Kiểm tra và remove `apps/web/.env.local` khỏi git tracking

### P2 — Kế hoạch trung hạn

11. Preview deployments per PR
12. Resource limits trong docker-compose
13. CODEOWNERS + branch protection
14. Secret scanning (gitleaks)
15. Canary / rollback strategy
16. SLO documentation

### P3 — Backlog dài hạn

17. IaC (Terraform/Pulumi)
18. Incident playbook / runbook
19. Load testing baseline
20. SBOM generation
21. VSCode workspace recommendations
22. README.md root
23. CONTRIBUTING.md

---

## 8. Điều tốt cần giữ nguyên

- Cấu trúc Turborepo với task pipeline đúng (`dependsOn`, `outputs`, env tracking)
- Dockerfile 3-stage với non-root user — production-ready
- Renovate với automerge strategy hợp lý
- Knip + syncpack — dead code và version consistency
- t3-oss env validation — type-safe và runtime-safe
- Changesets cho release automation
- Pino với redact paths — không leak credentials vào logs
- Concurrency cancellation trong tất cả CI workflows
- `output: "standalone"` trong Next.js — minimal Docker image
