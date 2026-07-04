# Architecture Review — next-monorepo-turbo

**Ngày review:** 2026-07-02  
**Reviewer:** Senior Architect (read-only audit)  
**Phạm vi:** Toàn bộ monorepo — apps/web, packages/{ui,api-client,eslint-config,typescript-config}

---

## Tóm tắt điểm số

| Hạng mục                              | Điểm         |
| ------------------------------------- | ------------ |
| Cấu trúc monorepo & ranh giới module  | 8/10         |
| Turbo pipeline & caching              | 7.5/10       |
| Tách biệt concern (UI / logic / data) | 7/10         |
| Khả năng mở rộng (scale)              | 6/10         |
| Type safety end-to-end                | 8.5/10       |
| Observability & error handling        | 5/10         |
| Tooling hỗ trợ (CI, lint, test)       | 7.5/10       |
| **Tổng điểm kiến trúc**               | **7.1 / 10** |

---

## 1. Cấu trúc Monorepo & Ranh giới Module

### Điểm mạnh

- Phân chia rõ `apps/` vs `packages/` — đúng convention Turborepo.
- `pnpm-workspace.yaml` khai báo đơn giản, không dư.
- `package.json` tại root dùng `"private": true`, không publish root.
- `@workspace/*` scope rõ ràng cho internal packages.
- `knip.json` cấu hình per-workspace — phát hiện dead code từng package.
- `syncpack` kiểm soát version drift cross-package.
- `renovate.json` pin critical deps (next, react, typescript, turbo), automerge minor/patch.

### Vấn đề phát hiện

#### P1 — `@workspace/ui` vừa là internal package vừa phụ thuộc `react` production

- **File:** `packages/ui/package.json`
- **Vấn đề:** `react` và `react-dom` ở `dependencies` thay vì `peerDependencies`. Khi app cài `@workspace/ui`, react sẽ được bundle 2 lần (trong ui + trong web app). Với workspace internal thì pnpm deduplicates, nhưng khi publish ra ngoài (nếu có) hoặc dùng với module federation thì sẽ lỗi.
- **Đề xuất:** Chuyển `react`, `react-dom` sang `peerDependencies` trong `packages/ui/package.json`.

#### P2 — `exports` map của `@workspace/ui` thiếu `types` condition

- **File:** `packages/ui/package.json` (dòng 49–55)
- **Vấn đề:** Exports map trỏ thẳng vào `.ts` source, không có `types` condition và không có build step. Hoạt động vì `transpilePackages` trong next.config.ts, nhưng không tương thích nếu thêm app không phải Next.js (ví dụ Electron, Express SSR, React Native).
- **Đề xuất:** Thêm build step (`tsup` hoặc `pkgroll`) tạo `dist/` với `.d.ts`, và exports map trỏ vào `dist/`.

#### P2 — `@workspace/api-client` exports trỏ vào `.ts` raw source

- **File:** `packages/api-client/package.json` (dòng 11–17)
- **Vấn đề:** `"./hooks/*": "./src/hooks/*.ts"` — glob pattern trong exports map chỉ được hỗ trợ từ Node 18.19+, và nhiều bundler không hỗ trợ. Cũng không có build step.
- **Đề xuất:** Build với `tsup --dts`, trỏ exports vào `dist/`.

#### P3 — Không có circular dependency detection

- Không có `eslint-plugin-import` với `import/no-cycle` hoặc `madge` trong CI.
- Hiện tại scope nhỏ nên chưa có circular deps, nhưng khi thêm packages mới (ví dụ `@workspace/auth`, `@workspace/config`) rủi ro tăng.

---

## 2. Turbo Pipeline & Caching

### Điểm mạnh

- `build` đúng `dependsOn: ["^build"]` — đảm bảo dependency packages build trước.
- `outputs` cấu hình chính xác (`.next/**` bỏ cache folder).
- `globalEnv` khai báo `NODE_ENV`, `SKIP_ENV_VALIDATION`.
- `test:e2e` `cache: false` — đúng vì E2E không nên cache.
- `codegen` `cache: false` — đúng vì phụ thuộc external OpenAPI URL.
- `dev` `persistent: true` — đúng.
- `ui: "tui"` — UX tốt khi dev local.

### Vấn đề phát hiện

#### P2 — `lint` có `dependsOn: ["^lint"]` nhưng không cần thiết

- **File:** `turbo.json` (dòng 13–22)
- **Vấn đề:** Lint không phụ thuộc vào output của package khác — dependency packages không cần lint trước khi lint app. `^lint` tạo bottleneck không cần thiết, làm chậm pipeline.
- **Đề xuất:** Xóa `dependsOn` khỏi `lint` task để lint chạy song song.

#### P2 — `format` có `dependsOn: ["^format"]` — tương tự vấn đề trên

