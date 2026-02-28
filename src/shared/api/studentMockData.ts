// ─── Types ────────────────────────────────────────────────────────────────────

export type LessonStatus = "done" | "active" | "locked";

export interface QuizQuestion {
  id: number;
  text: string;
  emoji?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  emoji: string;
  description: string;
  status: LessonStatus;
  xpReward: number;
  duration: number; // minutes
  questions: QuizQuestion[];
  /** position on winding path [left%, top%] */
  pos: [number, number];
}

export interface Chapter {
  id: number;
  title: string;
  emoji: string;
  description: string;
  color: string; // tailwind bg
  accent: string; // tailwind text
  shadow: string; // css shadow
  lessons: Lesson[];
}

// ─── Chapter 1 – Hình học 3D ──────────────────────────────────────────────────

const chapter1Lessons: Lesson[] = [
  {
    id: 101,
    chapterId: 1,
    title: "Khám phá khối Lập phương",
    emoji: "📦",
    description: "Tìm hiểu về khối lập phương: mặt, góc và ứng dụng thực tế.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    questions: [
      {
        id: 1,
        text: "Khối lập phương có bao nhiêu mặt?",
        emoji: "📦",
        options: ["4 mặt", "6 mặt", "8 mặt", "12 mặt"],
        correctIndex: 1,
        hint: "Hãy đếm từng mặt của hộp vuông bé nhé!",
        explanation:
          "Khối lập phương có 6 mặt, mỗi mặt là một hình vuông bằng nhau. 🎉",
      },
      {
        id: 2,
        text: "Mỗi mặt của khối lập phương là hình gì?",
        emoji: "🔷",
        options: ["Hình tròn", "Hình tam giác", "Hình vuông", "Hình chữ nhật"],
        correctIndex: 2,
        hint: "Nhìn vào các mặt của chiếc hộp — chúng đều như nhau!",
        explanation:
          "Mỗi mặt của khối lập phương là hình vuông — đẹp và đều nhau! ✨",
      },
      {
        id: 3,
        text: "Khối lập phương có bao nhiêu đỉnh (góc)?",
        emoji: "🔢",
        options: ["4 đỉnh", "6 đỉnh", "8 đỉnh", "10 đỉnh"],
        correctIndex: 2,
        hint: "Đếm các góc cạnh của hộp vuông nhé!",
        explanation:
          "Khối lập phương có 8 đỉnh — giống như 8 góc của chiếc hộp! 💡",
      },
      {
        id: 4,
        text: "Ví dụ nào dưới đây là khối lập phương?",
        emoji: "🌍",
        options: ["Quả bóng", "Hộp sữa vuông", "Lon nước ngọt", "Quả cam"],
        correctIndex: 1,
        hint: "Tìm vật có 6 mặt bằng nhau là hình vuông!",
        explanation: "Hộp sữa vuông là ví dụ điển hình của khối lập phương! 🥛",
      },
      {
        id: 5,
        text: "Khối lập phương có bao nhiêu cạnh?",
        emoji: "📏",
        options: ["8 cạnh", "10 cạnh", "12 cạnh", "16 cạnh"],
        correctIndex: 2,
        hint: "Đếm tất cả các đường viền của hộp!",
        explanation: "Khối lập phương có 12 cạnh, tất cả đều bằng nhau! 🏆",
      },
    ],
  },
  {
    id: 102,
    chapterId: 1,
    title: "Đếm các mặt của khối cầu",
    emoji: "🔵",
    description: "Khám phá khối cầu tròn và so sánh với các khối khác.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [35, 53],
    questions: [
      {
        id: 1,
        text: "Khối cầu có bao nhiêu mặt phẳng?",
        emoji: "⚽",
        options: ["0 mặt", "1 mặt", "2 mặt", "6 mặt"],
        correctIndex: 0,
        hint: "Cầm quả bóng lên — có mặt phẳng nào không?",
        explanation: "Khối cầu không có mặt phẳng, toàn bộ bề mặt đều cong! 🌟",
      },
      {
        id: 2,
        text: "Khối cầu có thể lăn được không?",
        emoji: "🏀",
        options: [
          "Được, vì bề mặt tròn",
          "Không được",
          "Chỉ lăn sang trái",
          "Chỉ lăn xuống dốc",
        ],
        correctIndex: 0,
        hint: "Hãy nghĩ về quả bóng đá!",
        explanation:
          "Khối cầu lăn được vì bề mặt hoàn toàn cong, không có góc cạnh! ⚽",
      },
      {
        id: 3,
        text: "Ví dụ nào dưới đây là khối cầu?",
        emoji: "🌍",
        options: ["Hộp sữa", "Quả dưa hấu tròn", "Quyển sách", "Chiếc bàn"],
        correctIndex: 1,
        hint: "Tìm vật tròn hoàn toàn!",
        explanation: "Quả dưa hấu tròn là ví dụ của khối cầu! 🍉",
      },
      {
        id: 4,
        text: "Khối cầu có bao nhiêu đỉnh?",
        emoji: "🔢",
        options: ["0 đỉnh", "1 đỉnh", "4 đỉnh", "8 đỉnh"],
        correctIndex: 0,
        hint: "Khối cầu tròn, có góc không?",
        explanation: "Khối cầu không có đỉnh vì bề mặt hoàn toàn cong! 💫",
      },
      {
        id: 5,
        text: "So với khối lập phương, khối cầu có gì khác?",
        emoji: "🤔",
        options: [
          "Khối cầu có mặt phẳng",
          "Khối cầu không có mặt phẳng và đỉnh",
          "Khối cầu có nhiều cạnh hơn",
          "Chúng giống nhau hoàn toàn",
        ],
        correctIndex: 1,
        hint: "Nhớ lại: khối lập phương có 6 mặt phẳng!",
        explanation:
          "Khối cầu không có mặt phẳng và đỉnh, khác hoàn toàn với khối lập phương! 🎯",
      },
    ],
  },
  {
    id: 103,
    chapterId: 1,
    title: "Tìm hiểu hình trụ",
    emoji: "🥤",
    description: "Hình trụ trong cuộc sống hàng ngày và các đặc điểm nổi bật.",
    status: "active",
    xpReward: 15,
    duration: 6,
    pos: [60, 35],
    questions: [
      {
        id: 1,
        text: "Hình trụ có bao nhiêu mặt?",
        emoji: "🥤",
        options: ["1 mặt", "2 mặt", "3 mặt", "4 mặt"],
        correctIndex: 2,
        hint: "Nhìn vào lon nước ngọt: trên, dưới và xung quanh!",
        explanation:
          "Hình trụ có 3 mặt: 2 mặt tròn (trên và dưới) + 1 mặt cong xung quanh! 🥤",
      },
      {
        id: 2,
        text: "Hai mặt phẳng của hình trụ có hình gì?",
        emoji: "⭕",
        options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"],
        correctIndex: 1,
        hint: "Nhìn từ trên xuống lon nước ngọt!",
        explanation:
          "Hai mặt phẳng của hình trụ là hai hình tròn bằng nhau! ⭕",
      },
      {
        id: 3,
        text: "Hình trụ có thể lăn được không?",
        emoji: "🏗️",
        options: [
          "Không lăn được",
          "Lăn sang bên được",
          "Chỉ lăn thẳng đứng",
          "Lăn về mọi hướng",
        ],
        correctIndex: 1,
        hint: "Đặt lon nước ngọt nằm ngang và đẩy nhẹ!",
        explanation: "Hình trụ lăn được sang hai bên vì mặt cong bên ngoài! 🎡",
      },
      {
        id: 4,
        text: "Vật nào sau đây có dạng hình trụ?",
        emoji: "🌍",
        options: ["Quả bóng", "Hộp bánh vuông", "Lon nước ngọt", "Quyển vở"],
        correctIndex: 2,
        hint: "Tìm vật có 2 đáy tròn và thân hình ống!",
        explanation: "Lon nước ngọt có dạng hình trụ! 🥤",
      },
      {
        id: 5,
        text: "Hình trụ có bao nhiêu đỉnh?",
        emoji: "🔢",
        options: ["0 đỉnh", "2 đỉnh", "4 đỉnh", "8 đỉnh"],
        correctIndex: 0,
        hint: "Nhìn lon nước ngọt — có góc nhọn không?",
        explanation: "Hình trụ không có đỉnh! Các cạnh đều tròn và cong. 💡",
      },
    ],
  },
  {
    id: 104,
    chapterId: 1,
    title: "Xây tháp với khối chóp",
    emoji: "🔺",
    description: "Tìm hiểu khối chóp tam giác và tứ giác.",
    status: "locked",
    xpReward: 15,
    duration: 7,
    pos: [76, 56],
    questions: [
      {
        id: 1,
        text: "Kim tự tháp Ai Cập là ví dụ của hình gì?",
        emoji: "🏛️",
        options: [
          "Khối lập phương",
          "Khối cầu",
          "Khối chóp tứ giác",
          "Hình trụ",
        ],
        correctIndex: 2,
        hint: "Kim tự tháp có đáy vuông và 4 mặt tam giác!",
        explanation: "Kim tự tháp là ví dụ điển hình của khối chóp tứ giác! 🏛️",
      },
      {
        id: 2,
        text: "Khối chóp tam giác có bao nhiêu mặt?",
        emoji: "🔺",
        options: ["3 mặt", "4 mặt", "5 mặt", "6 mặt"],
        correctIndex: 1,
        hint: "Đếm cả đáy và các mặt bên!",
        explanation:
          "Khối chóp tam giác có 4 mặt: 1 đáy tam giác + 3 mặt bên tam giác! 🎯",
      },
      {
        id: 3,
        text: "Khối chóp tứ giác có bao nhiêu đỉnh?",
        emoji: "⛰️",
        options: ["3 đỉnh", "4 đỉnh", "5 đỉnh", "8 đỉnh"],
        correctIndex: 2,
        hint: "Đếm 4 góc đáy + 1 đỉnh trên cùng!",
        explanation:
          "Khối chóp tứ giác có 5 đỉnh: 4 đỉnh ở đáy + 1 đỉnh nhọn trên cùng! 🏔️",
      },
      {
        id: 4,
        text: "Khối chóp tứ giác có bao nhiêu mặt?",
        emoji: "📐",
        options: ["4 mặt", "5 mặt", "6 mặt", "8 mặt"],
        correctIndex: 1,
        hint: "1 đáy hình vuông + các mặt bên tam giác!",
        explanation:
          "Khối chóp tứ giác có 5 mặt: 1 đáy hình vuông + 4 mặt tam giác! 🌟",
      },
      {
        id: 5,
        text: "Đặc điểm nào giúp nhận biết khối chóp?",
        emoji: "🤔",
        options: [
          "Có tất cả mặt là hình vuông",
          "Có một đỉnh nhọn ở trên cùng",
          "Không có đỉnh nào",
          "Có 2 mặt tròn",
        ],
        correctIndex: 1,
        hint: "Nghĩ về hình kim tự tháp!",
        explanation:
          "Khối chóp luôn có một đỉnh nhọn ở trên — đó là đặc điểm nổi bật! ⛰️",
      },
    ],
  },
  {
    id: 105,
    chapterId: 1,
    title: "Thử thách tổng hợp 3D",
    emoji: "🏆",
    description: "Ôn tập tất cả các khối hình 3D đã học.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [88, 76],
    questions: [
      {
        id: 1,
        text: "Hình nào KHÔNG có mặt phẳng?",
        emoji: "🤔",
        options: ["Khối lập phương", "Khối cầu", "Hình trụ", "Khối chóp"],
        correctIndex: 1,
        hint: "Hình nào tròn hoàn toàn?",
        explanation: "Khối cầu không có mặt phẳng. Tất cả bề mặt đều cong! ⚽",
      },
      {
        id: 2,
        text: "Hình nào có nhiều mặt nhất trong 4 hình đã học?",
        emoji: "📊",
        options: [
          "Khối lập phương (6)",
          "Khối cầu (0)",
          "Hình trụ (3)",
          "Khối chóp tam giác (4)",
        ],
        correctIndex: 0,
        hint: "Đếm mặt của từng hình!",
        explanation:
          "Khối lập phương có 6 mặt phẳng — nhiều nhất trong các hình đã học! 📦",
      },
      {
        id: 3,
        text: "Hình nào có thể lăn tự do mọi hướng?",
        emoji: "🎲",
        options: ["Khối lập phương", "Khối cầu", "Hình trụ", "Khối chóp"],
        correctIndex: 1,
        hint: "Hình nào không có cạnh hay mặt phẳng?",
        explanation:
          "Khối cầu lăn tự do mọi hướng vì bề mặt hoàn toàn cong! 🌍",
      },
      {
        id: 4,
        text: "Vật nào CÓ CÙNG hình dạng với khối lập phương?",
        emoji: "🌍",
        options: [
          "Quả bóng tennis",
          "Hộp quà vuông",
          "Ống hút nước",
          "Mũ sinh nhật nhọn",
        ],
        correctIndex: 1,
        hint: "Tìm vật có 6 mặt bằng nhau!",
        explanation:
          "Hộp quà vuông có 6 mặt hình vuông bằng nhau — đó là khối lập phương! 🎁",
      },
      {
        id: 5,
        text: "Ghép đúng: Mũ sinh nhật nhọn ↔ ?",
        emoji: "🎂",
        options: ["Khối lập phương", "Khối cầu", "Hình trụ", "Khối chóp"],
        correctIndex: 3,
        hint: "Mũ sinh nhật có đỉnh nhọn trên cùng!",
        explanation: "Mũ sinh nhật nhọn là ví dụ của khối chóp tam giác! 🎉",
      },
    ],
  },
];

