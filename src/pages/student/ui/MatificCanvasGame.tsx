import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGameSound } from "@/shared/lib/useGameSound";
import {
  type CanvasRound,
  generateCanvasRounds,
  validateDrop,
} from "@/shared/lib/canvasGameLogic";
import { useActiveChild } from "@/shared/lib/activeChild";
import * as lessonService from "@/shared/api/services/lessonService";
import { ParentGate } from "@/shared/ui/ParentGate";
import { MATIFIC_ASSET_PACK } from "@/shared/config/matificAssetPack";

type GamePhase = "intro" | "play" | "victory";

type TokenPosition = {
  x: number;
  y: number;
};

const TOTAL_ROUNDS = 4;

function makeInitialTokenPositions(
  round: CanvasRound,
): Record<string, TokenPosition> {
  const rowY = 330;
  const startX = 90;
  const gap = 110;
  return round.tokens.reduce<Record<string, TokenPosition>>(
    (acc, token, idx) => {
      acc[token.id] = { x: startX + idx * gap, y: rowY };
      return acc;
    },
    {},
  );
}

function CanvasSky({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 3 + 1,
      speed: Math.random() * 0.0012 + 0.0002,
      drift: (Math.random() - 0.5) * 0.001,
      alpha: Math.random() * 0.5 + 0.25,
    }));

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 0.006;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "#06246f");
      gradient.addColorStop(0.5, "#1a4dab");
      gradient.addColorStop(1, "#3ca5d8");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < 6; i += 1) {
        const x = (w / 5) * i + Math.sin(frame + i) * 20;
        const y = h * 0.25 + Math.cos(frame * 1.5 + i) * 24;
        ctx.beginPath();
        ctx.arc(x, y, 36 + i * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05 || p.x > 1.05) p.drift *= -1;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha + Math.sin(frame * 8 + p.x * 5) * 0.08})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

