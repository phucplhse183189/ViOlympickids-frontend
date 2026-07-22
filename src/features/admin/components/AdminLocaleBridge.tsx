import { useEffect, useRef, type ReactNode } from "react";
import { useLang } from "@/shared/lib/i18n";

const EN: Record<string, string> = {
  "Tổng quan nhanh": "Quick overview", "Sức khỏe hệ thống": "System health", "Trung tâm điều hành": "Operations center",
  "Mọi chỉ số quan trọng,": "Every important metric,", "trong một góc nhìn.": "in one clear view.",
  "Theo dõi sức khỏe hệ thống, tăng trưởng người dùng và hiệu quả vận hành của ViOlympicKids.": "Monitor system health, user growth, and ViOlympicKids operational performance.",
  "Tổng doanh thu": "Total revenue", "Điểm trung bình": "Average score", "điểm": "points", "Dữ liệu được cập nhật tự động": "Data updates automatically",
  "Phụ huynh": "Parents", "Học sinh": "Students", "Gói FREE": "FREE plan", "Gói PRO": "PRO plan", "Gói VIP": "VIP plan", "Doanh thu": "Revenue",
  "Tài khoản gia đình": "Family accounts", "Hồ sơ đang quản lý": "Managed profiles", "tổng học sinh": "of students", "Doanh thu tích lũy": "Cumulative revenue",
  "Điều hướng": "Navigation", "Thao tác nhanh": "Quick actions", "Phân bổ": "Distribution", "Cơ cấu gói học sinh": "Student plan distribution",
  "Tỷ lệ chuyển đổi trả phí": "Paid conversion rate", "Học sinh đang sử dụng PRO hoặc VIP": "Students using PRO or VIP", "hồ sơ": "profiles",
  "Tổng lượt": "Total visits", "Sức khỏe lưu lượng": "Traffic health", "Biết người dùng đến từ đâu.": "Know where users come from.",
  "Hiểu họ quan tâm điều gì.": "Understand what interests them.", "Lượt truy cập": "Traffic analytics", "Làm mới": "Refresh",
  "Phân tích hành vi truy cập công khai theo thời gian thực, không bao gồm lưu lượng khu vực quản trị.": "Analyze public traffic behavior in real time, excluding admin traffic.",
  "Chưa có dữ liệu để hiển thị.": "No data to display.", "Chưa ghi nhận lượt truy cập công khai trong khoảng thời gian này.": "No public visits recorded in this period.",
  "Đã gộp các đường dẫn cùng nền tảng": "Similar platform paths have been grouped", "Không thể tải dữ liệu truy cập. Vui lòng thử lại.": "Unable to load traffic data. Please try again.",
  "Sức khỏe học tập": "Learning health", "Nhìn thấy tiến bộ.": "See progress.", "Phát hiện sớm rủi ro.": "Spot risks early.",
  "Một góc nhìn thống nhất về mức độ tham gia, khối lượng học và sức khỏe học tập của toàn hệ thống.": "A unified view of engagement, learning volume, and learning health across the system.",
  "Bài đã học": "Lessons completed", "Cần hành động": "Action needed", "Học sinh cần chú ý": "Students needing attention", "Mức ưu tiên": "Priority", "Tình trạng": "Status",
  "Chưa có dữ liệu học tập để hiển thị.": "No learning data to display.", "Ưu tiên học sinh chưa phát sinh hoạt động": "Prioritize students with no activity",
  "Sức khỏe doanh thu": "Revenue health", "Dòng tiền rõ ràng.": "Clear cash flow.", "Quyết định tự tin hơn.": "Make decisions with confidence.",
  "Tổng hợp doanh thu, gói thuê bao và giao dịch PayOS trực tiếp từ dữ liệu vận hành.": "Revenue, subscriptions, and PayOS transactions summarized directly from operational data.",
  "Chỉ số chủ đạo": "Key metrics", "Đơn hàng gần đây": "Recent orders", "Khách hàng": "Customer", "Gói": "Plan", "Số tiền": "Amount", "Thời gian": "Time", "Trạng thái": "Status", "Tổng cộng": "Total",
  "Chưa có đơn hàng PayOS.": "No PayOS orders yet.", "Chưa có dữ liệu doanh thu.": "No revenue data yet.", "Chưa thể tải báo cáo tài chính": "Unable to load financial report",
  "Kết nối tới máy chủ có thể đang gián đoạn. Dữ liệu của bạn không bị ảnh hưởng.": "The server connection may be interrupted. Your data is unaffected.",
  "Phụ huynh & học sinh": "Parents & students", "Email": "Email", "Số điện thoại": "Phone number", "Ngày đăng ký": "Registration date", "Thao tác": "Actions",
  "Không tìm thấy tài khoản": "No accounts found", "Thông tin hồ sơ": "Profile information", "Học sinh trực thuộc": "Linked students", "Phụ huynh quản lý": "Managing parent",
  "Không tìm thấy hồ sơ": "Profile not found", "Quay lại danh sách": "Back to list",
  "Bài học": "Lessons", "Chủ đề": "Topic", "Loại nội dung": "Content type", "Chỉnh sửa": "Edit", "Chỉnh sửa bài học": "Edit lesson", "Đã hoàn thành": "Completed", "Chưa hoàn thiện": "Incomplete",
  "Không tìm thấy bài học phù hợp.": "No matching lessons found.", "Hủy": "Cancel", "Lưu": "Save", "Tìm kiếm": "Search",
  "Lượt thi": "Attempts", "Kết quả": "Result", "Không tìm thấy lượt thi phù hợp.": "No matching attempts found.", "Chưa thể tải bảng xếp hạng": "Unable to load leaderboard",
  "Không tìm thấy góp ý phù hợp.": "No matching feedback found.", "Hôm nay": "Today", "Xóa": "Clear",
  "Đang kết nối máy chủ": "Connecting to server", "Hiển thị": "Showing", "Tự động": "Auto", "BẬT": "ON", "TẮT": "OFF",
  "Tất cả": "All", "Đang hoạt động": "Active", "Không hoạt động": "Inactive", "Bản nháp": "Draft", "Xuất bản": "Published",
  "Hiệu suất học tập": "Learning performance", "Điểm số, hoạt động và các học sinh cần chú ý.": "Scores, activity, and students requiring attention.",
  "Tài chính & Owner": "Finance & Owner", "MRR, ARR, CAC, LTV và dòng tiền vận hành.": "MRR, ARR, CAC, LTV, and operating cash flow.",
  "Quản lý người dùng": "User management", "Tra cứu và quản lý cụm phụ huynh, học sinh.": "Search and manage parent and student groups.",
  "Theo dõi nguồn, thiết bị và hành vi truy cập.": "Track traffic sources, devices, and visitor behavior.",
  "BÀI ĐÃ HOÀN THÀNH": "LESSONS COMPLETED", "TỶ LỆ THAM GIA": "ENGAGEMENT RATE", "Trung bình toàn hệ thống": "System-wide average",
  "đã bắt đầu học": "have started learning", "học sinh chưa học": "students have not studied",
  "Status tài khoản": "Account status", "So sánh phụ huynh và học sinh": "Compare parents and students", "Gia đình nổi bật": "Top families",
  "Số profiles học sinh theo gia đình": "Student profiles by family", "Điểm số & khối lượng học": "Scores & learning volume",
  "Mỗi points dữ liệu đại diện cho một học sinh": "Each data point represents one student", "Hoạt động": "Active", "Bị khóa": "Locked",
  "STUDENTS TRẢ PHÍ": "PAID STUDENTS", "TỶ LỆ THÀNH CÔNG": "SUCCESS RATE", "giao dịch thành công": "successful transactions",
  "ARR dự phóng": "Projected ARR", "PRO và VIP đang hoạt động": "PRO and VIP are active", "thất bại": "failed", "tổng": "total",
  "Revenue theo tháng": "Monthly revenue", "Xu hướng 12 tháng gần nhất": "Trend over the last 12 months", "Revenue theo gói": "Revenue by plan",
  "Tỷ trọng PRO và VIP": "PRO and VIP share", "Status đơn PayOS": "PayOS order status",
  "Tổng quan hiệu quả xử lý thanh toán": "Overview of payment processing performance", "Số ngày được tính riêng theo ngày thanh toán của từng đơn": "Days are calculated from each order's payment date",
  "LƯỢT XEM TRANG": "PAGE VIEWS", "KHÁCH DUY NHẤT": "UNIQUE VISITORS", "PHIÊN TRUY CẬP": "SESSIONS", "LƯỢT XEM HÔM NAY": "VIEWS TODAY",
  "lượt hôm nay": "views today", "trang / khách": "pages / visitor", "Trong 30 ngày": "In the last 30 days", "Tính từ 00:00": "Since 00:00",
  "Lưu lượng theo ngày": "Daily traffic", "Lượt xem và khách duy nhất": "Page views and unique visitors", "Thiết bị": "Devices",
  "Distribution lượt xem theo nền tảng": "View distribution by platform", "Lượt xem": "Page views", "Khách duy nhất": "Unique visitors",
  "Máy tính": "Desktop", "Điện thoại": "Mobile", "Trang được quan tâm nhất": "Most viewed pages", "Tên trang dễ đọc, kèm đường dẫn để đối chiếu": "Readable page names with paths for reference",
  "Nguồn truy cập": "Traffic sources", "Các kênh đưa người dùng đến website": "Channels bringing users to the website", "Trang chủ": "Home",
  "USER DIRECTORY": "USER DIRECTORY", "Một danh sách thống nhất. Mở phụ huynh để quản lý các profiles học sinh trực thuộc.": "One unified directory. Open a parent to manage their linked student profiles.",
  "Tên, email, số điện thoại, học sinh...": "Name, email, phone number, student...", "All trạng thái": "All statuses", "All gói": "All plans",
  "Đăng ký từ ngày": "Registered from", "Chưa có": "Not provided", "Chưa có email": "No email", "Xem": "View", "Khóa": "Lock",
  "Thư viện bài học có tổ chức": "An organized lesson library", "Tra cứu và cập nhật nội dung học tập theo chủ đề, gói truy cập và trạng thái phát hành.": "Search and update learning content by topic, access plan, and publication status.",
  "TỔNG BÀI HỌC": "LESSONS", "CHỦ ĐỀ": "TOPICS", "Tên bài học, chủ đề hoặc loại game...": "Lesson name, topic, or game type...",
  "All chủ đề": "All topics", "Chưa phân loại": "Uncategorized",
  "Lắng nghe để cải thiện": "Listen to improve", "Search, phân loại và xử lý phản hồi của phụ huynh of một quy trình thống nhất.": "Search, categorize, and process parent feedback in one unified workflow.",
  "TỔNG GÓP Ý": "TOTAL FEEDBACK", "CHỜ DUYỆT": "PENDING", "Tên, số điện thoại hoặc nội dung...": "Name, phone number, or content...",
  "All thể loại": "All categories", "All sao": "All ratings", "Gửi từ ngày": "Submitted from", "Công khai": "Public", "Khác": "Other",
  "Chờ duyệt": "Pending", "Đã xử lý": "Resolved", "Đã ẩn": "Hidden", "Chưa có SĐT": "No phone number",
  "Lịch sử thi minh bạch": "Transparent attempt history", "Tra cứu results, phát hiện lượt thi không hợp lệ và đồng bộ bảng xếp hạng an toàn.": "Review results, detect invalid attempts, and safely synchronize the leaderboard.",
  "ĐIỂM TB": "AVG SCORE", "Students hoặc bài học...": "Student or lesson...", "All results": "All results", "Thi từ ngày": "Attempted from",
  "TỔNG LƯỢT THI": "ATTEMPTS", "KẾT QUẢ": "RESULT", "Refresh": "Refresh",
  "Bài đã hoàn thành": "Lessons completed", "Tỷ lệ tham gia": "Engagement rate", "Tổng khối lượng học tập": "Total learning volume",
  "Trạng thái tài khoản": "Account status", "Mỗi điểm dữ liệu đại diện cho một học sinh": "Each data point represents one student",
  "Học sinh trả phí": "Paid students", "Tỷ lệ thành công": "Success rate", "Doanh thu theo tháng": "Monthly revenue", "Doanh thu theo gói": "Revenue by plan",
  "Trạng thái đơn PayOS": "PayOS order status", "Giao dịch gần đây": "Recent transactions", "Các khoản thu đã ghi nhận": "Recorded payments",
  "Lượt xem trang": "Page views", "Phiên truy cập": "Sessions", "Lượt xem hôm nay": "Views today",
  "Phân bổ lượt xem theo nền tảng": "View distribution by platform", "Khách": "Visitors", "Máy tính bảng": "Tablet",
  "Tất cả trạng thái": "All statuses", "Tất cả gói": "All plans", "Tất cả chủ đề": "All topics", "Tất cả thể loại": "All categories", "Tất cả sao": "All ratings",
  "Tổng góp ý": "Total feedback", "Tìm kiếm, phân loại và xử lý phản hồi của phụ huynh trong một quy trình thống nhất.": "Search, categorize, and process parent feedback in one unified workflow.",
  "Điểm TB": "Average score", "Học sinh hoặc bài học...": "Student or lesson...", "Học sinh hoặc bài học…": "Student or lesson...",
  "Tất cả kết quả": "All results", "Mức điểm": "Score range", "Tốt · từ 80%": "Good · 80%+", "Đạt · 50–79%": "Pass · 50–79%", "Cần chú ý · dưới 50%": "Needs attention · below 50%",
  "Tên, email, số điện thoại, học sinh…": "Name, email, phone number, student...", "Tên bài học, chủ đề hoặc loại game…": "Lesson name, topic, or game type...",
  "Tên, số điện thoại hoặc nội dung…": "Name, phone number, or content...", "Thể loại": "Category", "Số sao": "Rating", "Đóng": "Close",
  "Tên bài học": "Lesson name", "Mô tả": "Description", "Gói yêu cầu": "Required plan", "Emoji": "Emoji", "Lưu thay đổi": "Save changes", "Đang lưu…": "Saving...", "Đang xóa…": "Deleting...",
  "Đã thanh toán": "Paid", "Đang chờ": "Pending", "Đã hủy": "Cancelled",
};

