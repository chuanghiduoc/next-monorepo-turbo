# Testing & QA Review Report

**Dự án:** next-monorepo-turbo  
**Ngày review:** 2026-07-02  
**Reviewer:** QA/Testing Audit Agent  
**Phạm vi:** Toàn bộ monorepo (apps/web, packages/ui, packages/api-client)

---

## Tổng quan điểm số

| Hạng mục                                      | Điểm | Trọng số | Điểm có trọng số |
| --------------------------------------------- | ---- | -------- | ---------------- |
| Unit Test coverage & chất lượng               | 2/10 | 30%      | 0.6              |
| E2E Test                                      | 4/10 | 20%      | 0.8              |
| CI/CD Gates                                   | 5/10 | 20%      | 1.0              |
| Lint/Format/Typecheck Gates                   | 8/10 | 15%      | 1.2              |
| Test cho packages (ui, api-client)            | 0/10 | 10%      | 0.0              |
| Tooling nâng cao (mutation, contract, visual) | 0/10 | 5%       | 0.0              |

**TỔNG ĐIỂM: 3.6 / 10**

---

## 1. Unit Tests (Vitest)

### Trạng thái hiện tại

- **Config:** `apps/web/vitest.config.ts` — cấu hình hợp lệ, dùng jsdom, react plugin, có alias đúng
- **Setup:** `tests/setup.ts` — MSW setup đúng chuẩn (`beforeAll/afterEach/afterAll`)
- **Test utils:** `tests/test-utils.tsx` — `renderWithProviders` wrapper với `QueryClientProvider`, đúng pattern
- **Mock handlers:** `tests/mocks/handlers.ts` — 3 handler: `GET /v1/health`, `GET /auth/get-session`, `POST /auth/sign-in/email`

### Số lượng test thực tế

| File                             | Test cases                                 |
| -------------------------------- | ------------------------------------------ |
| `tests/unit/use-health.test.tsx` | **1 test** (`useHealth` returns ok status) |
| **TỔNG**                         | **1 unit test**                            |

### Vấn đề phát hiện

| ID  | Mức độ   | Vị trí                    | Mô tả                                                                                                                                                   | Đề xuất                                                                           |
| --- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| U1  | CRITICAL | `vitest.config.ts`        | **Không có coverage threshold** — `coverage.thresholds` không được cấu hình, test:coverage chạy nhưng không thất bại khi coverage thấp                  | Thêm `thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 }`     |
| U2  | CRITICAL | `apps/web/tests/unit/`    | **Chỉ có 1 test duy nhất** cho toàn bộ `apps/web` — không có test cho page, component, hook, middleware, utility                                        | Viết test cho auth flow, form validation, error boundaries, custom hooks          |
| U3  | HIGH     | `vitest.config.ts`        | **Coverage provider không khai báo** — thiếu `provider: 'v8'` hoặc `'istanbul'`, output có thể không nhất quán trên CI                                  | Thêm `provider: 'v8'` vào coverage config                                         |
| U4  | HIGH     | `vitest.config.ts`        | **Coverage không upload lên CI** — `.github/workflows/ci.yml` chạy `pnpm test` nhưng không chạy `test:coverage`, không có bước upload coverage artifact | Dùng `test:coverage` trong CI và upload lcov artifact, tích hợp Codecov/Coveralls |
| U5  | MEDIUM   | `tests/mocks/handlers.ts` | **Chỉ mock 3 endpoints** trong khi `api-client` có hàng chục endpoints (user, admin, upload, social sign-in, ...)                                       | Mở rộng handlers cho tất cả endpoints quan trọng                                  |
| U6  | MEDIUM   | Toàn bộ codebase          | **Không có test cho error paths** — mock handler có trả 401 nhưng không có test nào kiểm tra behavior khi API thất bại                                  | Viết test cho 4xx/5xx responses, network errors, timeout                          |

---

## 2. E2E Tests (Playwright)

### Trạng thái hiện tại