// ─── Chapter 2 – Phép cộng ────────────────────────────────────────────────────

const chapter2Lessons: Lesson[] = [
  {
    id: 201,
    chapterId: 2,
    title: "Cộng trong phạm vi 10",
    emoji: "➕",
    description: "Thực hành cộng các số từ 1 đến 10 một cách vui nhộn.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    questions: [
      {
        id: 1,
        text: "3 + 4 = ?",
        emoji: "🍎",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "Đếm thêm 4 từ số 3 nhé!",
        explanation: "3 + 4 = 7. Bé giỏi lắm! 🌟",
      },
      {
        id: 2,
        text: "5 + 5 = ?",
        emoji: "🍊",
        options: ["9", "10", "11", "12"],
        correctIndex: 1,
        hint: "5 cộng 5 bằng... cả hai bàn tay!",
        explanation: "5 + 5 = 10. Cả hai bàn tay bé là 10 ngón! 🙌",
      },
      {
        id: 3,
        text: "2 + 6 = ?",
        emoji: "🍇",
        options: ["7", "8", "9", "10"],
        correctIndex: 1,
        hint: "Đếm từ 6 thêm 2 nữa!",
        explanation: "2 + 6 = 8. Đúng rồi! 🎯",
      },
      {
        id: 4,
        text: "4 + 3 = ?",
        emoji: "🍓",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "4 ngón tay + 3 ngón tay = ?",
        explanation: "4 + 3 = 7. Xuất sắc! ⭐",
      },
      {
        id: 5,
        text: "1 + 9 = ?",
        emoji: "🍌",
        options: ["9", "10", "11", "8"],
        correctIndex: 1,
        hint: "9 cộng thêm 1 là đủ 10!",
        explanation: "1 + 9 = 10. Tuyệt vời! 🏆",
      },
    ],
  },
  {
    id: 202,
    chapterId: 2,
    title: "Cộng trong phạm vi 20",
    emoji: "🔢",
    description: "Bước tiếp theo: cộng các số lên đến 20.",
    status: "active",
    xpReward: 15,
    duration: 6,
    pos: [35, 53],
    questions: [
      {
        id: 1,
        text: "8 + 7 = ?",
        emoji: "🌻",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "8 + 7 = 8 + 2 + 5 = 10 + 5!",
        explanation: "8 + 7 = 15. Bé thông minh quá! 🌟",
      },
      {
        id: 2,
        text: "9 + 6 = ?",
        emoji: "🌈",
        options: ["14", "15", "16", "17"],
        correctIndex: 1,
        hint: "9 + 1 = 10, còn dư 5 nữa!",
        explanation: "9 + 6 = 15. Làm tốt lắm! 🎉",
      },
      {
        id: 3,
        text: "7 + 8 = ?",
        emoji: "🦋",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "7 + 3 = 10, còn dư 5!",
        explanation: "7 + 8 = 15. Giỏi lắm bé ơi! ⭐",
      },
      {
        id: 4,
        text: "6 + 9 = ?",
        emoji: "🌺",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "6 + 4 = 10, còn dư 5!",
        explanation: "6 + 9 = 15. Xuất sắc! 🏆",
      },
      {
        id: 5,
        text: "10 + 8 = ?",
        emoji: "🎈",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "10 cộng thêm 8 nữa!",
        explanation: "10 + 8 = 18. Bé đã nắm vững phép cộng! 🎯",
      },
    ],
  },
  {
    id: 203,
    chapterId: 2,
    title: "Cộng có nhớ",
    emoji: "🧮",
    description: "Phép cộng có nhớ hàng chục thú vị.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [60, 35],
    questions: [
      {
        id: 1,
        text: "16 + 5 = ?",
        emoji: "🔢",
        options: ["19", "20", "21", "22"],
        correctIndex: 2,
        hint: "16 + 4 = 20, còn 1 nữa!",
        explanation: "16 + 5 = 21! 🌟",
      },
      {
        id: 2,
        text: "13 + 9 = ?",
        emoji: "➕",
        options: ["21", "22", "23", "24"],
        correctIndex: 1,
        hint: "13 + 7 = 20, còn 2 nữa!",
        explanation: "13 + 9 = 22! 🎯",
      },
      {
        id: 3,
        text: "18 + 4 = ?",
        emoji: "🧮",
        options: ["20", "21", "22", "23"],
        correctIndex: 2,
        hint: "18 + 2 = 20, còn 2 nữa!",
        explanation: "18 + 4 = 22! ⭐",
      },
      {
        id: 4,
        text: "15 + 7 = ?",
        emoji: "🌻",
        options: ["20", "21", "22", "23"],
        correctIndex: 2,
        hint: "15 + 5 = 20, còn 2 nữa!",
        explanation: "15 + 7 = 22! 🏆",
      },
      {
        id: 5,
        text: "17 + 6 = ?",
        emoji: "🎊",
        options: ["21", "22", "23", "24"],
        correctIndex: 2,
        hint: "17 + 3 = 20, còn 3 nữa!",
        explanation: "17 + 6 = 23! 🎉",
      },
    ],
  },
  {
    id: 204,
    chapterId: 2,
    title: "Cộng ba số",
    emoji: "🎲",
    description: "Học cộng ba số cùng một lúc.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [76, 56],
    questions: [
      {
        id: 1,
        text: "2 + 3 + 4 = ?",
        emoji: "🍎",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "Cộng 2+3=5 trước, rồi cộng 4!",
        explanation: "2+3+4 = 9! 🎯",
      },
      {
        id: 2,
        text: "5 + 5 + 5 = ?",
        emoji: "🖐️",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "3 lần 5 tay!",
        explanation: "5+5+5 = 15! ⭐",
      },
      {
        id: 3,
        text: "4 + 4 + 4 = ?",
        emoji: "🔢",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "3 lần 4!",
        explanation: "4+4+4 = 12! 🌟",
      },
      {
        id: 4,
        text: "1 + 2 + 3 = ?",
        emoji: "🎵",
        options: ["4", "5", "6", "7"],
        correctIndex: 2,
        hint: "1+2=3, 3+3=?",
        explanation: "1+2+3 = 6! 🏆",
      },
      {
        id: 5,
        text: "3 + 3 + 3 = ?",
        emoji: "🎈",
        options: ["6", "7", "8", "9"],
        correctIndex: 3,
        hint: "3 lần 3!",
        explanation: "3+3+3 = 9! 🎉",
      },
    ],
  },
  {
    id: 205,
    chapterId: 2,
    title: "Thử thách phép cộng",
    emoji: "🏆",
    description: "Tổng hợp tất cả kiến thức phép cộng đã học!",
    status: "locked",
    xpReward: 25,
    duration: 10,
    pos: [88, 76],
    questions: [
      {
        id: 1,
        text: "12 + 9 = ?",
        emoji: "🎯",
        options: ["19", "20", "21", "22"],
        correctIndex: 2,
        hint: "12+8=20, còn 1!",
        explanation: "12+9=21! 🌟",
      },
      {
        id: 2,
        text: "7 + 6 + 3 = ?",
        emoji: "🔢",
        options: ["14", "15", "16", "17"],
        correctIndex: 2,
        hint: "7+6=13, 13+3=16!",
        explanation: "7+6+3=16! ⭐",
      },
      {
        id: 3,
        text: "18 + 2 = ?",
        emoji: "🧮",
        options: ["18", "19", "20", "21"],
        correctIndex: 2,
        hint: "18+2 đủ 20!",
        explanation: "18+2=20! 🏆",
      },
      {
        id: 4,
        text: "9 + 9 = ?",
        emoji: "🎊",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "9+1=10, còn 8!",
        explanation: "9+9=18! 🎉",
      },
      {
        id: 5,
        text: "5 + 8 + 7 = ?",
        emoji: "🌈",
        options: ["18", "19", "20", "21"],
        correctIndex: 2,
        hint: "5+8=13, 13+7=20!",
        explanation: "5+8+7=20! 🎯",
      },
    ],
  },
];

