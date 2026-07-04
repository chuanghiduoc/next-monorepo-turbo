# Báo cáo cải thiện chất lượng code (round 2)

Ngày: 2026-07-02 · Trọng tâm: chất lượng code, tận dụng package, custom UI, cấu trúc dự án.
Tất cả thay đổi đã verify: **lint ✅ · typecheck ✅ · test ✅ · build ✅ · audit sạch ✅**.

---

## 1. Phát hiện & sửa 2 bug tiềm ẩn NGHIÊM TRỌNG

### 1.1 `pnpm lint` crash hoàn toàn (lint gate vô dụng)

- **Triệu chứng:** `eslint` crash `TypeError: Cannot set properties of undefined (setting 'defaultMeta')`.
- **Root cause:** override `ajv: ">=6.14.0"` (thêm ở round 1 để vá bảo mật) vô tình cho phép **ajv 8.x**; `@eslint/eslintrc` cần **ajv 6.x** API → crash. Round 1 chỉ chạy typecheck/build/test nên chưa lộ.
- **Fix:** bỏ override ajv (dư thừa) — eslintrc tự resolve `ajv@6.15.0` (đã là bản patched ≥6.14.0). Vừa fix lint vừa giữ ajv sạch.

### 1.2 `pnpm typecheck` fail do dual-version zod (bug có sẵn trong boilerplate gốc)

- **Triệu chứng:** login/register page — `zodResolver` "No overload matches".
- **Root cause:** tồn tại đồng thời **zod@3.25.76** (kéo bởi `shadcn` → `@modelcontextprotocol/sdk`) và **zod@4.4.3** (app) → `@hookform/resolvers/zod` suy luận type nhầm bản. Đã kiểm chứng: HEAD gốc cũng fail y hệt (không phải regression).
- **Fix:** override `zod: "^4.4.3"` ép về một bản duy nhất. `@modelcontextprotocol/sdk` peer `^3.25.0 || ^4.0.0` nên tương thích zod 4 → an toàn.

---

## 2. ESLint & lint gate

- Bỏ `eslint-plugin-only-warn` (hạ mọi error thành warning → gate vô hiệu; đồng thời gây crash).
- Dọn cấu hình trùng lặp trong `next.js` (`js.recommended`/`prettier`/`tseslint` đã có trong `base.js`).
- Remove dep thừa: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` (đã dùng meta `typescript-eslint`), `eslint-plugin-only-warn`.
- Siết gate: `eslint --max-warnings 0` cho cả 3 package (mọi warning tương lai chặn CI).

## 3. Dependency hygiene ("tận dụng triệt để package")

| Hành động                                    | Package                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Remove unused                                | `zod` (ui), `@turbo/gen` (ui, không có generators), `lucide-react` (web — chỉ nằm trong `optimizePackageImports`, không import thật) |
| Add unlisted (đang dùng nhưng chưa khai báo) | `@commitlint/types` (root), `postcss-load-config` (ui)                                                                               |
| `@public` tag cho API cố ý                   | `i18n/navigation` (Link, getPathname), `auth-client` (authClient, useSession, getSession)                                            |
| knip.json                                    | thêm `ignoreDependencies`/`ignoreUnresolved` cho false-positive, dọn redundant entries                                               |
| Cập nhật                                     | `caniuse-lite` (browserslist DB)                                                                                                     |

> knip husky-plugin còn báo 3 "unlisted binaries" (lint-staged/typecheck/test trong `.husky/*`) — đây là hạn chế của knip khi parse `pnpm exec` trong hook, **không phải vấn đề codebase**; knip không nằm trong CI gate.

## 4. Chất lượng code & bảo mật

- **Security headers** (`next.config.ts`): CSP baseline, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy.
- **Open-redirect** (`login/page.tsx`): validate `next` — chỉ chấp nhận same-origin path, chặn `//evil.com` / URL tuyệt đối.
- **React.cache()** (`auth-server.ts`): `getServerSession` dedupe 1 round-trip/request thay vì mỗi RSC gọi lại.
- **Logger PII** (proxy route): chỉ log path đã sanitize, không log backend host + query string.

## 5. Đánh giá "custom UI / cấu trúc" — GIỮ NGUYÊN (đã tốt)

- **Custom UI:** 57 component shadcn chuẩn, tổ chức rõ (`components/`, `hooks/`, `lib/`, `styles/`). Các file lớn (sidebar 702 dòng…) là shadcn chuẩn — **không xẻ nhỏ** (giữ pattern).
- **Tận dụng package:** tanstack-query (SSR-safe + dehydrate pending), zustand (persist + skipHydration), react-hook-form + zod, next-intl, orval codegen type-safe — đều dùng đúng chuẩn.
- **Cấu trúc:** monorepo layer-based, ranh giới package rõ, không circular. Proxy BFF pattern giữ nguyên (auth do backend đảm nhiệm — đúng thiết kế, không thêm mù quáng).

## 6. Khuyến nghị (chưa làm — cần quyết định riêng)

- `shadcn` đang ở `dependencies` của ui nhưng là **CLI** (nên là `devDependency`); đã trung hòa tác hại bằng override zod, nhưng nên chuyển cho đúng bản chất.
- Bổ sung test coverage (round trước 3.6/10) và observability — là hạng mục feature riêng.