- **Config:** `apps/web/playwright.config.ts` — 3 browsers (Chrome, Firefox, WebKit), retry 2 lần trên CI, screenshot + video on failure
- **Workers CI:** `workers: 1` trên CI — tốt, tránh race condition
- **Retries:** `retries: 2` trên CI — có cơ chế retry cơ bản
- **Webserver:** Tự khởi động `pnpm dev` với timeout 120s

### Số lượng E2E test

| File                     | Test cases                                                |
| ------------------------ | --------------------------------------------------------- |
| `tests/e2e/auth.spec.ts` | **2 tests** (redirect unauthenticated, validation errors) |
| **TỔNG**                 | **2 E2E tests**                                           |

### Vấn đề phát hiện

| ID  | Mức độ   | Vị trí                      | Mô tả                                                                                                                                      | Đề xuất                                                                                                       |
| --- | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| E1  | CRITICAL | `tests/e2e/`                | **Chỉ có 2 E2E test** — không có test cho: đăng nhập thành công, đăng ký, dashboard, profile, CRUD flows                                   | Thêm spec files cho từng feature: `login.spec.ts`, `register.spec.ts`, `dashboard.spec.ts`                    |
| E2  | HIGH     | `playwright.config.ts`      | **Không có flaky test handling** — không có `testIdAttribute`, không có `expect.poll()` cho async waits, không cấu hình timeout per-action | Thêm `actionTimeout: 10_000`, `navigationTimeout: 30_000` và page object model                                |
| E3  | HIGH     | `playwright.config.ts`      | **Webserver dùng `pnpm dev` thay vì build** — dev mode chậm hơn và có behavior khác production (`next build && next start`)                | Đổi webserver command sang `pnpm start` sau khi đã build, hoặc dùng `PLAYWRIGHT_SKIP_WEBSERVER` với pre-built |
| E4  | MEDIUM   | `.github/workflows/e2e.yml` | **Playwright report chỉ upload 14 ngày** — artifact `playwright-report` sẽ bị xóa sau 2 tuần, khó debug flaky tests lịch sử                | Tăng `retention-days` lên 30 hoặc publish lên Playwright service                                              |
| E5  | MEDIUM   | `e2e.yml`                   | **Không có test isolation** — không có mock server/fixtures cho E2E, test phụ thuộc backend thật hoặc server đang chạy                     | Dùng `page.route()` để intercept API calls trong E2E, thêm fixtures                                           |

---

## 3. CI/CD Gates

### Trạng thái hiện tại

**ci.yml** (chạy khi PR và push main):

- lint (eslint) — có chặn
- typecheck (tsc) — có chặn
- unit tests (`pnpm test`) — có chặn
- build — có chặn
- Turbo cache: có

**e2e.yml** (chạy khi PR và push main):

- Playwright 3 browsers — có chặn khi fail

**release.yml**:

- Dùng changesets — tạo PR version bump

### Vấn đề phát hiện

| ID  | Mức độ   | Vị trí               | Mô tả                                                                                                                                      | Đề xuất                                                                      |
| --- | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| C1  | CRITICAL | `ci.yml`             | **Không chạy coverage trong CI** — `pnpm test` chạy `vitest run` (không có coverage), không có enforcement threshold                       | Thay bằng `pnpm test:coverage` và fail CI nếu dưới threshold                 |
| C2  | HIGH     | `ci.yml`             | **Không có coverage upload** — không có Codecov, Coveralls, hay artifact upload cho coverage HTML                                          | Thêm bước upload coverage artifact, tích hợp Codecov action                  |
| C3  | HIGH     | `ci.yml`             | **Tất cả jobs trong 1 job duy nhất** — lint, typecheck, test, build chạy tuần tự trong `verify` job, feedback chậm                         | Tách thành matrix jobs song song: `lint-and-type`, `unit-test`, `build`      |
| C4  | MEDIUM   | `ci.yml` + `e2e.yml` | **Không có required status checks** — bản thân file workflow không enforce required checks; cần config branch protection rules trên GitHub | Bật branch protection: require `verify` và `playwright` jobs trước khi merge |
| C5  | MEDIUM   | `e2e.yml`            | **E2E không có artifact so sánh** — không có snapshot comparison, không có baseline cho visual regression                                  | Thêm Playwright visual comparison hoặc Percy/Chromatic integration           |