// ─── Chapter 3 – Phép trừ ─────────────────────────────────────────────────────

const chapter3Lessons: Lesson[] = [
  {
    id: 301,
    chapterId: 3,
    title: "Trừ trong phạm vi 10",
    emoji: "➖",
    description: "Học phép trừ cơ bản trong phạm vi 10.",
    status: "locked",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    questions: [
      {
        id: 1,
        text: "9 - 3 = ?",
        emoji: "🍎",
        options: ["5", "6", "7", "8"],
        correctIndex: 1,
        hint: "Bỏ 3 quả từ 9 quả!",
        explanation: "9-3=6! 🌟",
      },
      {
        id: 2,
        text: "8 - 4 = ?",
        emoji: "🍌",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "8 bớt 4 còn bao nhiêu?",
        explanation: "8-4=4! ⭐",
      },
      {
        id: 3,
        text: "7 - 2 = ?",
        emoji: "🍊",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "7 bớt 2!",
        explanation: "7-2=5! 🎯",
      },
      {
        id: 4,
        text: "10 - 6 = ?",
        emoji: "🍇",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "10 bớt 6!",
        explanation: "10-6=4! 🏆",
      },
      {
        id: 5,
        text: "6 - 1 = ?",
        emoji: "🍓",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "6 bớt đi 1!",
        explanation: "6-1=5! 🎉",
      },
    ],
  },
  {
    id: 302,
    chapterId: 3,
    title: "Trừ trong phạm vi 20",
    emoji: "🔢",
    description: "Mở rộng phép trừ lên đến 20.",
    status: "locked",
    xpReward: 15,
    duration: 6,
    pos: [35, 53],
    questions: [
      {
        id: 1,
        text: "15 - 7 = ?",
        emoji: "🌻",
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        hint: "15-5=10, 10-2=8!",
        explanation: "15-7=8! 🌟",
      },
      {
        id: 2,
        text: "18 - 9 = ?",
        emoji: "🌈",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "9+9=18, vậy 18-9=?",
        explanation: "18-9=9! ⭐",
      },
      {
        id: 3,
        text: "20 - 8 = ?",
        emoji: "🎈",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "20-10=10, 10+2=12!",
        explanation: "20-8=12! 🎯",
      },
      {
        id: 4,
        text: "16 - 7 = ?",
        emoji: "🦋",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "16-6=10, 10-1=9!",
        explanation: "16-7=9! 🏆",
      },
      {
        id: 5,
        text: "13 - 5 = ?",
        emoji: "🌺",
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        hint: "13-3=10, 10-2=8!",
        explanation: "13-5=8! 🎉",
      },
    ],
  },
  {
    id: 303,
    chapterId: 3,
    title: "Trừ có nhớ",
    emoji: "🧮",
    description: "Phép trừ có nhớ hàng chục thú vị.",
    status: "locked",
    xpReward: 20,
    duration: 7,
    pos: [60, 35],
    questions: [
      {
        id: 1,
        text: "21 - 4 = ?",
        emoji: "🔢",
        options: ["16", "17", "18", "19"],
        correctIndex: 1,
        hint: "21-1=20, 20-3=17!",
        explanation: "21-4=17! 🌟",
      },
      {
        id: 2,
        text: "25 - 7 = ?",
        emoji: "➖",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "25-5=20, 20-2=18!",
        explanation: "25-7=18! ⭐",
      },
      {
        id: 3,
        text: "32 - 6 = ?",
        emoji: "🧮",
        options: ["24", "25", "26", "27"],
        correctIndex: 2,
        hint: "32-2=30, 30-4=26!",
        explanation: "32-6=26! 🎯",
      },
      {
        id: 4,
        text: "40 - 8 = ?",
        emoji: "🌻",
        options: ["30", "31", "32", "33"],
        correctIndex: 2,
        hint: "40-10=30, 30+2=32!",
        explanation: "40-8=32! 🏆",
      },
      {
        id: 5,
        text: "28 - 9 = ?",
        emoji: "🎊",
        options: ["17", "18", "19", "20"],
        correctIndex: 2,
        hint: "28-8=20, 20-1=19!",
        explanation: "28-9=19! 🎉",
      },
    ],
  },
  {
    id: 304,
    chapterId: 3,
    title: "Bài toán trừ",
    emoji: "📝",
    description: "Giải bài toán đố liên quan đến phép trừ.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [76, 56],
    questions: [
      {
        id: 1,
        text: "Có 10 quả táo, bé ăn 3 quả. Còn lại?",
        emoji: "🍎",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "10 bớt 3!",
        explanation: "10-3=7 quả táo! 🍎",
      },
      {
        id: 2,
        text: "Có 15 bông hoa, cho đi 6 bông. Còn lại?",
        emoji: "🌸",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "15 bớt 6!",
        explanation: "15-6=9 bông hoa! 🌸",
      },
      {
        id: 3,
        text: "Có 20 chiếc kẹo, ăn 8 chiếc. Còn lại?",
        emoji: "🍬",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "20 bớt 8!",
        explanation: "20-8=12 chiếc kẹo! 🍬",
      },
      {
        id: 4,
        text: "Lớp có 18 học sinh, 7 bạn về sớm. Còn lại?",
        emoji: "👦",
        options: ["9", "10", "11", "12"],
        correctIndex: 2,
        hint: "18 bớt 7!",
        explanation: "18-7=11 bạn! 👦",
      },
      {
        id: 5,
        text: "Có 16 con cá, 9 con bơi đi. Còn lại?",
        emoji: "🐟",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        hint: "16 bớt 9!",
        explanation: "16-9=7 con cá! 🐟",
      },
    ],
  },
  {
    id: 305,
    chapterId: 3,
    title: "Thử thách phép trừ",
    emoji: "🏆",
    description: "Ôn tập và thử thách tất cả kiến thức phép trừ!",
    status: "locked",
    xpReward: 25,
    duration: 10,
    pos: [88, 76],
    questions: [
      {
        id: 1,
        text: "30 - 14 = ?",
        emoji: "🎯",
        options: ["14", "15", "16", "17"],
        correctIndex: 2,
        hint: "30-10=20, 20-4=16!",
        explanation: "30-14=16! 🌟",
      },
      {
        id: 2,
        text: "22 - 8 = ?",
        emoji: "🔢",
        options: ["12", "13", "14", "15"],
        correctIndex: 2,
        hint: "22-2=20, 20-6=14!",
        explanation: "22-8=14! ⭐",
      },
      {
        id: 3,
        text: "50 - 23 = ?",
        emoji: "🧮",
        options: ["25", "26", "27", "28"],
        correctIndex: 2,
        hint: "50-20=30, 30-3=27!",
        explanation: "50-23=27! 🏆",
      },
      {
        id: 4,
        text: "18 - 9 + 3 = ?",
        emoji: "🎊",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "18-9=9, 9+3=12!",
        explanation: "18-9+3=12! 🎉",
      },
      {
        id: 5,
        text: "20 - 7 - 3 = ?",
        emoji: "🌈",
        options: ["8", "9", "10", "11"],
        correctIndex: 2,
        hint: "20-7=13, 13-3=10!",
        explanation: "20-7-3=10! 🎯",
      },
    ],
  },
];

