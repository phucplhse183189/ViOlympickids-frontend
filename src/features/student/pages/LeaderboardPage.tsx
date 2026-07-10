import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Sparkles } from "lucide-react";
import {
  ACTIVE_CHILD_ID_KEY,
  CHILD_PROFILES_STORAGE_KEY,
} from "@/shared/lib/constants";
import * as leaderboardService from "@/features/student/api/leaderboardService";
import type {
  LeaderboardEntry,
  LeaderboardResponse,
  QuizLesson,
} from "@/features/student/api/leaderboardService";
import "./LeaderboardPage.css";

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function getActiveChildId(): string | null {
  return (
    localStorage.getItem(ACTIVE_CHILD_ID_KEY) ||
    sessionStorage.getItem(ACTIVE_CHILD_ID_KEY) ||
    null
  );
}

function getActiveChildName(): string {
  try {
    const activeId = getActiveChildId();
    const raw = localStorage.getItem(CHILD_PROFILES_STORAGE_KEY);
    if (raw && activeId) {
      const profiles = JSON.parse(raw);
      const match = profiles.find((p: { id: string }) => p.id === activeId);
      if (match) return match.name;
    }
  } catch { /* ignore */ }
  return "Bé";
}

/** Background decoration emojis */
const BG_DECOS = [
  { emoji: "⭐", top: "5%", left: "8%", delay: "0s", size: "1.8rem" },
  { emoji: "🌟", top: "12%", left: "85%", delay: "1.2s", size: "2.2rem" },
  { emoji: "🏅", top: "30%", left: "3%", delay: "2.5s", size: "1.6rem" },
  { emoji: "✨", top: "45%", left: "92%", delay: "0.8s", size: "1.4rem" },
  { emoji: "🎯", top: "60%", left: "6%", delay: "3s", size: "1.5rem" },
  { emoji: "💫", top: "25%", left: "90%", delay: "1.8s", size: "1.7rem" },
  { emoji: "🌈", top: "70%", left: "88%", delay: "2.2s", size: "2rem" },
  { emoji: "🎪", top: "80%", left: "5%", delay: "0.5s", size: "1.9rem" },
];

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/** Top 3 Podium */
function TopPodium({ entries }: Readonly<{ entries: LeaderboardEntry[] }>) {
  // Reorder: [2nd, 1st, 3rd] for visual layout
  const first = entries[0] || null;
  const second = entries[1] || null;
  const third = entries[2] || null;
  const ordered = [second, first, third]; // center = 1st place

  const medals = ["🥈", "🥇", "🥉"];
  const classes = ["silver", "gold", "bronze"];

  if (!first) {
    return (
      <div className="lb-empty">
        <div className="lb-empty-icon">🏆</div>
        <p className="lb-empty-text">
          Chưa có bảng xếp hạng.
          <br />
          Hãy là người đầu tiên chinh phục nhé! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="lb-podium-container">
      {/* Sparkle decorations */}
      <span className="lb-sparkle" style={{ top: "10%", left: "20%", animationDelay: "0s" }}>✨</span>
      <span className="lb-sparkle" style={{ top: "5%", left: "50%", animationDelay: "0.5s" }}>🌟</span>
      <span className="lb-sparkle" style={{ top: "15%", left: "75%", animationDelay: "1s" }}>✨</span>

      {ordered.map((entry, i) => {
        if (!entry) return <div key={i} className="lb-podium-slot" style={{ width: 90 }} />;
        const cls = classes[i];
        const isFirst = i === 1;
        return (
          <div key={entry.childId} className="lb-podium-slot">
            {/* Crown/Medal above avatar */}
            {isFirst ? (
              <span className="lb-podium-crown">👑</span>
            ) : (
              <span className="lb-podium-medal">{medals[i]}</span>
            )}

            {/* Avatar */}
            <div className={`lb-podium-avatar ${cls}`}>
              {entry.avatarEmoji || "🦊"}
            </div>

            {/* Podium block */}
            <div className={`lb-podium-block ${cls}`}>
              <span className="lb-podium-rank">{entry.rank}</span>
              <span className="lb-podium-name" title={entry.name}>
                {entry.name}
              </span>
              <span className="lb-podium-score">
                {entry.score}/{entry.totalQuestions}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Rank rows for positions 4-10 */
function RankList({ entries }: Readonly<{ entries: LeaderboardEntry[] }>) {
  if (entries.length === 0) return null;

  return (
    <div className="lb-rank-list">
      {entries.map((entry) => (
        <div
          key={entry.childId}
          className="lb-rank-row"
          style={{ animationDelay: `${(entry.rank - 3) * 0.05}s` }}
        >
          <div className="lb-rank-number">{entry.rank}</div>
          <div
            className="lb-rank-avatar"
            style={entry.avatarBg ? { background: entry.avatarBg } : undefined}
          >
            {entry.avatarEmoji || "🦊"}
          </div>
          <div className="lb-rank-info">
            <div className="lb-rank-name">{entry.name}</div>
            <div className="lb-rank-detail">
              Lần thử: {entry.attemptNumber}
            </div>
          </div>
          <div className="lb-rank-score-badge">
            {entry.score}/{entry.totalQuestions}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Sticky "My Rank" card — shown when user is outside top 10 or not participated */
function MyRankCard({
  myRank,
  totalParticipants,
  hasAttempted,
}: Readonly<{
  myRank: LeaderboardEntry | null;
  totalParticipants: number;
  hasAttempted: boolean;
}>) {
  const navigate = useNavigate();

  // Case 1: Student has NOT attempted this quiz
  if (!hasAttempted) {
    return (
      <div className="lb-not-participated">
        <div className="lb-not-participated-inner">
          <div className="lb-not-participated-icon">🚀</div>
          <div>
            <p className="lb-not-participated-text">
              Con chưa tham gia bài này. Hãy làm quiz ngay để được vinh danh
              trên Bảng Vàng nhé! 🌟
            </p>
            <button
              onClick={() => navigate("/student")}
              style={{
                marginTop: 8,
                padding: "6px 16px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "white",
                fontWeight: 800,
                fontSize: "0.75rem",
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
              }}
            >
              🎯 Đi làm quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Student is in top 10 — no floating card needed
  if (!myRank || myRank.rank <= 10) return null;

  // Case 3: Student is outside top 10 — show encouraging rank card
  const gap = myRank.rank - 10;
  const encourageMsg =
    gap <= 5
      ? `Chỉ còn ${gap} bậc nữa là lọt Top 10 rồi! Cố lên nào! 💪`
      : gap <= 15
        ? `Con đang tiến bộ tốt lắm! Thử lại để leo hạng nhé! 🌟`
        : `Mỗi lần làm đều giỏi hơn! Tiếp tục nào! 🎯`;

  return (
    <div className="lb-my-rank">
      <div className="lb-my-rank-inner">
        <div className="lb-my-rank-badge">
          {myRank.avatarEmoji || "🌟"}
        </div>
        <div className="lb-my-rank-text">
          <div className="lb-my-rank-label">
            🏅 Con đang ở Hạng #{myRank.rank} / {totalParticipants} bạn
          </div>
          <div className="lb-my-rank-encourage">{encourageMsg}</div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            color: "#15803d",
            fontSize: "0.75rem",
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {myRank.score}/{myRank.totalQuestions}
        </div>
      </div>
    </div>
  );
}

/** Loading skeleton */
function LeaderboardSkeleton() {
  return (
    <div style={{ padding: "0 1rem" }}>
      {/* Podium skeleton */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        <div className="lb-skeleton" style={{ width: 90, height: 110, borderRadius: 16 }} />
        <div className="lb-skeleton" style={{ width: 90, height: 140, borderRadius: 16 }} />
        <div className="lb-skeleton" style={{ width: 90, height: 90, borderRadius: 16 }} />
      </div>
      {/* List skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="lb-skeleton"
          style={{ height: 56, marginBottom: 8, maxWidth: "28rem", marginLeft: "auto", marginRight: "auto" }}
        />
      ))}
    </div>
  );
}

/** Quiz Selector Pills */
function QuizSelector({
  lessons,
  selectedId,
  onSelect,
}: Readonly<{
  lessons: QuizLesson[];
  selectedId: string;
  onSelect: (id: string) => void;
}>) {
  return (
    <div className="lb-quiz-selector">
      {lessons.map((lesson) => (
        <button
          key={lesson.id}
          id={`quiz-pill-${lesson.id}`}
          className={`lb-quiz-pill ${selectedId === lesson.id ? "active" : ""}`}
          onClick={() => onSelect(lesson.id)}
        >
          <span>{lesson.emoji || "📝"}</span>
          <span>{lesson.title}</span>
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export function LeaderboardPage() {
  const navigate = useNavigate();
  const childId = getActiveChildId();
  const childName = getActiveChildName();

  const [lessons, setLessons] = useState<QuizLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  // Load quiz lessons on mount
  useEffect(() => {
    leaderboardService
      .getQuizLessons()
      .then((data) => {
        setLessons(data);
        if (data.length > 0) {
          setSelectedLessonId(data[0].id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quiz lessons:", err);
        setIsLoading(false);
      });
  }, []);

  // Load leaderboard when quiz selection changes
  const loadLeaderboard = useCallback(
    async (lessonId: string) => {
      if (!lessonId || !childId) return;
      setIsLoadingBoard(true);
      try {
        const data = await leaderboardService.getLeaderboard(lessonId, childId);
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setLeaderboard(null);
      } finally {
        setIsLoadingBoard(false);
      }
    },
    [childId],
  );

  useEffect(() => {
    if (selectedLessonId) {
      loadLeaderboard(selectedLessonId);
    }
  }, [selectedLessonId, loadLeaderboard]);

  // Determine if the current child has attempted this quiz
  const hasAttempted = leaderboard?.myRank !== null;

  // Split top10 into podium (1-3) and list (4-10)
  const podiumEntries = leaderboard?.top10.filter((e) => e.rank <= 3) ?? [];
  const listEntries = leaderboard?.top10.filter((e) => e.rank > 3) ?? [];

  // Should we show the MyRankCard?
  const myRankIsInTop10 = leaderboard?.myRank
    ? leaderboard.myRank.rank <= 10
    : false;
  const showMyRankCard = leaderboard !== null && (!myRankIsInTop10 || !hasAttempted);

  return (
    <div className="lb-page">
      {/* ═══ Background Decorations ═══ */}
      {BG_DECOS.map((d, i) => (
        <span
          key={i}
          className="lb-deco"
          style={{
            top: d.top,
            left: d.left,
            fontSize: d.size,
            animationDelay: d.delay,
          }}
        >
          {d.emoji}
        </span>
      ))}

      {/* ═══ Header ═══ */}
      <div className="lb-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <Trophy
            size={28}
            style={{ color: "#f59e0b", filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.4))" }}
          />
          <h1 className="lb-title" id="leaderboard-title">
            Bảng Xếp Hạng
          </h1>
          <Sparkles
            size={22}
            style={{ color: "#8b5cf6", filter: "drop-shadow(0 2px 4px rgba(139,92,246,0.4))" }}
          />
        </div>
        <p className="lb-subtitle">
          Xin chào <strong>{childName}</strong>! Xem bạn nào giỏi nhất nào 🏆
        </p>
      </div>

      {/* ═══ Quiz Selector ═══ */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 1rem", marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="lb-skeleton" style={{ width: 120, height: 36, borderRadius: 999 }} />
          ))}
        </div>
      ) : lessons.length > 0 ? (
        <QuizSelector
          lessons={lessons}
          selectedId={selectedLessonId}
          onSelect={setSelectedLessonId}
        />
      ) : (
        <div className="lb-empty">
          <div className="lb-empty-icon">📝</div>
          <p className="lb-empty-text">Chưa có bài quiz nào.</p>
        </div>
      )}

      {/* ═══ Leaderboard Content ═══ */}
      {isLoadingBoard ? (
        <LeaderboardSkeleton />
      ) : leaderboard ? (
        <>
          {/* Top 3 Podium */}
          <TopPodium entries={podiumEntries} />

          {/* Ranks 4-10 */}
          <RankList entries={listEntries} />
        </>
      ) : null}

      {/* ═══ Sticky My Rank / Not Participated Card ═══ */}
      {showMyRankCard && leaderboard && (
        <MyRankCard
          myRank={leaderboard.myRank}
          totalParticipants={leaderboard.totalParticipants}
          hasAttempted={hasAttempted}
        />
      )}

      {/* ═══ Back to Table of Contents button ═══ */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "1rem 0 2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          id="leaderboard-back-btn"
          onClick={() => navigate("/student")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 999,
            border: "2px solid rgba(0,0,0,0.08)",
            background: "white",
            color: "#6b7280",
            fontWeight: 800,
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft size={16} />
          Về Mục lục
        </button>
      </div>
    </div>
  );
}
