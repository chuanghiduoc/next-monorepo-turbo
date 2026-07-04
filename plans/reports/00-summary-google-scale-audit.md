# Báo cáo tổng hợp: Audit "Google-scale" + Vá bảo mật + GitHub bots

Ngày: 2026-07-02 · Phạm vi: toàn monorepo `next-monorepo-turbo`

---

## 1. Vá bảo mật dependencies (HOÀN TẤT ✅)

| Chỉ số       | Trước  | Sau   |
| ------------ | ------ | ----- |
| Tổng lỗ hổng | **79** | **0** |
| Critical     | 2      | 0     |
| High         | 36     | 0     |
| Moderate     | 30     | 0     |
| Low          | 11     | 0     |

**Cách làm (an toàn, giữ nguyên major version):**

- `next` 16.1.6 → **16.2.10** (vá HIGH, minor bump trong major 16).
- Thêm `pnpm.overrides` (root `package.json`) ép transitive deps lên bản patched.
- Khai báo `vite ^8.1.3` trực tiếp ở `apps/web` để hoist bản đã vá.
- **Không** ép `undici` (đã revert): jsdom@29.1.1 gọi internal `undici/lib/handler/wrap-handler.js` — bị xóa ở undici v8. Bỏ override → pnpm chọn đúng `undici@7.28.0` (bản patched + còn `wrap-handler`). Đây là dep **test-only**, không vào production bundle.

**Verify:** `pnpm typecheck` ✅ · `pnpm build` ✅ · `pnpm test` ✅ · `pnpm audit` = clean (cả `--prod` lẫn full).

---

## 2. GitHub security bots (HOÀN TẤT ✅)

| File                             | Vai trò                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `.github/dependabot.yml`         | Dependabot **security-only** (`open-pull-requests-limit: 0`) — tránh trùng Renovate |
| `.github/workflows/codeql.yml`   | CodeQL SAST (`security-extended`) + quét định kỳ                                    |
| `.github/workflows/gitleaks.yml` | Secret scanning toàn lịch sử commit                                                 |
| `.github/SECURITY.md`            | Security policy + checklist kích hoạt                                               |
| `.github/workflows/ci.yml` (sửa) | Thêm bước `pnpm audit --prod --audit-level high`                                    |
| `renovate.json` (đã có sẵn)      | Version updates + vulnerabilityAlerts                                               |

**Cần Sếp bật thủ công** (Settings → Code security): Dependabot alerts/security updates, Code scanning, Secret scanning + Push protection, cài Renovate App.

---

## 3. Agent team review — Đã đạt chuẩn Google-scale chưa?

### Kết luận: **CHƯA** — Điểm trung bình ~**5.6/10**

Đây là boilerplate **nền tảng tốt** (stack hiện đại, đúng hướng) nhưng còn khoảng cách lớn để đạt quy mô "siêu to".

| Lĩnh vực                | Điểm   | Trạng thái |
| ----------------------- | ------ | ---------- |
| Kiến trúc / Scalability | 7.1/10 | Khá        |
| DevOps / DX / Vận hành  | 6.1/10 | Trung bình |
| Bảo mật (code)          | 5.5/10 | Cần gia cố |
| Testing / QA            | 3.6/10 | Yếu nhất   |

### Gap ưu tiên cao nhất (tổng hợp cả team)

**P0 — Observability trắng:** không tracing (OpenTelemetry), không error tracking (Sentry), không metrics/APM. Mù hoàn toàn khi lỗi production. _(Kiến trúc + DevOps đồng thuận)_

**P0 — Testing gần 0:** toàn repo chỉ **3 test** (1 unit + 2 e2e); `packages/ui` & `packages/api-client` không có test; không có coverage threshold; ESLint dùng `only-warn` (không chặn được lỗi).

**P0 — Bảo mật cần xác minh theo threat model:**

- C-01: proxy `/api/[...path]` bị middleware loại khỏi auth-check → cần xác nhận backend tự xác thực (nếu có thì không phải lỗ hổng; nếu không thì Critical).
- Thiếu security headers (CSP/HSTS/X-Frame-Options) ở `next.config.ts`.
- Open redirect qua param `next` ở login page.

**P1 — Thiếu remote cache & deploy pipeline:** CI build lại từ đầu mỗi lần (chưa bật Turbo Remote Cache); chưa có preview/staging/prod deploy.

**P1 — Chưa có feature-flag system** (gradual rollout / killswitch).

### Đính chính false-positive (đã tự kiểm chứng)

- ❌ "Không có CI/CD" (architecture agent) → **SAI**: đã có `ci.yml`, `e2e.yml`, `release.yml`.
- ❌ "`.env.local` bị Git track" (devops agent) → **SAI**: `git ls-files` xác nhận chỉ `.env.example` được track; `.gitignore` đã chặn `.env.local`.

### Điểm cộng ghi nhận

Orval codegen type-safe end-to-end · Proxy BFF pattern sạch · Dockerfile multi-stage + non-root user + standalone · TS strict đầy đủ · env validation (t3-oss + Zod) · `server-only` boundary đúng · Pino redact secret · Husky/commitlint/lint-staged/knip/changesets/syncpack.

### Báo cáo chi tiết

- `plans/reports/security-review.md`
- `plans/reports/architecture-review.md`
- `plans/reports/testing-review.md`
- `plans/reports/devops-dx-review.md`
