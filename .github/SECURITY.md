# Security Policy

## Supported Versions

Dự án đang trong giai đoạn phát triển. Chỉ nhánh `main` được nhận vá bảo mật.

| Version | Supported |
| ------- | --------- |
| main    | ✅        |

## Reporting a Vulnerability

**Không** mở public issue cho lỗ hổng bảo mật.

Vui lòng báo cáo qua **GitHub Private Vulnerability Reporting**:
`Security` tab → `Report a vulnerability`.

Cam kết phản hồi trong vòng 48 giờ và cập nhật tiến độ mỗi 5 ngày làm việc.

## Automated Security Tooling

Repo được bảo vệ bởi các lớp tự động sau:

| Lớp                    | Công cụ     | Cấu hình                                          |
| ---------------------- | ----------- | ------------------------------------------------- |
| Dependency alerts      | Dependabot  | `.github/dependabot.yml` (security-only)          |
| Dependency updates     | Renovate    | `renovate.json`                                   |
| Static analysis (SAST) | CodeQL      | `.github/workflows/codeql.yml`                    |
| Secret scanning        | Gitleaks    | `.github/workflows/gitleaks.yml`                  |
| Audit gate             | osv-scanner | `.github/workflows/ci.yml` (job `security-audit`) |

## Kích hoạt (yêu cầu quyền admin repo)

Các mục sau phải bật thủ công trong `Settings → Code security`:

- [ ] **Dependabot alerts** — bật để nhận cảnh báo CVE.
- [ ] **Dependabot security updates** — bật để Dependabot tự mở PR vá.
- [ ] **CodeQL / Code scanning** — workflow đã có, chỉ cần bật "Default setup off / Advanced" trỏ tới workflow.
- [ ] **Secret scanning + Push protection** — bật để chặn commit chứa secret ngay từ lúc push.
- [ ] **Renovate App** — cài đặt tại https://github.com/apps/renovate và cấp quyền cho repo; cấu hình đã sẵn trong `renovate.json`.