export function MatificCanvasGame() {
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const sound = useGameSound();

  const rounds = useMemo(() => generateCanvasRounds(TOTAL_ROUNDS), []);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [roundIdx, setRoundIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hint, setHint] = useState("Sẵn sàng bắt đầu chưa nào?");
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [showGate, setShowGate] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentRound = rounds[roundIdx];

  const [tokenPositions, setTokenPositions] = useState<
    Record<string, TokenPosition>
  >(() => makeInitialTokenPositions(currentRound));

  const [placedBySlot, setPlacedBySlot] = useState<
    Record<string, string | null>
  >(() =>
    currentRound.slots.reduce<Record<string, string | null>>((acc, s) => {
      acc[s.id] = null;
      return acc;
    }, {}),
  );

  const [lockedTokens, setLockedTokens] = useState<Set<string>>(new Set());
  const dragRef = useRef<{ tokenId: string; dx: number; dy: number } | null>(
    null,
  );

  useEffect(() => {
    setTokenPositions(makeInitialTokenPositions(currentRound));
    setPlacedBySlot(
      currentRound.slots.reduce<Record<string, string | null>>((acc, s) => {
        acc[s.id] = null;
        return acc;
      }, {}),
    );
    setLockedTokens(new Set());
    setHint(currentRound.prompt);
  }, [currentRound]);

  const tokenById = useMemo(() => {
    const map: Record<string, number> = {};
    currentRound.tokens.forEach((t) => {
      map[t.id] = t.value;
    });
    return map;
  }, [currentRound.tokens]);

  const playIntro = useCallback(() => {
    setPhase("play");
    const message = sound.introVoice();
    if (message) setHint(message);
  }, [sound]);

  const resetWholeGame = () => {
    setPhase("intro");
    setRoundIdx(0);
    setStars(0);
    setWrong(0);
    setHint("Sẵn sàng bắt đầu chưa nào?");
  };

  const releaseToHome = useCallback(
    (tokenId: string) => {
      const home = makeInitialTokenPositions(currentRound)[tokenId];
      if (!home) return;
      setTokenPositions((prev) => ({ ...prev, [tokenId]: home }));
    },
    [currentRound],
  );

  const finishRoundIfNeeded = useCallback(
    (nextPlaced: Record<string, string | null>) => {
      const complete = currentRound.slots.every((slot) => nextPlaced[slot.id]);
      if (!complete) return;

      const isLast = roundIdx + 1 >= rounds.length;
      if (isLast) {
        sound.victoryVoice();
        if (activeChild?.id) lessonService.markCompleted(activeChild.id, "math2-b6").catch(console.error);
        setHint("Xuất sắc! Bạn đã hoàn thành thử thách Matific Canvas.");
        setTimeout(() => {
          setPhase("victory");
        }, 500);
        return;
      }

      setHint("Chuẩn luôn! Sang thử thách tiếp theo nhé.");
      setTimeout(() => {
        setRoundIdx((r) => r + 1);
      }, 450);
    },
    [activeChild?.id || "", currentRound.slots, roundIdx, rounds.length, sound],
  );

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;

    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left - drag.dx;
    const y = event.clientY - rect.top - drag.dy;

    const maxX = rect.width - 72;
    const maxY = rect.height - 72;

    setTokenPositions((prev) => ({
      ...prev,
      [drag.tokenId]: {
        x: Math.max(12, Math.min(maxX, x)),
        y: Math.max(12, Math.min(maxY, y)),
      },
    }));
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      dragRef.current = null;

      const droppedInSlot = currentRound.slots.find((slot) => {
        const el = slotRefs.current[slot.id];
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      if (!droppedInSlot) {
        if (soundOn) sound.drop();
        releaseToHome(drag.tokenId);
        return;
      }

      const slotAlreadyFilled = placedBySlot[droppedInSlot.id] !== null;
      if (slotAlreadyFilled) {
        if (soundOn) sound.wrong();
        setHint("Ô đó đã có số rồi, thử ô khác nhé.");
        releaseToHome(drag.tokenId);
        return;
      }

      const value = tokenById[drag.tokenId];
      const accepted = validateDrop(droppedInSlot.expectedValue, value);

      if (!accepted) {
        if (soundOn) sound.wrongVoice();
        setWrong((w) => w + 1);
        setHint(`Chưa đúng rồi. Ô này cần số ${droppedInSlot.expectedValue}.`);
        releaseToHome(drag.tokenId);
        return;
      }

      if (soundOn) sound.correctVoice();
      setStars((s) => s + 1);

      const slotEl = slotRefs.current[droppedInSlot.id];
      const boardEl = boardRef.current;
      if (slotEl && boardEl) {
        const slotRect = slotEl.getBoundingClientRect();
        const boardRect = boardEl.getBoundingClientRect();
        setTokenPositions((prev) => ({
          ...prev,
          [drag.tokenId]: {
            x: slotRect.left - boardRect.left + slotRect.width / 2 - 34,
            y: slotRect.top - boardRect.top + slotRect.height / 2 - 34,
          },
        }));
      }

      setLockedTokens((prev) => new Set(prev).add(drag.tokenId));
      setPlacedBySlot((prev) => {
        const next = { ...prev, [droppedInSlot.id]: drag.tokenId };
        finishRoundIfNeeded(next);
        return next;
      });
    },
    [
      currentRound.slots,
      finishRoundIfNeeded,
      placedBySlot,
      releaseToHome,
      sound,
      soundOn,
      tokenById,
    ],
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const beginDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    tokenId: string,
  ) => {
    if (lockedTokens.has(tokenId)) return;

    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const tokenRect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      tokenId,
      dx: event.clientX - tokenRect.left,
      dy: event.clientY - tokenRect.top,
    };

    if (soundOn) sound.pickup();

    event.currentTarget.setPointerCapture(event.pointerId);

    setTokenPositions((prev) => ({
      ...prev,
      [tokenId]: {
        x: event.clientX - boardRect.left - (event.clientX - tokenRect.left),
        y: event.clientY - boardRect.top - (event.clientY - tokenRect.top),
      },
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${MATIFIC_ASSET_PACK.background.sky})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <CanvasSky className="absolute inset-0 h-full w-full" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url(${MATIFIC_ASSET_PACK.background.cloudLayer})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-8 pt-6 md:px-6">
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/20 px-4 py-3 backdrop-blur-sm"
          style={{
            backgroundImage: `url(${MATIFIC_ASSET_PACK.hud.panel})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <button
            onClick={() => navigate("/student")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 font-bold text-slate-800 transition hover:bg-white"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <div className="flex items-center gap-2 text-sm font-bold md:text-base">
            <Sparkles size={18} className="text-amber-300" />
            Matific Canvas - Kéo số vào ô đúng
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundOn(sound.toggleSound());
              }}
              className="rounded-xl bg-white/85 p-2 text-slate-800"
              aria-label="Toggle sound"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => {
                setVoiceOn(sound.toggleVoice());
              }}
              className="rounded-xl bg-white/85 p-2 text-slate-800"
              aria-label="Toggle voice"
            >
              {voiceOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={resetWholeGame}
              className="rounded-xl bg-white/85 p-2 text-slate-800"
              aria-label="Reset game"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => setShowGate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-3 py-2 font-black text-amber-900"
            >
              <Lock size={16} />
              Thoát
            </button>
          </div>
        </div>

        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-3xl border border-white/25 px-4 py-3 backdrop-blur-sm"
          style={{
            backgroundImage: `url(${MATIFIC_ASSET_PACK.hud.panel})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
            Vòng:{" "}
            <span className="font-black">
              {Math.min(roundIdx + 1, rounds.length)}/{rounds.length}
            </span>
          </div>
          <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
            Sao: <span className="font-black">{stars}</span>
          </div>
          <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
            Sai: <span className="font-black">{wrong}</span>
          </div>
          <div className="flex items-center gap-1 pl-2 text-amber-300">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.min(3, stars % 4 || 4) ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        {phase === "intro" && (
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-[2rem] border border-white/25 bg-white/12 p-8 text-center backdrop-blur-md">
            <div className="mb-2 flex justify-center">
              <img
                src={MATIFIC_ASSET_PACK.mascot.guide}
                alt="Mascot guide"
                className="h-36 w-auto drop-shadow-[0_12px_30px_rgba(7,23,66,0.45)] md:h-44"
              />
            </div>
            <p className="mx-auto mb-3 inline-block rounded-full bg-white/85 px-4 py-1 text-xs font-extrabold text-sky-700 md:text-sm">
              Robot Tí Tách sẽ hướng dẫn bạn qua từng vòng
            </p>
            <h1 className="mb-3 text-3xl font-black md:text-4xl">
              Khởi động Matific Canvas
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-sky-100 md:text-lg">
              Kéo từng số bên dưới vào đúng ô sáng. Mỗi ô chỉ nhận đúng một số.
              Hoàn thành đủ {TOTAL_ROUNDS} vòng để mở kho báu sao.
            </p>
            <button
              onClick={playIntro}
              className="rounded-3xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-10 py-4 text-xl font-black text-slate-900 shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition hover:scale-105"
            >
              Bắt đầu chơi
            </button>
          </div>
        )}

        {phase === "play" && (
          <div className="rounded-[2rem] border border-white/30 bg-[#04265bcc] p-4 backdrop-blur-sm md:p-6">
            <div className="mb-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 md:text-base">
              {hint}
            </div>

            <div
              ref={boardRef}
              className="relative h-[430px] overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-b from-[#08357a] via-[#165ca3] to-[#3aaad8]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.18),transparent_30%)]" />

              <div className="absolute left-0 right-0 top-9 flex items-center justify-center gap-4 md:gap-8">
                {currentRound.slots.map((slot) => {
                  const filled = placedBySlot[slot.id] !== null;
                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        ref={(el) => {
                          slotRefs.current[slot.id] = el;
                        }}
                        style={{
                          backgroundImage: `url(${filled ? MATIFIC_ASSET_PACK.slot.correct : MATIFIC_ASSET_PACK.slot.empty})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        className={`h-24 w-24 rounded-3xl border-4 text-center text-2xl font-black leading-[90px] transition ${
                          filled
                            ? "border-emerald-300 bg-emerald-200 text-emerald-900"
                            : "border-cyan-100 bg-white/70 text-cyan-900"
                        }`}
                      >
                        {filled ? slot.expectedValue : "?"}
                      </div>
                      <span className="text-xs font-bold text-sky-100 md:text-sm">
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {currentRound.tokens.map((token) => {
                const pos = tokenPositions[token.id] ?? { x: 0, y: 0 };
                const locked = lockedTokens.has(token.id);
                return (
                  <button
                    key={token.id}
                    onPointerDown={(e) => beginDrag(e, token.id)}
                    disabled={locked}
                    style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                    title={`Token ${token.value}`}
                    className={`absolute left-0 top-0 h-[68px] w-[68px] rounded-2xl border-2 text-center text-2xl font-black leading-[64px] shadow-lg transition ${
                      locked
                        ? "cursor-default border-emerald-300 bg-emerald-200 text-emerald-900"
                        : "cursor-grab border-amber-200 bg-amber-100 text-amber-900 active:cursor-grabbing"
                    }`}
                  >
                    <span
                      className="flex h-full w-full items-center justify-center bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${locked ? MATIFIC_ASSET_PACK.token.correct : MATIFIC_ASSET_PACK.token.base})`,
                      }}
                    >
                      {token.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "victory" && (
          <div className="mx-auto mt-8 w-full max-w-2xl rounded-[2rem] border border-white/25 bg-white/15 p-8 text-center backdrop-blur-md">
            <div className="mb-3 flex justify-center">
              <img
                src={MATIFIC_ASSET_PACK.fx.starBurst}
                alt="Star burst"
                className="h-20 w-20"
              />
            </div>
            <div className="mb-3 text-6xl">🏆</div>
            <h2 className="mb-2 text-3xl font-black">Hoàn thành xuất sắc</h2>
            <p className="mb-6 text-sky-100">
              Bạn hoàn thành {TOTAL_ROUNDS} vòng với {stars} sao và {wrong} lỗi
              nhỏ.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={resetWholeGame}
                className="rounded-2xl bg-white px-6 py-3 font-black text-slate-800"
              >
                Chơi lại
              </button>
              <button
                onClick={() => navigate("/student")}
                className="rounded-2xl bg-emerald-300 px-6 py-3 font-black text-emerald-950"
              >
                Về mục lục
              </button>
            </div>
          </div>
        )}
      </div>

      {showGate && (
        <ParentGate
          onClose={() => setShowGate(false)}
          onSuccess={() => navigate("/student")}
        />
      )}
    </div>
  );
}
