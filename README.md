# 🌟 ViOlympicKids — Frontend

Nền tảng học Toán 3D tương tác dành cho trẻ em, xây dựng bằng **React 19 + TypeScript + Vite**.

---

## ✨ Tính năng chính

| Khu vực | Mô tả |
|---|---|
| 🏠 Landing Page | Hero section, tính năng nổi bật, bảng giá, CTA, thống kê, how-it-works |
| 👨‍👩‍👧 Parent Dashboard | Overview, biểu đồ tiến độ học tập, lịch sử bài tập, quản lý gói cước |
| 🧒 Student Portal | Bản đồ phiêu lưu, không gian Toán 3D tương tác, modal phần thưởng |
| 🔐 Auth | Đăng nhập / Đăng ký, hỗ trợ đa tài khoản (học sinh, phụ huynh) |
| 🌐 i18n | Hỗ trợ Tiếng Việt và Tiếng Anh |

## 🛠️ Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 6 | Build tool / Dev server |
| Tailwind CSS | 4 | Styling |
| react-router-dom | 7 | Routing |
| Recharts | 3 | Biểu đồ (Dashboard) |
| lucide-react | 0.575 | Icons |
| radix-ui | 1.4 | Headless UI primitives |

---

## 🚀 Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## 🗂️ Cấu trúc thư mục (Feature-Sliced Design)

```
src/
├── app/              # Providers, Router, App root
├── pages/            # Trang theo route
│   ├── home/         # Landing page
│   ├── login/
│   ├── register/
│   ├── dashboard/    # Parent dashboard (Overview, Progress, History, Subscription)
│   └── student/      # Student portal (LearningMap, InteractiveMathSpace, RewardModal)
├── widgets/          # UI blocks lớn, tái sử dụng
│   ├── header/
│   ├── footer/
│   ├── hero-section/
│   ├── about-section/
│   ├── courses-section/
│   ├── stats-section/
│   ├── how-it-works/
│   ├── cta-section/
│   ├── dashboard-layout/
│   ├── kids-topbar/
│   ├── student-layout/
│   ├── study-progress-chart/
│   └── recent-activity-table/
├── features/         # Business logic theo tính năng
│   └── auth/         # Login, Register forms + hooks
├── shared/
│   ├── lib/          # auth.tsx, i18n.tsx, utils.ts, useInView.ts
│   └── ui/           # Button, SettingsDropdown
└── assets/
```

---

## 🔑 Tài khoản Demo

| Vai trò | Email | Mật khẩu | Trang |
|---|---|---|---|
| Học sinh (demo) | `demo@violympickids.com` | `demo123` | `/` |
| Phụ huynh | `parent@violympickids.com` | `parent123` | `/dashboard` |
| Học sinh (portal) | `student@violympickids.com` | `student123` | `/student` |

> Click nút gợi ý trong trang đăng nhập để tự điền nhanh.

---

## 🌐 Routes

| Path | Trang |
|---|---|
| `/` | Landing Page |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/dashboard` | Parent Dashboard — Overview |
| `/dashboard/progress` | Tiến độ học tập |
| `/dashboard/history` | Lịch sử bài tập |
| `/dashboard/subscription` | Quản lý gói cước |
| `/student` | Student Portal — Bản đồ phiêu lưu |
| `/student/lesson` | Không gian Toán 3D tương tác |

---

## 🌏 Đa ngôn ngữ (i18n)

Toàn bộ nội dung UI được quản lý trong `src/shared/lib/i18n.tsx`.  
Hỗ trợ **Tiếng Việt** (`vi`) và **Tiếng Anh** (`en`).  
Chuyển ngôn ngữ thông qua `SettingsDropdown` ở Header.

---

## 📋 Nhánh Git

| Nhánh | Mục đích |
|---|---|
| `master` | Production stable |
| `dev` | Integration branch |
| `feat/landing-page` | Landing page + Dashboard + Student Portal |
| `feature/auth-login-register` | Auth flows |