// ─── All Chapters ─────────────────────────────────────────────────────────────

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Hình học 3D",
    emoji: "📦",
    description: "Khám phá thế giới hình khối 3D kỳ diệu!",
    color: "bg-sky-400",
    accent: "text-sky-700",
    shadow: "shadow-[0_6px_0_#0369a1]",
    lessons: chapter1Lessons,
  },
  {
    id: 2,
    title: "Phép cộng",
    emoji: "➕",
    description: "Học phép cộng từ cơ bản đến nâng cao!",
    color: "bg-green-400",
    accent: "text-green-700",
    shadow: "shadow-[0_6px_0_#15803d]",
    lessons: chapter2Lessons,
  },
  {
    id: 3,
    title: "Phép trừ",
    emoji: "➖",
    description: "Chinh phục phép trừ thú vị!",
    color: "bg-purple-400",
    accent: "text-purple-700",
    shadow: "shadow-[0_6px_0_#7e22ce]",
    lessons: chapter3Lessons,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLessonById(id: number): Lesson | undefined {
  for (const chapter of CHAPTERS) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getChapterByLessonId(lessonId: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.lessons.some((l) => l.id === lessonId));
}

// XP stored in localStorage
export const STUDENT_XP_KEY = "vio_student_xp";
export const STUDENT_COMPLETED_KEY = "vio_student_completed"; // JSON array of lessonIds

export function getTotalXP(): number {
  return Number(localStorage.getItem(STUDENT_XP_KEY) ?? 0);
}

export function getCompletedLessons(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_COMPLETED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markLessonComplete(lessonId: number, xp: number) {
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(STUDENT_COMPLETED_KEY, JSON.stringify(completed));
    const total = getTotalXP() + xp;
    localStorage.setItem(STUDENT_XP_KEY, String(total));
  }
}
