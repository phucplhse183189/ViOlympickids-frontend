import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "vi" | "en";

export const translations = {
  vi: {
    announcement:
      "🎉\u00a0 Học thử miễn phí 7 ngày — Không cần thẻ tín dụng!\u00a0",
    registerNow: "Đăng ký ngay",
    nav: {
      about: "Giới Thiệu",
      courses: "Khóa Học",
      reviews: "Phụ Huynh Nói Gì",
      contact: "Liên Hệ",
    },
    login: "Đăng Nhập",
    register: "Đăng Ký",
    settings: { title: "Cài đặt", language: "Ngôn ngữ" },
    hero: {
      badge: "🌟 Nền tảng học Toán 3D hàng đầu",
      titleLine1: "Học Toán Lớp 2",
      titleLine2: "Không Còn Nhàm Chán",
      titleAccent: "Với 3D & AI",
      subtitle:
        "Giúp con hiểu sâu bản chất Toán học, tự giác học tập mỗi ngày mà ba mẹ không cần ngồi kèm. Chi phí chỉ bằng một cốc trà sữa!",
      ctaPrimary: "Bắt đầu học thử 7 ngày",
      ctaSecondary: "Xem Video Demo",
      videoPlaceholder:
        "[Khu vực chèn Video hoặc Animation 3D mô phỏng bé đang tương tác với khối Rubik]",
    },
    about: {
      title: "Ba mẹ bận rộn? Con học vẹt nhớ tạm?",
      titleAccent: "ViOlympicKids giải quyết trọn vẹn!",
      items: [
        {
          icon: "📦",
          title: "Học Trực Quan 3D",
          desc: "Tạm biệt sách giáo khoa 2D tĩnh. Bé được xoay, ghép, tương tác với các khối hình không gian ngay trên màn hình.",
        },
        {
          icon: "🤖",
          title: "AI Hướng Dẫn Giọng Nói",
          desc: "Trợ lý ảo AI đóng vai giáo viên đọc đề, nhắc nhở và cổ vũ bé, giải quyết rào cản bé chưa đọc thạo chữ.",
        },
        {
          icon: "📊",
          title: "Báo Cáo Cho Ba Mẹ",
          desc: "Báo cáo chi tiết gửi về điện thoại mỗi ngày. Ba mẹ nắm rõ điểm mạnh, điểm yếu của con dù đi làm bận rộn.",
        },
      ],
    },
    courses: {
      title: "Chọn gói phù hợp",
      titleAccent: "cho con yêu của bạn",
      plans: [
        {
          name: "FREE",
          subtitle: "Miễn phí",
          price: "0đ",
          period: "",
          pricing: [],
          badge: "",
          features: [
            { text: "Bài học 3D (giới hạn)", included: true },
            { text: "Luyện tập cơ bản", included: true },
            { text: "Có hiển thị quảng cáo", included: false },
            { text: "Không có báo cáo tiến độ", included: false },
            { text: "Không hỗ trợ cá nhân hóa", included: false },
          ],
          ctaBtn: "Bắt đầu miễn phí",
          highlight: false,
        },
        {
          name: "PRO",
          subtitle: "Gói trọng tâm",
          price: "55.000đ",
          period: "/tháng",
          pricing: ["149.000đ / 3 tháng", "399.000đ / năm"],
          badge: "Được phụ huynh chọn nhiều nhất",
          features: [
            { text: "Full Bài học 3D", included: true },
            { text: "Luyện tập tiêu chuẩn", included: true },
            { text: "Báo cáo tiến độ cơ bản", included: true },
            { text: "Cam kết báo cáo tiến độ hàng tuần", included: true },
            { text: "Hỗ trợ tiêu chuẩn", included: true },
            { text: "Không quảng cáo", included: true },
          ],
          ctaBtn: "Đăng ký ngay",
          highlight: true,
        },
        {
          name: "VIP",
          subtitle: "Gói cao cấp",
          price: "89.000đ",
          period: "/tháng",
          pricing: ["249.000đ / 3 tháng", "699.000đ / năm"],
          badge: "",
          features: [
            { text: "Bài học 3D nâng cao", included: true },
            { text: "Luyện tập cấp thi đấu", included: true },
            { text: "Báo cáo tiến độ chi tiết", included: true },
            { text: "Cam kết báo cáo tiến độ hàng tuần", included: true },
            { text: "Hỗ trợ ưu tiên", included: true },
            { text: "Không quảng cáo", included: true },
          ],
          ctaBtn: "Đăng ký VIP",
          highlight: false,
        },
      ],
    },
    stats: {
      items: [
        { value: "5.000+", label: "Phụ Huynh Tin Dùng" },
        { value: "200+", label: "Bài Học 3D" },
        { value: "55.000đ", label: "Chỉ Từ / Tháng" },
        { value: "4.9/5", label: "Đánh Giá Phụ Huynh" },
      ],
    },
    howItWorks: {
      title: "Bắt Đầu Trong 3 Bước Đơn Giản",
      steps: [
        {
          title: "Đăng Ký Miễn Phí",
          description:
            "Tạo tài khoản chỉ trong 1 phút, không cần thẻ tín dụng.",
        },
        {
          title: "Chọn Bài Học 3D",
          description:
            "Bé chọn bài học 3D phù hợp với lớp và chủ đề yêu thích.",
        },
        {
          title: "Học & Tiến Bộ",
          description:
            "AI theo dõi và điều chỉnh lộ trình học, báo cáo gửi về ba mẹ mỗi ngày.",
        },
      ],
    },
    cta: {
      title: "Sẵn sàng giúp con yêu Toán học?",
      subtitle: "Tham gia cùng các phụ huynh khác ngay hôm nay",
      emailPlaceholder: "Nhập email/số điện thoại của bạn",
      button: "Nhận ưu đãi",
      footnote: "Miễn phí 7 ngày • Không cần thẻ tín dụng",
    },
    footer: {
      brandDesc:
        "Nền tảng toán học tương tác hàng đầu dành cho trẻ em. Xây dựng logic, sự tự tin và niềm vui trong từng con số.",
      companyTitle: "Công Ty",
      companyLinks: {
        about: "Giới Thiệu",
        careers: "Tuyển Dụng",
        privacy: "Chính Sách Bảo Mật",
      },
      contactTitle: "Kết Nối",
      copyright:
        "© 2026 ViOlympicKids. Được thiết kế với ❤️ cho trẻ em Việt Nam.",
    },
    loginPage: {
      tagline: "Nơi học toán thật vui vẻ!",
      speechBubble: "Học thôi nào! 🎉",
      welcomeBack: "Chào mừng trở lại! 👋",
      noAccount: "Chưa có tài khoản?",
      signupNow: "Đăng ký ngay",
      orContinueWith: "hoặc tiếp tục với",
      googleLogin: "Đăng nhập bằng Google",
      privacyPolicy: "Chính sách bảo mật",
      termsOfUse: "Điều khoản sử dụng",
    },
    registerPage: {
      tagline: "Nơi học toán thật vui vẻ!",
      speechBubble: "Tham gia cùng bạn bè! 🎉",
      createAccount: "Tạo tài khoản 🚀",
      hasAccount: "Đã có tài khoản?",
      loginNow: "Đăng nhập ngay",
      privacyPolicy: "Chính sách bảo mật",
      termsOfUse: "Điều khoản sử dụng",
      pills: [
        { icon: "🧮", label: "Toán học" },
        { icon: "🎯", label: "Thử thách" },
        { icon: "🏅", label: "Phần thưởng" },
        { icon: "📈", label: "Tiến độ" },
        { icon: "🏆", label: "Bảng xếp hạng" },
        { icon: "⚡", label: "Thi trực tiếp" },
      ],
    },
    loginForm: {
      phoneLabel: "Số điện thoại",
      phonePlaceholder: "Nhập số điện thoại của bạn",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      forgotPassword: "Quên mật khẩu?",
      submit: "Bắt đầu hành trình toán học",
      submitting: "Đang đăng nhập...",
      errors: {
        emailRequired: "Email không được để trống",
        emailInvalid: "Email không hợp lệ",
        passwordRequired: "Mật khẩu không được để trống",
        passwordMinLength: "Mật khẩu phải có ít nhất 6 ký tự",
      },
    },
    registerForm: {
      nicknameLabel: "Biệt danh của bạn",
      nicknamePlaceholder: "Ví dụ: SieuAnhToanHoc",
      emailLabel: "Tên đăng nhập hoặc Email phụ huynh",
      emailPlaceholder: "ten@example.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Xác nhận mật khẩu",
      confirmPasswordPlaceholder: "••••••••",
      agreeText: "Tôi đồng ý với",
      termsText: "Điều khoản",
      andText: "và",
      privacyText: "Chính sách bảo mật",
      submit: "Bắt đầu thôi nào! 🎉",
      submitting: "Đang tạo tài khoản...",
      errors: {
        nicknameRequired: "Biệt danh không được để trống",
        emailRequired: "Email không được để trống",
        emailInvalid: "Email không hợp lệ",
        passwordRequired: "Mật khẩu không được để trống",
        passwordMinLength: "Mật khẩu phải có ít nhất 6 ký tự",
        confirmPasswordRequired: "Vui lòng xác nhận mật khẩu",
        confirmPasswordMismatch: "Mật khẩu không khớp",
      },
    },
    feedback: {
      title: "Phụ Huynh Nói Gì?",
      writeReview: "Viết đánh giá",
      loginToReview: "Đăng nhập để đánh giá",
      submitting: "Đang gửi...",
      submit: "Gửi đánh giá",
      contentPlaceholder: "Chia sẻ trải nghiệm của bạn về ViOlympicKids...",
      replyPlaceholder: "Viết bình luận...",
      reply: "Trả lời",
      viewMoreReplies: "Xem thêm bình luận",
      hideReplies: "Thu gọn",
      errors: {
        contentRequired: "Vui lòng nhập nội dung đánh giá",
        ratingRequired: "Vui lòng chọn số sao",
        generic: "Có lỗi xảy ra, vui lòng thử lại sau"
      }
    },
  },

  en: {
    announcement:
      "🎉\u00a0 Try free for 7 days — No credit card required!\u00a0",
    registerNow: "Sign up now",
    nav: {
      about: "About Us",
      courses: "Courses",
      reviews: "Parent Reviews",
      contact: "Contact",
    },
    login: "Log In",
    register: "Sign Up Free",
    settings: { title: "Settings", language: "Language" },
    hero: {
      badge: "🌟 #1 3D Math Learning Platform",
      titleLine1: "Grade 2 Math",
      titleLine2: "No More Boring",
      titleAccent: "With 3D & AI",
      subtitle:
        "Help children deeply understand Math and study independently every day — without parents sitting beside them. All for the price of a bubble tea!",
      ctaPrimary: "Start 7-Day Free Trial",
      ctaSecondary: "Watch Video Demo",
      videoPlaceholder:
        "[Video or 3D Animation Area — Child Interacting with a Rubik's Cube]",
    },
    about: {
      title: "Busy parents? Rote learning with no retention?",
      titleAccent: "ViOlympicKids solves it all!",
      items: [
        {
          icon: "📦",
          title: "3D Visual Learning",
          desc: "Say goodbye to static 2D textbooks. Children rotate, assemble and interact with spatial shapes right on screen.",
        },
        {
          icon: "🤖",
          title: "AI Voice Guidance",
          desc: "A virtual AI tutor reads questions aloud, reminds and cheers the child on — removing the barrier of not being able to read yet.",
        },
        {
          icon: "📊",
          title: "Parent Progress Reports",
          desc: "Detailed reports sent to your phone every day. Know your child's strengths and weaknesses even on the busiest workday.",
        },
      ],
    },
    courses: {
      title: "Smart Investment",
      titleAccent: "for Your Child's Future",
      traditional: {
        title: "Private Tutor / Offline Classes",
        price: "$40 – $90 / month",
        cons: [
          "Time-consuming commutes",
          "Hard to monitor quality per session",
          "Passive learning style",
        ],
      },
      pro: {
        badge: "Most chosen by parents",
        title: "ViOlympicKids Pro",
        price: "$2.50 / month",
        pros: [
          "Safe learning at home",
          "Interactive 3D visuals",
          "Detailed progress reports",
          "Extremely affordable",
        ],
        ctaBtn: "Start Free Trial Now",
      },
    },
    stats: {
      items: [
        { value: "5,000+", label: "Trusting Parents" },
        { value: "200+", label: "3D Lessons" },
        { value: "$2.50", label: "From / Month" },
        { value: "4.9/5", label: "Parent Rating" },
      ],
    },
    howItWorks: {
      title: "Get Started in 3 Simple Steps",
      steps: [
        {
          title: "Sign Up Free",
          description:
            "Create an account in 1 minute — no credit card required.",
        },
        {
          title: "Pick a 3D Lesson",
          description:
            "Choose a lesson that matches your child's grade and favourite topic.",
        },
        {
          title: "Learn & Progress",
          description:
            "AI tracks and adjusts the learning path, sending daily reports to parents.",
        },
      ],
    },
    cta: {
      title: "Ready to help your child love Math?",
      subtitle: "Join 5,000+ parents today",
      emailPlaceholder: "Enter your email",
      button: "Claim Offer",
      footnote: "7 days free • No credit card required",
    },
    footer: {
      brandDesc:
        "The leading interactive math platform for children. Building logic, confidence and joy with every number.",
      companyTitle: "Company",
      companyLinks: {
        about: "About Us",
        careers: "Careers",
        privacy: "Privacy Policy",
      },
      contactTitle: "Connect",
      copyright: "© 2026 ViOlympicKids. Designed with ❤️ for children.",
    },
    loginPage: {
      tagline: "Where math learning is truly fun!",
      speechBubble: "Let's learn! 🎉",
      welcomeBack: "Welcome back! 👋",
      noAccount: "Don't have an account?",
      signupNow: "Sign up now",
      teacherLogin: "Log in as Teacher / Parent",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      pills: [
        { icon: "🧮", label: "Math" },
        { icon: "🎯", label: "Challenges" },
        { icon: "🏅", label: "Rewards" },
        { icon: "📈", label: "Progress" },
        { icon: "🏆", label: "Leaderboard" },
        { icon: "⚡", label: "Live Contests" },
      ],
    },
    registerPage: {
      tagline: "Where math learning is truly fun!",
      speechBubble: "Join your friends! 🎉",
      createAccount: "Create Account 🚀",
      hasAccount: "Already have an account?",
      loginNow: "Log in now",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      pills: [
        { icon: "🧮", label: "Math" },
        { icon: "🎯", label: "Challenges" },
        { icon: "🏅", label: "Rewards" },
        { icon: "📈", label: "Progress" },
        { icon: "🏆", label: "Leaderboard" },
        { icon: "⚡", label: "Live Contests" },
      ],
    },
    loginForm: {
      phoneLabel: "Phone number",
      phonePlaceholder: "Enter your phone number",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      submit: "Start the Math Journey",
      submitting: "Logging in...",
      errors: {
        emailRequired: "Email is required",
        emailInvalid: "Invalid email address",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
      },
    },
    registerForm: {
      nicknameLabel: "Your Nickname",
      nicknamePlaceholder: "E.g. MathSuperHero",
      emailLabel: "Username or Parent Email",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "••••••••",
      agreeText: "I agree to the",
      termsText: "Terms",
      andText: "and",
      privacyText: "Privacy Policy",
      submit: "Let's Go! 🎉",
      submitting: "Creating account...",
      errors: {
        nicknameRequired: "Nickname is required",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email address",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
        confirmPasswordRequired: "Please confirm your password",
        confirmPasswordMismatch: "Passwords do not match",
      },
    },
    feedback: {
      title: "What Parents Say",
      writeReview: "Write a review",
      loginToReview: "Log in to review",
      submitting: "Submitting...",
      submit: "Submit Review",
      contentPlaceholder: "Share your experience with ViOlympicKids...",
      replyPlaceholder: "Write a reply...",
      reply: "Reply",
      viewMoreReplies: "View more replies",
      hideReplies: "Hide replies",
      errors: {
        contentRequired: "Please enter your review content",
        ratingRequired: "Please select a rating",
        generic: "An error occurred, please try again later"
      }
    },
  },
} as const;

export type Translations = typeof translations.vi;

interface LanguageContextValue {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("vi");
  return (
    <LanguageContext.Provider
      value={{ lang, t: translations[lang] as Translations, setLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