- **File:** `turbo.json` (dòng 23–25)
- **Đề xuất:** `format` nên độc lập, không cần `dependsOn`.

#### P2 — `test` `dependsOn: ["^build"]` thay vì `["^typecheck"]`

- **File:** `turbo.json` (dòng 31–36)
- **Vấn đề:** Unit test không cần build artifacts của packages — chỉ cần types. Build đầy đủ (Next.js compile, `.next/`) mất nhiều thời gian hơn cần thiết. Vitest dùng alias trực tiếp vào source.
- **Đề xuất:** Đổi thành `dependsOn: ["^typecheck"]` hoặc bỏ hẳn `dependsOn` cho unit test.

#### P3 — Thiếu `remote caching` configuration

- Không thấy Turbo Remote Cache config (Vercel Remote Cache hoặc self-hosted). Với team > 3 người, build time sẽ tăng mạnh.
- **Đề xuất:** Thêm `TURBO_TOKEN` và `TURBO_TEAM` cho Vercel Remote Cache, hoặc setup `turborepo-remote-cache` self-hosted.

---

## 3. Tách biệt Concern

### Điểm mạnh

- **Data layer:** `@workspace/api-client` tách bạch với app — Orval generate TanStack Query hooks từ OpenAPI spec. Pattern `customAxiosInstance` mutator chuẩn.
- **Proxy pattern:** `app/api/[...path]/route.ts` làm BFF proxy — client không gọi backend trực tiếp, tránh CORS, ẩn backend URL.
- **Server/Client boundary:** `lib/auth-server.ts` có `import "server-only"`, `lib/logger.ts` có `import "server-only"` — đúng.
- **Validation:** Zod schemas ở `lib/validation/` tách khỏi UI components.
- **i18n:** `next-intl` với routing, messages tách bạch trong `i18n/` và `messages/`.
- **State:** Zustand chỉ cho UI state (sidebar), không mix với server state — đúng pattern.
- **Env validation:** `@t3-oss/env-nextjs` với runtime validation — production-safe.

### Vấn đề phát hiện

#### P1 — `getServerSession()` trong `auth-server.ts` manually re-implement session fetch

- **File:** `apps/web/lib/auth-server.ts`
- **Vấn đề:** Hàm `getServerSession` tự gọi `fetch` tới `BACKEND_URL/api/auth/get-session` với `cache: "no-store"`. Điều này có nghĩa mỗi RSC render đều tạo một HTTP round-trip tới backend. Không có caching tầng RSC (Next.js `cache()` / `unstable_cache`). Ở scale lớn (Google-scale), điều này tạo waterfall không cần thiết.
- **Đề xuất:** Wrap với `React.cache()` để dedup trong cùng một request, hoặc dùng `unstable_cache` với revalidation tag.

#### P2 — Session type trong `auth-server.ts` tự định nghĩa, không sync với backend schema

- **File:** `apps/web/lib/auth-server.ts` (dòng 7–18)
- **Vấn đề:** `interface Session { user: {...}, session: {...} }` được định nghĩa thủ công. Nếu backend thay đổi cấu trúc session, type này không tự cập nhật. Better Auth có `$Infer<typeof auth>` để infer type từ config.
- **Đề xuất:** Generate hoặc import session type từ `@workspace/api-client/types`.

#### P2 — Business logic validation (Zod schemas) nằm trong app, không share được

- **File:** `apps/web/lib/validation/auth.ts`
- **Vấn đề:** Schema `loginSchema`, `registerSchema` chỉ tồn tại trong app `web`. Nếu thêm app `mobile` hoặc `admin`, phải duplicate.
- **Đề xuất:** Tạo `packages/validation` chứa shared Zod schemas.

#### P3 — `axios-instance.ts` dùng `window.location.replace` cho 401 redirect

- **File:** `packages/api-client/src/lib/axios-instance.ts` (dòng 31–36)
- **Vấn đề:** Side effect trong interceptor — hard-code `/login` path. Nếu app có locale prefix (`/en/login`, `/vi/login`), redirect sẽ sai. Không injectable / testable.
- **Đề xuất:** Expose callback `onUnauthorized?: () => void` thay vì hard-code redirect.

---

## 4. Khả năng Mở rộng (Scalability)

### Điểm mạnh

- Turbo prune trong Dockerfile — image chỉ chứa deps của `web`, không phải toàn monorepo.
- Docker healthcheck đúng chuẩn.
- Multi-stage build (pruner → builder → runner) — best practice.
- Non-root user trong Docker (`nextjs:nodejs`).
- `output: "standalone"` trong Next.js config — tối ưu cold start.
- `optimizePackageImports` cho lucide-react và @workspace/ui — giảm bundle size.
- `@turbo/gen` trong `packages/ui/devDependencies` — hỗ trợ code generation cho packages mới.

### Vấn đề phát hiện