---

## 4. Lint / Format / Typecheck Gates

### Trạng thái hiện tại — ĐIỂM CAO NHẤT trong dự án

| Tool                   | Config                                          | Kích hoạt khi nào            |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| ESLint 9 (flat config) | `eslint.config.js` + `@workspace/eslint-config` | pre-commit (lint-staged), CI |
| Prettier 3             | `.prettierrc` + `prettier-plugin-tailwindcss`   | pre-commit (lint-staged), CI |
| TypeScript strict      | Shared tsconfig                                 | pre-commit (husky), CI       |
| Husky hooks            | pre-commit, commit-msg, pre-push                | local dev                    |
| lint-staged            | `.lintstagedrc.json`                            | pre-commit                   |
| commitlint             | `commitlint.config.js`                          | commit-msg hook              |
| knip                   | `knip.json`                                     | manual (`pnpm knip`)         |
| syncpack               | root `package.json`                             | manual                       |

### Vấn đề phát hiện

| ID  | Mức độ | Vị trí                           | Mô tả                                                                                                                                                      | Đề xuất                                                             |
| --- | ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| L1  | HIGH   | `eslint.config.js`               | **ESLint dùng `eslint-plugin-only-warn`** — tất cả errors bị downgrade thành warnings, `--max-warnings 0` trong lint-staged nhưng turbo lint không enforce | Xóa `only-warn` plugin, để lỗi thật sự là errors                    |
| L2  | HIGH   | Root `package.json`              | **`pnpm knip` không chạy trong CI** — chỉ có `knip` script nhưng không có trong `.github/workflows/` nào                                                   | Thêm bước `pnpm knip` vào `ci.yml`                                  |
| L3  | MEDIUM | `packages/eslint-config/base.js` | **Không có các rule quan trọng**: `no-console`, `no-debugger`, `@typescript-eslint/no-explicit-any` chưa strict                                            | Bật `@typescript-eslint/no-explicit-any: error`, `no-console: warn` |
| L4  | LOW    | `lint-staged`                    | **Typecheck không chạy trong lint-staged** — `pnpm typecheck` chạy trong `pre-commit` hook (toàn bộ), không tăng dần theo staged files                     | Cân nhắc dùng `tsc-files` hoặc chấp nhận toàn bộ typecheck          |

---

## 5. Test cho packages/ui và packages/api-client

### Trạng thái hiện tại: HOÀN TOÀN KHÔNG CÓ

| Package                      | Unit Tests | Integration Tests | Type Tests |
| ---------------------------- | ---------- | ----------------- | ---------- |
| `packages/ui`                | Không      | Không             | Không      |
| `packages/api-client`        | Không      | Không             | Không      |
| `packages/eslint-config`     | Không      | Không             | N/A        |
| `packages/typescript-config` | N/A        | N/A               | N/A        |

### Chi tiết packages/ui

- 55+ component files (button, dialog, form, table, sidebar, chart, ...)
- Không có `vitest.config.ts`, không có `package.json` `test` script
- `src/components/.gitkeep`, `src/hooks/.gitkeep` — thư mục scaffold trống

### Chi tiết packages/api-client

- Code generated bởi Orval (hợp lý không test code generated)
- Nhưng không có test cho các hooks tự viết trong `src/hooks/`
- Không có contract test (OpenAPI schema validation)

### Vấn đề phát hiện

| ID  | Mức độ   | Vị trí                | Mô tả                                                                                                       | Đề xuất                                                                        |
| --- | -------- | --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P1  | CRITICAL | `packages/ui`         | **Không có test cho 55+ UI components** — không ai verify components render đúng, accessibility, prop types | Thêm vitest + @testing-library/react, test render + snapshot cho mỗi component |
| P2  | HIGH     | `packages/api-client` | **Không có contract test** — generated code từ OpenAPI nhưng không verify schema runtime                    | Thêm Zod schema validation test hoặc schemathesis-style contract tests         |
| P3  | HIGH     | `packages/api-client` | **Hooks trong `src/hooks/` không được test** — logic query hooks có thể bị break                            | Viết unit test cho custom hooks bằng `@tanstack/react-query` testing utilities |
| P4  | MEDIUM   | `packages/ui`         | **Không có accessibility test** — components dùng Radix UI nhưng không verify a11y                          | Thêm `@axe-core/react` hoặc `jest-axe` vào test suite                          |
| P5  | MEDIUM   | `packages/ui`         | **Không có visual regression test** — không ai biết component thay đổi visual                               | Tích hợp Chromatic hoặc Playwright component testing                           |