const originals = new WeakMap<Node, string>();
const attrOriginals = new WeakMap<Element, Map<string, string>>();
const attributes = ["placeholder", "title", "aria-label"];

function english(value: string) {
  const exact = EN[value.trim()];
  if (exact) return value.replace(value.trim(), exact);
  let result = value;
  for (const [vi, en] of Object.entries(EN).sort((a, b) => b[0].length - a[0].length)) result = result.replaceAll(vi, en);
  return result
    .replace(/(\d+) bài(?=\s*$)/, "$1 lessons")
    .replace(/(\d+) lượt(?=\s*[·•]|\s*$)/, "$1 transactions")
    .replace(/Hiển thị\s+(\d+[–-]\d+)\s+trong\s+(\d+)\s+kết quả/, "Showing $1 of $2 results");
}

function localize(root: HTMLElement, lang: "vi" | "en") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const value = originals.get(node) ?? node.nodeValue ?? "";
    if (!originals.has(node)) originals.set(node, value);
    node.nodeValue = lang === "en" ? english(value) : value;
  }
  for (const element of root.querySelectorAll("[placeholder],[title],[aria-label]")) {
    let saved = attrOriginals.get(element);
    if (!saved) { saved = new Map(); attrOriginals.set(element, saved); }
    for (const attr of attributes) {
      const current = element.getAttribute(attr);
      if (current == null) continue;
      if (!saved.has(attr)) saved.set(attr, current);
      const value = saved.get(attr)!;
      element.setAttribute(attr, lang === "en" ? english(value) : value);
    }
  }
}

export function AdminLocaleBridge({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    localize(root, lang);
    const observer = new MutationObserver(() => localize(root, lang));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [lang]);
  return <div ref={ref} className="contents">{children}</div>;
}