#### P0 — Không có Feature Flag system

- **Vấn đề:** Không có bất kỳ abstraction nào cho feature flags (LaunchDarkly, GrowthBook, OpenFeature, hoặc custom). Ở Google-scale, feature flags là bắt buộc để: gradual rollout, A/B testing, killswitch, canary release.
- **Đề xuất:** Thêm `packages/feature-flags` với OpenFeature SDK, provider interface trung lập. Implement GrowthBook hoặc custom JSON-based provider.

#### P0 — Không có Observability boundary (tracing, metrics)

- **Vấn đề:** `pino` logger ở server-only, nhưng không có distributed tracing (OpenTelemetry), không có request ID propagation từ frontend tới backend, không có metrics export (Prometheus/StatsD). `X-Request-Id` header được backend generate (thấy trong Orval generated docs) nhưng không được capture/log ở proxy layer.
- **Đề xuất:** Thêm OpenTelemetry SDK vào proxy route handler. Propagate `X-Request-Id` từ upstream response vào log. Tạo `packages/observability` export telemetry setup.

#### P1 — Không có React Error Boundaries

- **File:** `apps/web/app/[locale]/layout.tsx`
- **Vấn đề:** Không có `error.tsx` file trong route groups. Không có Error Boundary component trong `@workspace/ui`. Lỗi unhandled trong Client Components sẽ crash toàn bộ UI.
- **Đề xuất:** Thêm `error.tsx` vào `(app)/`, `(auth)/`, và root `[locale]/`. Thêm `ErrorBoundary` component vào `@workspace/ui`.

#### P1 — Middleware auth check không đủ mạnh

- **File:** `apps/web/middleware.ts`
- **Vấn đề:** `hasSessionCookie()` chỉ kiểm tra sự tồn tại của cookie theo prefix name (`better-auth` + `session`). Không verify signature, không check expiry. Kẻ tấn công có thể forge cookie name để bypass middleware. Session thực sự chỉ được validate tại RSC layout (`getServerSession()`), nhưng middleware redirect tới login không hoàn toàn an toàn.
- **Mức độ thực tế:** Medium — double-check tại layout RSC mitigates, nhưng UX bị ảnh hưởng (sẽ redirect tới login rồi mới redirect về sau khi session check ở layout).
- **Đề xuất:** Document rõ 2-layer auth pattern. Hoặc dùng `better-auth` middleware helper nếu có.

#### P2 — `changesets` cấu hình `access: "restricted"` nhưng packages là `private: true`

- **File:** `.changeset/config.json`
- **Vấn đề:** `access: "restricted"` chỉ có ý nghĩa khi publish lên npm. Packages đều `private: true`. `web` bị `ignore` trong changesets — đúng. Nhưng `@workspace/ui` và `@workspace/api-client` nếu muốn extract thành public packages thì cần thay đổi cấu hình.
- **Đề xuất:** Làm rõ intent: nếu packages mãi internal thì bỏ changeset machinery. Nếu có plan publish, khai báo rõ trong README.

#### P2 — Không có `@workspace/config` cho shared constants

- **Vấn đề:** Constants như `STALE_TIME_MS = 60_000` ở `lib/query-client.ts`, `SESSION_COOKIE_PREFIX = "better-auth"` ở `middleware.ts`, route paths như `/login` ở nhiều nơi — đều hardcoded. Khi thêm app mới, phải duplicate.
- **Đề xuất:** Tạo `packages/config` chứa shared constants, route definitions, và feature config.

#### P3 — Không có Module Federation / Micro-frontend readiness

- Ở Google-scale, multiple teams thường cần deploy từng feature module độc lập. Hiện tại không có cấu trúc cho micro-frontend.
- **Đề xuất:** Đây là long-term concern. Document quyết định kiến trúc: monolithic Next.js app vs micro-frontend. Nếu chọn monolithic, ghi rõ để tránh over-engineering.

---

## 5. Type Safety End-to-End

### Điểm mạnh