---

## 6. Thiếu so với Google-scale

| Hạng mục                               | Trạng thái | Gap                                                      |
| -------------------------------------- | ---------- | -------------------------------------------------------- |
| Coverage threshold (80%+)              | Không có   | Thêm vào vitest config và CI                             |
| Mutation testing (Stryker)             | Không có   | Test suite chỉ 1 test, mutation testing vô nghĩa lúc này |
| Contract testing (Pact/OpenAPI)        | Không có   | api-client không có contract validation                  |
| Visual regression (Chromatic/Percy)    | Không có   | Không có screenshot baseline                             |
| Flaky test tracking                    | Không có   | Playwright retries có nhưng không track/report flaky     |
| Performance testing (k6/Lighthouse CI) | Không có   | Không có perf gate                                       |
| Security scanning trong CI             | Không có   | Không có `pnpm audit` hay Snyk trong CI                  |
| Test cho packages                      | Không có   | ui, api-client hoàn toàn không có test                   |
| Component storybook/test               | Không có   | Không có Storybook hay Playwright CT                     |
| Database migration test                | N/A        | Không có DB trong monorepo                               |
| Error boundary test                    | Không có   | Không có test cho React Error Boundaries                 |
| Accessibility audit CI                 | Không có   | Không có `axe-core` integration                          |

---

## 7. Summary — Top Gaps theo ưu tiên

### P0 — Urgent (block production quality)

1. **Coverage threshold = 0%** — không có ngưỡng tối thiểu, CI pass dù không có test nào
2. **1 unit test cho toàn bộ app** — coverage thực tế gần 0%, toàn bộ logic không được bảo vệ
3. **0 test cho packages/ui (55+ components) và packages/api-client**

### P1 — High (nên fix trong sprint tiếp theo)

4. **ESLint `only-warn` plugin** — tất cả linting errors bị silently downgrade, gate không thực sự ngăn bugs
5. **E2E chỉ 2 tests** — không cover auth success, dashboard, CRUD, không có page object model

### P2 — Medium (backlog kỹ thuật)

6. **CI không upload coverage artifact** — không có visibility trên coverage theo thời gian
7. **`pnpm knip` không chạy trong CI** — dead code có thể tích lũy
8. **Không có contract test** cho API client
9. **Playwright webserver dùng `dev` mode** thay vì production build
10. **Không có visual regression / accessibility CI gate**

---

## 8. Khuyến nghị action plan

### Phase 1 (1-2 ngày): Coverage foundation

```
- Thêm coverage.thresholds vào vitest.config.ts (statements/branches/functions/lines: 60%)
- Đổi CI unit test từ `pnpm test` sang `pnpm test:coverage`
- Thêm ít nhất 10 unit tests cho các hook và utility chính
```

### Phase 2 (1 tuần): Package tests

```
- Setup vitest trong packages/ui với test script
- Viết render test cho 5-10 component quan trọng nhất (Button, Form, Dialog, Table)
- Viết test cho hooks trong packages/api-client
```

### Phase 3 (1-2 tuần): E2E và CI hardening

```
- Viết page objects cho login/dashboard E2E
- Thêm pnpm knip vào CI
- Xóa eslint-plugin-only-warn
- Thêm pnpm audit vào CI
- Upload coverage artifact lên Codecov
```

### Phase 4 (1 tháng): Google-scale maturity

```
- Visual regression với Playwright screenshots baseline
- Accessibility gates với axe-core
- Contract testing cho API client
- Performance budget với Lighthouse CI
```

---

_Report generated: 2026-07-02 | Reviewer: QA Audit Agent_