- `tsconfig/base.json` bật đầy đủ strict flags: `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `useUnknownInCatchVariables`.
- Orval generate types từ OpenAPI spec — type-safe từ backend tới frontend hook.
- `@t3-oss/env-nextjs` với Zod validation cho env vars.
- `zod` cho form validation (`react-hook-form` + `zodResolver`).
- `server-only` guard cho server-side modules.

### Vấn đề phát hiện

#### P2 — Không có API contract testing (contract tests)

- **Vấn đề:** Orval codegen phụ thuộc vào backend OpenAPI spec. Nếu backend thay đổi endpoint mà không update spec, hoặc spec sai, frontend sẽ có type mismatch tại runtime. Không có Pact/MSW contract tests để catch breaking changes sớm.
- **Đề xuất:** Thêm Pact consumer tests hoặc snapshot test cho generated schemas.

#### P2 — `packages/api-client/src/types/index.ts` định nghĩa `Paginated<T>`, `ListQuery` thủ công

- **Vấn đề:** Các types này có thể conflict với Orval-generated schemas nếu backend cũng export tương tự. Cần kiểm tra có duplicate không.
- **Đề xuất:** Consolidate: hoặc dùng generated types từ Orval, hoặc dùng manual types — không nên có cả hai.

#### P3 — `eslint-plugin-only-warn` chuyển tất cả ESLint errors thành warnings

- **File:** `packages/eslint-config/base.js` (dòng 26–30)
- **Vấn đề:** `onlyWarn` plugin downgrade tất cả errors thành warnings. TypeScript violations sẽ không block CI nếu chỉ lint mà không `--max-warnings 0`. Mất tác dụng của strict linting.
- **Đề xuất:** Bỏ `onlyWarn` plugin, hoặc thêm `--max-warnings 0` vào CI lint command.

---

## 6. Tooling & CI Readiness

### Điểm mạnh

- `husky` hooks: `pre-commit` (lint-staged), `commit-msg` (commitlint), `pre-push` (presumably tests).
- `commitlint` với conventional commits.
- `vitest` với `jsdom` + `@testing-library/react` + `msw` — test stack hiện đại.
- `playwright` với multi-browser (chromium, firefox, webkit).
- MSW handlers cho unit test isolation.
- `prettier-plugin-tailwindcss` đảm bảo class ordering.

### Vấn đề phát hiện

#### P1 — Không có CI/CD configuration

- **Vấn đề:** Không tìm thấy `.github/workflows/` hoặc bất kỳ CI config nào. Tất cả guards chỉ chạy local qua husky. Nếu developer bypass hooks (commit với `--no-verify`), không có safety net.
- **Đề xuất:** Thêm GitHub Actions workflow: `ci.yml` chạy lint + typecheck + test trên mỗi PR.

#### P1 — Unit test coverage quá thấp

- **File:** `apps/web/tests/unit/` — chỉ có 1 file test (`use-health.test.tsx`)
- **Vấn đề:** 1 test cho toàn bộ app. Middleware, auth flow, query client config, stores — tất cả không có unit test. E2E test cũng chỉ có 2 test cases.
- **Đề xuất:** Đặt coverage threshold (80%+) trong `vitest.config.ts`. Thêm test cho middleware, validation schemas, stores.

#### P2 — `packages/ui` không có test

- `@workspace/ui` không có test setup. Component library không có unit test hay visual regression test (Storybook/Chromatic).
- **Đề xuất:** Thêm Storybook + Chromatic cho visual regression, hoặc ít nhất vitest cho utils/hooks.

#### P2 — `packages/api-client` không có test

- Generated hooks chưa có test. Nếu `orval.config.ts` thay đổi output format, không có gì catch regression.

---

## 7. Các Điểm Thiếu So Với Google-Scale

| Gap                       | Mức độ | Mô tả                                                             |
| ------------------------- | ------ | ----------------------------------------------------------------- |
| Feature flags             | P0     | Không có gradual rollout, A/B, killswitch                         |
| Distributed tracing       | P0     | Không có OpenTelemetry, request ID propagation                    |
| Error boundaries          | P1     | Không có error.tsx, không có ErrorBoundary component              |
| CI/CD pipeline            | P1     | Không có GitHub Actions / CD pipeline                             |
| Test coverage             | P1     | Coverage < 5%, không có threshold                                 |
| React cache() cho session | P1     | Mỗi RSC render gọi HTTP fetch tới backend                         |
| Contract testing          | P2     | Không catch breaking API changes sớm                              |
| Shared packages build     | P2     | Packages không có build step, chỉ dùng được với transpilePackages |
| Remote Turbo caching      | P2     | Build không được cache across machines/CI                         |
| Shared validation package | P2     | Validation schemas bị duplicate khi thêm apps                     |
| onlyWarn ESLint           | P3     | Lint errors không block CI                                        |
| Circular dep detection    | P3     | Không có madge / import/no-cycle                                  |
| Module federation plan    | P3     | Không có long-term micro-frontend strategy                        |

---

## Kết luận

Monorepo này là một **boilerplate chất lượng tốt** cho team startup tới mid-size (5–20 engineers). Các lựa chọn công nghệ hiện đại và đúng hướng: Turborepo, pnpm, Next.js App Router, TanStack Query, Orval codegen, better-auth, Zod, pino.

Để đạt **Google-scale production**, cần bổ sung chủ yếu ở:

1. Observability (OpenTelemetry + structured tracing)
2. Feature flag infrastructure
3. CI/CD pipeline đầy đủ
4. Test coverage nghiêm túc
5. Build artifacts cho shared packages (không rely vào transpilePackages)

**Điểm kiến trúc tổng: 7.1 / 10**
