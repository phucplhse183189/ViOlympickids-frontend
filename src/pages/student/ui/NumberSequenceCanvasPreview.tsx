import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Flame,
  Mic,
  MicOff,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MAPS } from "@/shared/lib/robotGameLogic";
import { useGameSound } from "@/shared/lib/useGameSound";

type SceneProp = {
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bob?: number;
  shadow?: number;
  z?: number;
};

type SceneDef = {
  title: string;
  subtitle: string;
  background: string;
  props: SceneProp[];
};

type LeafParticle = {
  seedX: number;
  seedY: number;
  speed: number;
  sway: number;
  size: number;
  rot: number;
  color: string;
};

type Map1TokenState = {
  id: string;
  value: number;
  hue: number;
  x: number;
  y: number;
  w: number;
  h: number;
  homeX: number;
  homeY: number;
  z: number;
};

type Map1Slot = {
  id: string;
  kind: "prev" | "next";
  x: number;
  y: number;
  w: number;
  h: number;
};

type Map1Task = {
  anchor: number;
  mode: "prev" | "next";
  answer: number;
};

type Map1Feedback = {
  kind: "success" | "wrong" | "reward";
  text: string;
  until: number;
};

type Map1LoopState = {
  tokens: Map1TokenState[];
  tasks: Map1Task[];
  taskIdx: number;
  totalTasks: number;
  attempts: number;
  score: number;
  combo: number;
  bestCombo: number;
  streak: number;
  timeLeft: number;
  completed: boolean;
  failed: boolean;
  feedback: Map1Feedback | null;
};

const MAP1_TOTAL_TASKS = 5;
const MAP1_START_TIME = 55;
const VI_FONT_STACK = '"Segoe UI", "Noto Sans", "Helvetica Neue", Arial, sans-serif';
const MAP1_ASSET_BASE = "/assets/matific-pack/map2-dom/map1-neighbor";
const MAP1_PREV_SLOT_ICON = `${MAP1_ASSET_BASE}/slot-prev-basket.svg`;
const MAP1_NEXT_SLOT_ICON = `${MAP1_ASSET_BASE}/slot-next-basket.svg`;
const MAP1_BG = `${MAP1_ASSET_BASE}/map1-bg-garden.svg`;
const MAP1_TREE_BIG = `${MAP1_ASSET_BASE}/map1-tree-big.svg`;
const MAP1_TREE_SMALL = `${MAP1_ASSET_BASE}/map1-tree-small.svg`;
const MAP1_FENCE = `${MAP1_ASSET_BASE}/map1-fence.svg`;
const MAP1_FLOWER_RED = `${MAP1_ASSET_BASE}/map1-flower-red.svg`;
const MAP1_FLOWER_YELLOW = `${MAP1_ASSET_BASE}/map1-flower-yellow.svg`;
const MAP1_BUTTERFLY = `${MAP1_ASSET_BASE}/map1-butterfly.svg`;
const MAP1_SIGN_BOARD = `${MAP1_ASSET_BASE}/map1-sign-board.svg`;
const MAP1_APPLE_RED = "/assets/matific-pack/map2-dom/map1-orchard/map1-token-apple-red.svg";
const MAP1_APPLE_GREEN = "/assets/matific-pack/map2-dom/map1-orchard/map1-token-apple-green.svg";
const MAP1_APPLE_GOLD = "/assets/matific-pack/map2-dom/map1-orchard/map1-token-apple-gold.svg";
const MAP1_APPLE_PATHS = [MAP1_APPLE_RED, MAP1_APPLE_GREEN, MAP1_APPLE_GOLD];
const MAP1_SLOTS: Map1Slot[] = [
  { id: "slot-prev", kind: "prev", x: 0.28, y: 0.72, w: 0.22, h: 0.14 },
  { id: "slot-next", kind: "next", x: 0.72, y: 0.72, w: 0.22, h: 0.14 },
];
const MAP1_TOKEN_HOMES = [
  { x: 0.14, y: 0.14 },
  { x: 0.43, y: 0.10 },
  { x: 0.72, y: 0.14 },
];

function shuffleArray<T>(arr: T[]) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = next[i];
    next[i] = next[j];
    next[j] = t;
  }
  return next;
}

function randomMap1Tasks(total: number) {
  const tasks: Map1Task[] = [];
  for (let i = 0; i < total; i += 1) {
    const mode: "prev" | "next" = i % 2 === 0 ? "prev" : "next";
    const anchor =
      mode === "prev"
        ? 2 + Math.floor(Math.random() * 8)
        : 1 + Math.floor(Math.random() * 8);
    tasks.push({
      anchor,
      mode,
      answer: mode === "prev" ? anchor - 1 : anchor + 1,
    });
  }
  return shuffleArray(tasks);
}

function createMap1Tokens(task: Map1Task): Map1TokenState[] {
  const values = shuffleArray([task.anchor - 1, task.anchor, task.anchor + 1]);
  return values.map((value, idx) => {
    const home = MAP1_TOKEN_HOMES[idx];
    return {
      id: `num-${idx + 1}`,
      value,
      hue: 32 + (value % 6) * 28,
      x: home.x,
      y: home.y,
      w: 0.12,
      h: 0.14,
      homeX: home.x,
      homeY: home.y,
      z: 3 + idx,
    };
  });
}

function createMap1LoopState(): Map1LoopState {
  const tasks = randomMap1Tasks(MAP1_TOTAL_TASKS);
  const firstTask = tasks[0] ?? { anchor: 2, mode: "prev" as const, answer: 1 };
  const tokens = createMap1Tokens(firstTask);

  return {
    tokens,
    tasks,
    taskIdx: 0,
    totalTasks: MAP1_TOTAL_TASKS,
    attempts: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    streak: 0,
    timeLeft: MAP1_START_TIME,
    completed: false,
    failed: false,
    feedback: null,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function pointInRect(
  px: number,
  py: number,
  r: { x: number; y: number; w: number; h: number },
) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function formatSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function map1TaskText(task: Map1Task | null | undefined) {
  if (!task) return "-";
  return task.mode === "prev"
    ? `Số liền trước của ${task.anchor}`
    : `Số liền sau của ${task.anchor}`;
}

function drawMap1CanvasHud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loop: Map1LoopState,
) {
  const task = loop.tasks[loop.taskIdx];
  const leftW = Math.min(width * 0.38, 330);
  const rightW = Math.min(width * 0.25, 220);
  const chipH = Math.max(34, height * 0.085);
  const y = height * 0.035;

  const leftFill = ctx.createLinearGradient(20, y, 20, y + chipH);
  leftFill.addColorStop(0, "rgba(12,95,153,0.9)");
  leftFill.addColorStop(1, "rgba(10,69,130,0.88)");
  ctx.fillStyle = leftFill;
  ctx.strokeStyle = "rgba(167,229,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(20, y, leftW, chipH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(237,250,255,0.98)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.max(12, Math.floor(height * 0.028))}px ${VI_FONT_STACK}`;
  ctx.fillText(
    `Câu ${Math.min(loop.taskIdx + 1, loop.totalTasks)}/${loop.totalTasks}: ${map1TaskText(task)}`,
    34,
    y + chipH / 2,
  );

  const rightX = width - rightW - 20;
  const rightFill = ctx.createLinearGradient(rightX, y, rightX, y + chipH);
  rightFill.addColorStop(0, "rgba(30,141,200,0.9)");
  rightFill.addColorStop(1, "rgba(22,103,170,0.86)");
  ctx.fillStyle = rightFill;
  ctx.beginPath();
  ctx.roundRect(rightX, y, rightW, chipH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(246,252,255,0.98)";
  ctx.textAlign = "center";
  ctx.font = `800 ${Math.max(12, Math.floor(height * 0.03))}px ${VI_FONT_STACK}`;
  ctx.fillText(
    `Thời gian ${formatSeconds(loop.timeLeft)}`,
    rightX + rightW / 2,
    y + chipH / 2,
  );
}

function drawMap1InteractiveLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  loop: Map1LoopState,
  images: Record<string, HTMLImageElement>,
  draggingTokenId: string | null,
) {
  const t = time / 1000;
  const task = loop.tasks[loop.taskIdx] ?? null;
  const requiredSlotId = task?.mode === "prev" ? "slot-prev" : "slot-next";

  if (task) {
    const anchorX = width * 0.5;
    const anchorY = height * 0.48;
    const anchorW = width * 0.18;
    const anchorH = height * 0.18;

    // Try using sign-board SVG as anchor background
    const signImg = images[MAP1_SIGN_BOARD];
    if (signImg) {
      // Draw the sign-board image centered
      ctx.drawImage(
        signImg,
        anchorX - anchorW / 2,
        anchorY - anchorH / 2,
        anchorW,
        anchorH,
      );
    } else {
      // Fallback: woody panel
      const anchorFill = ctx.createLinearGradient(
        anchorX - anchorW / 2, anchorY - anchorH / 2,
        anchorX - anchorW / 2, anchorY + anchorH / 2,
      );
      anchorFill.addColorStop(0, "rgba(212,165,90,0.95)");
      anchorFill.addColorStop(1, "rgba(166,120,50,0.92)");
      ctx.fillStyle = anchorFill;
      ctx.strokeStyle = "rgba(123,90,52,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(anchorX - anchorW / 2, anchorY - anchorH / 2, anchorW, anchorH, 18);
      ctx.fill();
      ctx.stroke();
    }

    // "Số mốc" label
    ctx.fillStyle = "rgba(91,58,18,0.95)";
    ctx.font = `700 ${Math.max(11, Math.floor(height * 0.024))}px ${VI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Số mốc", anchorX, anchorY - anchorH * 0.18);

    // Big anchor number with decorative circle
    const numR = Math.max(22, anchorH * 0.28);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(anchorX, anchorY + anchorH * 0.12, numR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(91,58,18,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(73,45,11,0.98)";
    ctx.font = `900 ${Math.max(24, Math.floor(numR * 1.5))}px ${VI_FONT_STACK}`;
    ctx.fillText(String(task.anchor), anchorX, anchorY + anchorH * 0.14);

    // Dashed arrow to target slot
    const targetSlot = MAP1_SLOTS.find((slot) => slot.id === requiredSlotId);
    if (targetSlot) {
      const toX = width * targetSlot.x;
      const toY = height * (targetSlot.y - targetSlot.h * 0.5 - 0.02);
      ctx.strokeStyle = "rgba(255,240,173,0.75)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY + anchorH * 0.5);
      ctx.quadraticCurveTo(width * 0.5, height * 0.68, toX, toY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  MAP1_SLOTS.forEach((slot) => {
    const x = width * slot.x - (width * slot.w) / 2;
    const y = height * slot.y - (height * slot.h) / 2;
    const w = width * slot.w;
    const h = height * slot.h;
    const isTarget =
      requiredSlotId === slot.id && !loop.failed && !loop.completed;
    const pulse = 0.2 + 0.12 * (1 + Math.sin(t * 6));

    // Draw the basket SVG as the full slot background
    const slotIconPath =
      slot.kind === "prev" ? MAP1_PREV_SLOT_ICON : MAP1_NEXT_SLOT_ICON;
    const slotIcon = images[slotIconPath];
    if (slotIcon) {
      // Draw basket image filling the entire slot
      ctx.drawImage(slotIcon, x, y, w, h);
    } else {
      // Fallback: draw a rounded rect if image not loaded
      const fill = ctx.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, "rgba(239,195,125,0.9)");
      fill.addColorStop(1, "rgba(166,120,50,0.85)");
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.fill();
    }

    // Highlight border for target slot (pulsing glow)
    if (isTarget) {
      ctx.strokeStyle = `rgba(255,180,50,${0.7 + pulse * 0.3})`;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 20);
      ctx.stroke();

      // Outer glow
      ctx.strokeStyle = `rgba(255,214,120,${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x - 9, y - 9, w + 18, h + 18, 24);
      ctx.stroke();
    }

    // Label text on top of basket
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = `800 ${Math.max(11, Math.floor(height * 0.028))}px ${VI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelBg = ctx.createLinearGradient(x + w * 0.2, y - h * 0.15, x + w * 0.8, y + h * 0.05);
    labelBg.addColorStop(0, "rgba(74,139,74,0.92)");
    labelBg.addColorStop(1, "rgba(58,115,58,0.88)");
    const labelW = w * 0.7;
    const labelH = h * 0.28;
    const labelX = x + (w - labelW) / 2;
    const labelY = y - labelH * 0.6;
    ctx.fillStyle = labelBg;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelW, labelH, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.fillText(
      slot.kind === "prev" ? "⬅ Số liền trước" : "Số liền sau ➡",
      x + w / 2,
      labelY + labelH / 2,
    );
  });

  const tokens = [...loop.tokens].sort((a, b) => a.z - b.z);
  const fixedTokens = tokens.filter((token) => token.id !== draggingTokenId);
  const dragged = tokens.find((token) => token.id === draggingTokenId) ?? null;

  const drawNumberToken = (token: Map1TokenState, idx: number) => {
    const x = token.x * width;
    const baseY = token.y * height;
    const isDragging = dragged && dragged.id === token.id;
    const bob = isDragging ? 0 : Math.sin(t * 2.2 + idx) * 6;
    const scale = isDragging ? 1.08 : 1;
    const y = baseY + bob;
    const w = token.w * width * scale;
    const h = token.h * height * scale;
    const drawX = isDragging ? x - (w - token.w * width) / 2 : x;
    const drawY = isDragging ? y - (h - token.h * height) / 2 : y;

    // Shadow
    const shadowY = drawY + h * 0.92;
    const shadowW = w * 0.6;
    const shadowH = h * 0.1;
    const g = ctx.createRadialGradient(
      drawX + w / 2, shadowY, shadowW * 0.1,
      drawX + w / 2, shadowY, shadowW,
    );
    g.addColorStop(0, "rgba(20,60,20,0.3)");
    g.addColorStop(1, "rgba(20,60,20,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(drawX + w / 2, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Try to draw apple SVG image as token background
    const appleImg = images[MAP1_APPLE_PATHS[idx % MAP1_APPLE_PATHS.length]];
    if (appleImg) {
      ctx.drawImage(appleImg, drawX, drawY, w, h * 0.85);
    } else {
      // Fallback: draw colored card
      const cardFill = ctx.createLinearGradient(drawX, drawY, drawX, drawY + h);
      cardFill.addColorStop(0, `hsla(${token.hue}, 96%, 74%, 0.95)`);
      cardFill.addColorStop(1, `hsla(${token.hue + 18}, 90%, 58%, 0.96)`);
      ctx.fillStyle = cardFill;
      ctx.strokeStyle = "rgba(255,255,255,0.86)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, w, h, 16);
      ctx.fill();
      ctx.stroke();
    }

    // Number badge circle on the apple
    const badgeR = Math.max(16, w * 0.22);
    const badgeX = drawX + w / 2;
    const badgeY = drawY + h * 0.52;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(73,45,11,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Number text
    ctx.fillStyle = "rgba(73,45,11,0.95)";
    ctx.font = `900 ${Math.max(20, Math.floor(badgeR * 1.3))}px ${VI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(token.value), badgeX, badgeY + 1);

    // Dragging indicator glow
    if (isDragging) {
      ctx.strokeStyle = `rgba(255,230,100,${0.5 + Math.sin(t * 8) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(drawX - 4, drawY - 4, w + 8, h + 4, 18);
      ctx.stroke();
    }
  };

  fixedTokens.forEach((token, idx) => drawNumberToken(token, idx));
  if (dragged) drawNumberToken(dragged, fixedTokens.length + 1);

  if (loop.feedback && loop.feedback.until > Date.now()) {
    const alpha = clamp((loop.feedback.until - Date.now()) / 1000, 0, 1);
    const isPositive = loop.feedback.kind !== "wrong";
    ctx.fillStyle = isPositive
      ? `rgba(28,178,89,${0.22 * alpha + 0.18})`
      : `rgba(230,76,60,${0.2 * alpha + 0.2})`;
    ctx.strokeStyle = isPositive
      ? "rgba(34,197,94,0.9)"
      : "rgba(239,68,68,0.9)";
    ctx.lineWidth = 3;
    const boxW = Math.min(width * 0.62, 500);
    const boxH = Math.max(44, height * 0.1);
    const boxX = width * 0.5 - boxW / 2;
    const boxY = height * 0.06;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.font = `800 ${Math.max(14, Math.floor(height * 0.032))}px ${VI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(loop.feedback.text, width * 0.5, boxY + boxH / 2);
  }
}

const SCENES: SceneDef[] = [
  {
    title: "Map 1 — Vườn Số Kỳ Diệu",
    subtitle: "Kéo đúng số vào bên trái hoặc bên phải của số mốc",
    background: MAP1_BG,
    props: [
      { path: MAP1_TREE_BIG, x: 0.0, y: 0.28, w: 0.16, h: 0.40, z: 0 },
      { path: MAP1_TREE_SMALL, x: 0.85, y: 0.34, w: 0.12, h: 0.30, z: 0 },
      { path: MAP1_FENCE, x: 0.10, y: 0.58, w: 0.80, h: 0.08, z: 1 },
      { path: MAP1_FLOWER_RED, x: 0.18, y: 0.60, w: 0.04, h: 0.08, bob: 3, z: 2 },
      { path: MAP1_FLOWER_YELLOW, x: 0.32, y: 0.62, w: 0.035, h: 0.07, bob: 4, z: 2 },
      { path: MAP1_FLOWER_RED, x: 0.58, y: 0.61, w: 0.038, h: 0.076, bob: 3, z: 2 },
      { path: MAP1_FLOWER_YELLOW, x: 0.76, y: 0.60, w: 0.04, h: 0.08, bob: 4, z: 2 },
      { path: MAP1_BUTTERFLY, x: 0.50, y: 0.08, w: 0.06, h: 0.05, bob: 12, z: 5 },
      { path: MAP1_BUTTERFLY, x: 0.25, y: 0.14, w: 0.05, h: 0.04, bob: 10, z: 5 },
      { path: MAP1_SIGN_BOARD, x: 0.42, y: 0.26, w: 0.10, h: 0.12, z: 1 },
      { path: "/robot.png", x: 0.88, y: 0.55, w: 0.10, h: 0.20, bob: 5, z: 3 },
    ],
  },
  {
    title: "Map 2 - Cay Cau So",
    subtitle: "Nhay qua bac da de tim so lien truoc va lien sau",
    background:
      "/assets/matific-pack/map2-dom/map2-bridge/map2-bg-river-bridge.svg",
    props: [
      {
        path: "/assets/matific-pack/map2-dom/map2-bridge/map2-stone-normal.svg",
        x: 0.2,
        y: 0.52,
        w: 0.12,
        h: 0.16,
      },
      {
        path: "/assets/matific-pack/map2-dom/map2-bridge/map2-stone-highlight.svg",
        x: 0.38,
        y: 0.5,
        w: 0.12,
        h: 0.16,
        bob: 6,
      },
      {
        path: "/assets/matific-pack/map2-dom/map2-bridge/map2-stone-cracked.svg",
        x: 0.56,
        y: 0.54,
        w: 0.12,
        h: 0.16,
      },
      { path: "/robot.png", x: 0.72, y: 0.4, w: 0.16, h: 0.3, bob: 10 },
    ],
  },
  {
    title: "Map 3 - Duong Ray Tau So",
    subtitle: "Ghep toa tau vao day so",
    background:
      "/assets/matific-pack/map2-dom/map3-train/map3-bg-trainyard.svg",
    props: [
      {
        path: "/assets/matific-pack/map2-dom/map3-train/map3-locomotive-head.svg",
        x: 0.16,
        y: 0.42,
        w: 0.18,
        h: 0.26,
      },
      {
        path: "/assets/matific-pack/map2-dom/map3-train/map3-wagon-empty.svg",
        x: 0.4,
        y: 0.48,
        w: 0.14,
        h: 0.21,
      },
      {
        path: "/assets/matific-pack/map2-dom/map3-train/map3-wagon-filled.svg",
        x: 0.56,
        y: 0.48,
        w: 0.14,
        h: 0.21,
      },
      { path: "/robot.png", x: 0.76, y: 0.38, w: 0.16, h: 0.3, bob: 8 },
    ],
  },
  {
    title: "Map 4 - Thanh Pho Bong Bay",
    subtitle: "Keo bong bay ve dung vi tri",
    background:
      "/assets/matific-pack/map2-dom/map4-balloon/map4-bg-balloon-city.svg",
    props: [
      {
        path: "/assets/matific-pack/map2-dom/map4-balloon/map4-balloon-blue.svg",
        x: 0.22,
        y: 0.2,
        w: 0.12,
        h: 0.24,
        bob: 18,
      },
      {
        path: "/assets/matific-pack/map2-dom/map4-balloon/map4-balloon-pink.svg",
        x: 0.46,
        y: 0.18,
        w: 0.12,
        h: 0.24,
        bob: 14,
      },
      {
        path: "/assets/matific-pack/map2-dom/map4-balloon/map4-balloon-yellow.svg",
        x: 0.7,
        y: 0.22,
        w: 0.12,
        h: 0.24,
        bob: 20,
      },
      { path: "/robot.png", x: 0.08, y: 0.46, w: 0.16, h: 0.3, bob: 7 },
    ],
  },
  {
    title: "Map 5 - Duong Dua Tho",
    subtitle: "Sap xep tho theo thu tu tang dan",
    background:
      "/assets/matific-pack/map2-dom/map5-rabbit/map5-bg-race-track.svg",
    props: [
      {
        path: "/assets/matific-pack/map2-dom/map5-rabbit/map5-rabbit-token-blue.svg",
        x: 0.22,
        y: 0.46,
        w: 0.12,
        h: 0.2,
        bob: 8,
      },
      {
        path: "/assets/matific-pack/map2-dom/map5-rabbit/map5-rabbit-token-pink.svg",
        x: 0.44,
        y: 0.46,
        w: 0.12,
        h: 0.2,
        bob: 8,
      },
      {
        path: "/assets/matific-pack/map2-dom/map5-rabbit/map5-rabbit-token-green.svg",
        x: 0.66,
        y: 0.46,
        w: 0.12,
        h: 0.2,
        bob: 8,
      },
      {
        path: "/assets/matific-pack/map2-dom/rewards/victory-crown-blue.svg",
        x: 0.78,
        y: 0.12,
        w: 0.14,
        h: 0.14,
      },
    ],
  },
];

function drawMap1Atmosphere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  const t = time / 1000;

  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.64);
  skyGradient.addColorStop(0, "rgba(110,196,243,0.4)");
  skyGradient.addColorStop(1, "rgba(184,236,255,0.05)");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.62);

  const topBand = ctx.createLinearGradient(0, 0, width, 0);
  topBand.addColorStop(0, "rgba(20,134,198,0.2)");
  topBand.addColorStop(0.5, "rgba(53,164,222,0.1)");
  topBand.addColorStop(1, "rgba(20,134,198,0.2)");
  ctx.fillStyle = topBand;
  ctx.fillRect(0, 0, width, height * 0.18);

  // Sunny glow in the top-left to add warmth.
  const sunX = width * 0.14;
  const sunY = height * 0.16;
  const sunRadius = Math.min(width, height) * 0.08;
  const sunGlow = ctx.createRadialGradient(
    sunX,
    sunY,
    sunRadius * 0.2,
    sunX,
    sunY,
    sunRadius * 2.2,
  );
  sunGlow.addColorStop(0, "rgba(255,245,170,0.95)");
  sunGlow.addColorStop(1, "rgba(255,245,170,0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,242,150,0.75)";
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  const rayCount = 7;
  for (let i = 0; i < rayCount; i += 1) {
    const a = t * 0.08 + (i / rayCount) * Math.PI * 2;
    const inner = sunRadius * 1.2;
    const outer = sunRadius * 2.15;
    const tip = sunRadius * 2.7;
    const x1 = sunX + Math.cos(a - 0.08) * inner;
    const y1 = sunY + Math.sin(a - 0.08) * inner;
    const x2 = sunX + Math.cos(a + 0.08) * inner;
    const y2 = sunY + Math.sin(a + 0.08) * inner;
    const x3 = sunX + Math.cos(a) * tip;
    const y3 = sunY + Math.sin(a) * tip;
    const rg = ctx.createLinearGradient(
      sunX + Math.cos(a) * inner,
      sunY + Math.sin(a) * inner,
      sunX + Math.cos(a) * outer,
      sunY + Math.sin(a) * outer,
    );
    rg.addColorStop(0, "rgba(255,246,177,0.2)");
    rg.addColorStop(1, "rgba(255,246,177,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }

  // Soft cloud strips with parallax drift.
  const cloudAlpha = 0.22;
  const cloudY = [0.18, 0.26, 0.12];
  const cloudBaseX = [0.25, 0.62, 0.84];
  const cloudSize = [0.13, 0.17, 0.11];
  for (let i = 0; i < 3; i += 1) {
    const drift = Math.sin(t * (0.28 + i * 0.05) + i * 1.7) * width * 0.018;
    const cx = width * cloudBaseX[i] + drift;
    const cy = height * cloudY[i] + Math.cos(t * 0.3 + i) * 4;
    const rx = width * cloudSize[i];
    const ry = rx * 0.34;
    ctx.fillStyle = `rgba(255,255,255,${cloudAlpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      cx + rx * 0.28,
      cy + 6,
      rx * 0.68,
      ry * 0.86,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.3, cy + 4, rx * 0.62, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far hills for stronger depth separation.
  const hillPalette = [
    "rgba(122,194,104,0.75)",
    "rgba(104,183,90,0.8)",
    "rgba(140,206,114,0.78)",
    "rgba(98,171,81,0.8)",
  ];
  const hillY = [0.67, 0.65, 0.68, 0.65];
  const hillX = [0.12, 0.29, 0.45, 0.62, 0.81];
  for (let i = 0; i < hillX.length; i += 1) {
    const rx = width * (0.062 + (i % 3) * 0.012);
    const ry = height * (0.14 + (i % 2) * 0.012);
    ctx.fillStyle = hillPalette[i % hillPalette.length];
    ctx.beginPath();
    ctx.ellipse(
      width * hillX[i],
      height * hillY[i % hillY.length],
      rx,
      ry,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Ground mist to create depth near bushes.
  const mist = ctx.createLinearGradient(0, height * 0.56, 0, height * 0.8);
  mist.addColorStop(0, "rgba(255,255,255,0.14)");
  mist.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, height * 0.54, width, height * 0.28);

  const laneY = height * 0.58;
  const laneH = height * 0.13;
  const laneFill = ctx.createLinearGradient(0, laneY, 0, laneY + laneH);
  laneFill.addColorStop(0, "rgba(104,185,236,0.23)");
  laneFill.addColorStop(1, "rgba(83,168,226,0.36)");
  ctx.fillStyle = laneFill;
  ctx.beginPath();
  ctx.roundRect(width * 0.07, laneY, width * 0.86, laneH, 28);
  ctx.fill();

  ctx.strokeStyle = "rgba(218,246,255,0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    const sx = width * (0.12 + i * 0.12) + Math.sin(t * 1.1 + i) * 4;
    ctx.beginPath();
    ctx.arc(sx, laneY + laneH * 0.5, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ground texture strips to avoid flat field look.
  const groundTop = height * 0.66;
  for (let i = 0; i < 14; i += 1) {
    const y = groundTop + i * ((height - groundTop) / 14);
    const alpha = 0.03 + (i % 2) * 0.02;
    ctx.fillStyle = `rgba(57,133,49,${alpha})`;
    ctx.fillRect(0, y, width, 6 + (i % 3));
  }

  // Soft grass grain dots.
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 160; i += 1) {
    const x = (i * 97) % width;
    const y = groundTop + ((i * 53) % Math.floor(height - groundTop));
    ctx.fillRect(x, y, 2, 2);
  }

  // Tiny floating pollen to make the orchard feel alive.
  for (let i = 0; i < 18; i += 1) {
    const seed = i * 0.71;
    const x = ((seed * 173 + t * 24) % (width + 40)) - 20;
    const y =
      height * (0.16 + ((seed * 97) % 55) / 100) +
      Math.sin(t * 0.9 + seed * 3) * 10;
    const r = 1.8 + (i % 3) * 0.7;
    ctx.fillStyle =
      i % 3 === 0 ? "rgba(255,216,103,0.72)" : "rgba(197,233,136,0.62)";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3, r * 0.8, t * 0.5 + i, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cinematic vignette.
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.25,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.7,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.26)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawMap1Leaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  leaves: LeafParticle[],
) {
  const t = time / 1000;
  leaves.forEach((leaf, idx) => {
    const xBase = leaf.seedX * width;
    const fall =
      ((leaf.seedY * height + t * leaf.speed * height) % (height * 1.28)) -
      height * 0.14;
    const x = xBase + Math.sin(t * leaf.sway + idx) * (18 + leaf.seedX * 8);
    const y = fall;

    if (y < -20 || y > height + 20) return;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, leaf.size * 1.8);
    glow.addColorStop(0, "rgba(255,247,186,0.48)");
    glow.addColorStop(1, "rgba(255,247,186,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, leaf.size * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.arc(x, y, leaf.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });
}

function useImageMap(paths: string[]) {
  const cacheRef = useRef<Record<string, HTMLImageElement>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    paths.forEach((path) => {
      if (cacheRef.current[path]) return;
      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        cacheRef.current[path] = img;
        setTick((t) => t + 1);
      };
      img.onerror = () => {
        if (!alive) return;
        setTick((t) => t + 1);
      };
      img.src = path;
    });
    return () => {
      alive = false;
    };
  }, [paths]);

  return { images: cacheRef.current, tick };
}

export function NumberSequenceCanvasPreview() {
  const navigate = useNavigate();
  const sound = useGameSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRectRef = useRef({ width: 1, height: 1 });
  const dragRef = useRef<{
    tokenId: string;
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const map1LeavesRef = useRef<LeafParticle[]>(
    Array.from({ length: 18 }, (_, i) => ({
      seedX: ((i * 37) % 100) / 100,
      seedY: ((i * 29) % 100) / 100,
      speed: 0.04 + ((i * 13) % 10) / 120,
      sway: 0.7 + ((i * 17) % 10) / 10,
      size: 6 + (i % 4),
      rot: (i % 5) * 0.18,
      color: ["#B8E07D", "#F4D76C", "#E0C45F", "#9ACB68"][i % 4],
    })),
  );
  const [mapIdx, setMapIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [completed, setCompleted] = useState<number[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [map1Loop, setMap1Loop] = useState<Map1LoopState>(() =>
    createMap1LoopState(),
  );
  const map1LoopRef = useRef<Map1LoopState>(map1Loop);
  const lastTaskVoiceRef = useRef(-1);

  const scene = SCENES[mapIdx];
  const mapMeta = MAPS[mapIdx];

  useEffect(() => {
    map1LoopRef.current = map1Loop;
  }, [map1Loop]);

  const markMapComplete = useCallback((idx: number) => {
    setCompleted((prev) => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx].sort((a, b) => a - b);
      if (next.length >= SCENES.length) {
        setPhase("done");
      }
      return next;
    });
  }, []);

  const resetMap1Loop = useCallback(() => {
    dragRef.current = null;
    lastTaskVoiceRef.current = -1;
    setMap1Loop(createMap1LoopState());
  }, []);

  const speakIfVoiceOn = useCallback(
    (text: string) => {
      if (!voiceOn) return;
      sound.speak(text);
    },
    [sound, voiceOn],
  );

  const allPaths = useMemo(() => {
    const unique = new Set<string>();
    SCENES.forEach((s) => {
      unique.add(s.background);
      s.props.forEach((p) => unique.add(p.path));
    });
    unique.add(MAP1_PREV_SLOT_ICON);
    unique.add(MAP1_NEXT_SLOT_ICON);
    unique.add(MAP1_SIGN_BOARD);
    MAP1_APPLE_PATHS.forEach((p) => unique.add(p));
    unique.add("/assets/matific-pack/map2-dom/rewards/victory-medal-gold.svg");
    unique.add(
      "/assets/matific-pack/map2-dom/rewards/victory-certificate-kids.svg",
    );
    return [...unique];
  }, []);

  const { images } = useImageMap(allPaths);

  useEffect(() => {
    if (phase !== "play") return;
    if (mapIdx !== 0) return;
    resetMap1Loop();
  }, [mapIdx, phase, resetMap1Loop]);

  useEffect(() => {
    if (phase !== "play" || mapIdx !== 0) return;
    if (map1Loop.completed || map1Loop.failed) return;
    if (lastTaskVoiceRef.current === map1Loop.taskIdx) return;

    lastTaskVoiceRef.current = map1Loop.taskIdx;
    const task = map1Loop.tasks[map1Loop.taskIdx];
    if (task) {
      speakIfVoiceOn(
        task.mode === "prev"
          ? `Nhiệm vụ mới. Hãy tìm số liền trước của ${task.anchor}.`
          : `Nhiệm vụ mới. Hãy tìm số liền sau của ${task.anchor}.`,
      );
    }
  }, [map1Loop, mapIdx, phase, speakIfVoiceOn]);

  useEffect(() => {
    if (phase !== "play" || mapIdx !== 0) return;
    const timer = window.setInterval(() => {
      setMap1Loop((prev) => {
        if (prev.completed || prev.failed) return prev;
        const nextTime = Math.max(0, prev.timeLeft - 1);
        if (nextTime > 0) {
          return { ...prev, timeLeft: nextTime };
        }
        sound.wrong();
        speakIfVoiceOn("Het gio roi. Bam choi lai map mot nhe.");
        return {
          ...prev,
          timeLeft: 0,
          failed: true,
          combo: 0,
          streak: 0,
          feedback: {
            kind: "wrong",
            text: "Het gio roi. Bam Choi lai Map 1 nhe!",
            until: Date.now() + 1400,
          },
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [mapIdx, phase, sound, speakIfVoiceOn]);

  const getPointerNorm = useCallback(
    (ev: PointerEvent | React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        x: (ev.clientX - rect.left) / rect.width,
        y: (ev.clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const moveDraggingToken = useCallback((x: number, y: number) => {
    const active = dragRef.current;
    if (!active) return;

    if (
      !active.moved &&
      (Math.abs(x - active.startX) > 0.01 || Math.abs(y - active.startY) > 0.01)
    ) {
      active.moved = true;
    }

    setMap1Loop((prev) => {
      const token = prev.tokens.find((t) => t.id === active.tokenId);
      if (!token) return prev;
      const nextX = clamp(x - active.dx, 0.02, 0.98 - token.w);
      const nextY = clamp(y - active.dy, 0.05, 0.9 - token.h);
      return {
        ...prev,
        tokens: prev.tokens.map((t) =>
          t.id === active.tokenId ? { ...t, x: nextX, y: nextY } : t,
        ),
      };
    });
  }, []);

  const finishDrop = useCallback(() => {
    const active = dragRef.current;
    if (!active) return;
    dragRef.current = null;

    // Tap/click without real drag should not be punished as a wrong attempt.
    if (!active.moved) {
      return;
    }

    let completeNow = false;

    setMap1Loop((prev) => {
      if (prev.completed || prev.failed) return prev;
      const token = prev.tokens.find((t) => t.id === active.tokenId);
      if (!token) return prev;

      sound.drop();

      const centerX = token.x + token.w / 2;
      const centerY = token.y + token.h / 2;
      const task = prev.tasks[prev.taskIdx];
      if (!task) return prev;
      const requiredSlotId = task.mode === "prev" ? "slot-prev" : "slot-next";
      const targetSlot = MAP1_SLOTS.find((slot) =>
        pointInRect(centerX, centerY, {
          x: slot.x - slot.w / 2,
          y: slot.y - slot.h / 2,
          w: slot.w,
          h: slot.h,
        }),
      );

      const tokenHome = { x: token.homeX, y: token.homeY };

      if (
        !targetSlot ||
        targetSlot.id !== requiredSlotId ||
        token.value !== task.answer
      ) {
        sound.wrong();
        speakIfVoiceOn("Chưa đúng rồi, mình thử lại nhé.");
        return {
          ...prev,
          attempts: prev.attempts + 1,
          combo: 0,
          streak: 0,
          timeLeft: Math.max(0, prev.timeLeft - 4),
          tokens: prev.tokens.map((t) =>
            t.id === token.id ? { ...t, x: tokenHome.x, y: tokenHome.y } : t,
          ),
          feedback: {
            kind: "wrong",
            text: "Chưa đúng rồi, thử lại nhé!",
            until: Date.now() + 1100,
          },
        };
      }

      const nextTaskIdx = prev.taskIdx + 1;
      const nextCombo = prev.combo + 1;
      const multiplier = Math.min(3, 1 + nextCombo * 0.25);
      const gain = Math.floor(100 * multiplier);
      const nextStreak = prev.streak + 1;
      const rewardHit = nextStreak > 0 && nextStreak % 3 === 0;
      const isDone = nextTaskIdx >= prev.totalTasks;

      if (isDone) {
        completeNow = true;
        sound.victory();
        speakIfVoiceOn("Tuyệt vời. Con đã hoàn thành map một.");
      } else if (rewardHit) {
        sound.correct();
        speakIfVoiceOn(`Streak ${nextStreak}. Con dang lam rat tot.`);
      } else {
        sound.correct();
        speakIfVoiceOn("Chinh xac.");
      }

      return {
        ...prev,
        taskIdx: Math.min(nextTaskIdx, prev.totalTasks),
        score: prev.score + gain,
        combo: nextCombo,
        bestCombo: Math.max(prev.bestCombo, nextCombo),
        streak: nextStreak,
        timeLeft: Math.min(99, prev.timeLeft + 2),
        completed: isDone,
        tokens: isDone
          ? prev.tokens.map((t) => ({ ...t, x: t.homeX, y: t.homeY }))
          : createMap1Tokens(prev.tasks[nextTaskIdx]),
        feedback: isDone
          ? {
              kind: "success",
              text: `Hoàn thành Map 1! +${gain} điểm`,
              until: Date.now() + 1600,
            }
          : rewardHit
            ? {
                kind: "reward",
                text: `Streak ${nextStreak}! Thưởng combo +${gain}`,
                until: Date.now() + 1200,
              }
            : {
                kind: "success",
                text: `Chính xác! +${gain} điểm`,
                until: Date.now() + 950,
              },
      };
    });

    if (completeNow) {
      markMapComplete(0);
    }
  }, [markMapComplete, sound, speakIfVoiceOn]);

  useEffect(() => {
    if (phase !== "play" || mapIdx !== 0) return;

    const onPointerMove = (ev: PointerEvent) => {
      const p = getPointerNorm(ev);
      if (!p) return;
      moveDraggingToken(p.x, p.y);
    };

    const onPointerUp = () => {
      finishDrop();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [finishDrop, getPointerNorm, mapIdx, moveDraggingToken, phase]);

  const handleCanvasPointerDown = useCallback(
    (ev: React.PointerEvent<HTMLCanvasElement>) => {
      if (phase !== "play" || mapIdx !== 0) return;
      const loop = map1LoopRef.current;
      if (loop.completed || loop.failed) return;

      const p = getPointerNorm(ev);
      if (!p) return;

      const hit = [...loop.tokens]
        .sort((a, b) => b.z - a.z)
        .find((token) => pointInRect(p.x, p.y, token));

      if (!hit) return;

      dragRef.current = {
        tokenId: hit.id,
        dx: p.x - hit.x,
        dy: p.y - hit.y,
        startX: p.x,
        startY: p.y,
        moved: false,
      };

      try {
        ev.currentTarget.setPointerCapture(ev.pointerId);
      } catch {
        // Ignore pointer capture errors on unsupported devices.
      }
      sound.pickup();
    },
    [getPointerNorm, mapIdx, phase, sound],
  );

  useEffect(() => {
    if (phase !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      canvasRectRef.current = { width: rect.width, height: rect.height };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const bg = images[scene.background];
      if (bg) {
        ctx.drawImage(bg, 0, 0, rect.width, rect.height);
      } else {
        ctx.fillStyle = "#c8e9ff";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      if (mapIdx === 0) {
        drawMap1Atmosphere(ctx, rect.width, rect.height, time);
        drawMap1Leaves(
          ctx,
          rect.width,
          rect.height,
          time,
          map1LeavesRef.current,
        );
        drawMap1CanvasHud(ctx, rect.width, rect.height, map1LoopRef.current);
      }

      const ordered = [...scene.props].sort((a, b) => (a.z ?? 1) - (b.z ?? 1));

      ordered.forEach((prop, idx) => {
        const img = images[prop.path];
        if (!img) return;
        const x = prop.x * rect.width;
        const yBase = prop.y * rect.height;
        const y = yBase + Math.sin(time / 700 + idx) * (prop.bob ?? 0);
        const w = prop.w * rect.width;
        const h = prop.h * rect.height;

        if (prop.shadow) {
          const shadowY = y + h * 0.92;
          const shadowW = w * (0.46 + prop.shadow * 0.3);
          const shadowH = h * 0.11;
          const g = ctx.createRadialGradient(
            x + w / 2,
            shadowY,
            shadowW * 0.1,
            x + w / 2,
            shadowY,
            shadowW,
          );
          g.addColorStop(0, "rgba(20,60,20,0.28)");
          g.addColorStop(1, "rgba(20,60,20,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(x + w / 2, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.drawImage(img, x, y, w, h);
      });

      if (mapIdx === 0) {
        drawMap1InteractiveLayer(
          ctx,
          rect.width,
          rect.height,
          time,
          map1LoopRef.current,
          images,
          dragRef.current?.tokenId ?? null,
        );

        const currentTask =
          map1LoopRef.current.tasks[map1LoopRef.current.taskIdx];
        if (
          currentTask &&
          !map1LoopRef.current.completed &&
          !map1LoopRef.current.failed
        ) {
          const bubbleW = Math.min(rect.width * 0.66, 460);
          const bubbleH = Math.max(48, rect.height * 0.1);
          const bubbleX = rect.width * 0.5 - bubbleW / 2;
          const bubbleY = rect.height * 0.855;
          const bubbleFill = ctx.createLinearGradient(
            bubbleX,
            bubbleY,
            bubbleX,
            bubbleY + bubbleH,
          );
          bubbleFill.addColorStop(0, "rgba(14,111,180,0.9)");
          bubbleFill.addColorStop(1, "rgba(10,72,139,0.86)");
          ctx.fillStyle = bubbleFill;
          ctx.strokeStyle = "rgba(197,241,255,0.88)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "rgba(255,255,255,0.98)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `800 ${Math.max(13, Math.floor(rect.height * 0.032))}px ${VI_FONT_STACK}`;
          ctx.fillText(
            `Nhiệm vụ: ${map1TaskText(currentTask)}`,
            rect.width * 0.5,
            bubbleY + bubbleH / 2,
          );
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [images, mapIdx, phase, scene]);

  const stars = completed.length;
  const map1Target = map1TaskText(map1Loop.tasks[map1Loop.taskIdx]);
  const map1ProgressPercent = Math.round(
    (Math.min(map1Loop.taskIdx, map1Loop.totalTasks) /
      Math.max(1, map1Loop.totalTasks)) *
      100,
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#082457] via-[#114e95] to-[#45afd7] p-4 text-white md:p-6"
      style={{ fontFamily: VI_FONT_STACK }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,242,184,0.22),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(125,245,255,0.2),transparent_34%)]" />
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 rounded-[1.7rem] border border-white/60 bg-white/90 p-3 text-slate-800 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => navigate("/student")}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-extrabold transition hover:bg-slate-200"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-sky-700 md:text-base">
              <Sparkles size={16} /> NumberSequence Canvas Tiếng Việt
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-100 px-3 py-2 text-sm font-extrabold text-amber-800">
              <Star size={16} fill="currentColor" /> {stars}/5
            </div>
          </div>
        </div>

        {phase === "intro" && (
          <div className="rounded-[2rem] border border-white/30 bg-white/16 p-8 text-center backdrop-blur-sm">
            <h1 className="text-3xl font-black md:text-4xl">
              Bản xem thử NumberSequence bằng Canvas
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-sky-100">
              Đây là bản test giao diện tiếng Việt và voice AI cho chủ đề số
              liền trước, số liền sau. Bé sẽ kéo thả thẻ số vào đúng vị trí để
              rèn phản xạ nhận biết nhanh.
            </p>
            <button
              onClick={() => {
                setPhase("play");
                speakIfVoiceOn(
                  "Chào con. Chúng ta bắt đầu map một. Hãy kéo đúng số liền trước hoặc số liền sau vào ô tương ứng nhé.",
                );
              }}
              className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-8 py-3 font-black text-slate-900 transition hover:brightness-105"
            >
              Bắt đầu
            </button>
          </div>
        )}

        {phase === "play" && (
          <div className="rounded-[2rem] border border-white/30 bg-white/12 p-4 backdrop-blur-sm md:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-sky-100">
                  {scene.title}
                </p>
                <p className="text-lg font-black md:text-2xl">
                  {mapIdx === 0 ? scene.title : (mapMeta?.name ?? scene.title)}
                </p>
                <p className="text-sm text-sky-100">{scene.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = sound.toggleSound();
                    setSoundOn(next);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:bg-white md:text-sm"
                >
                  {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {soundOn ? "Âm thanh bật" : "Âm thanh tắt"}
                </button>

                <button
                  onClick={() => {
                    const next = sound.toggleVoice();
                    setVoiceOn(next);
                    if (next) {
                      sound.speak("Voice AI da bat.");
                    } else {
                      sound.stopVoice();
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:bg-white md:text-sm"
                >
                  {voiceOn ? <Mic size={16} /> : <MicOff size={16} />}
                  {voiceOn ? "Voice AI bật" : "Voice AI tắt"}
                </button>

                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-800 md:text-sm">
                  {completed.includes(mapIdx) ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : null}
                  {mapIdx + 1}/5
                </div>
              </div>
            </div>

            {mapIdx === 0 && (
              <div className="mb-3 rounded-2xl border border-white/45 bg-white/18 p-3">
                <div className="mb-2 grid grid-cols-2 gap-2 text-xs font-extrabold md:grid-cols-6 md:text-sm">
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    Mục tiêu: {map1Target}
                  </div>
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    Điểm: {map1Loop.score}
                  </div>
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    Combo: x{map1Loop.combo}
                  </div>
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    <span className="inline-flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" /> Streak:{" "}
                      {map1Loop.streak}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} className="text-sky-600" />{" "}
                      {formatSeconds(map1Loop.timeLeft)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/90 px-3 py-2 text-slate-800">
                    Tiến độ: {Math.min(map1Loop.taskIdx, map1Loop.totalTasks)}/
                    {map1Loop.totalTasks}
                  </div>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/35">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-300 to-cyan-300 transition-all duration-300"
                    style={{ width: `${map1ProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-[2rem] border-2 border-cyan-100/65 bg-gradient-to-b from-cyan-100/20 to-sky-100/10 p-2 shadow-[0_20px_45px_rgba(5,38,88,0.32)]">
              <canvas
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                className="h-[clamp(340px,50vw,510px)] w-full rounded-[1.4rem] bg-sky-100"
                style={{ touchAction: "none" }}
              />
            </div>

            {mapIdx === 0 && (
              <p className="mt-3 rounded-xl bg-white/18 px-4 py-2 text-sm font-bold text-sky-50">
                Gợi ý: Quan sát số mốc ở giữa, rồi kéo đúng thẻ số vào ô Số liền
                trước hoặc Số liền sau.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMapIdx((m) => Math.max(0, m - 1))}
                  disabled={mapIdx === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-white disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Map trước
                </button>
                <button
                  onClick={() =>
                    setMapIdx((m) => Math.min(SCENES.length - 1, m + 1))
                  }
                  disabled={mapIdx === SCENES.length - 1}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-extrabold text-slate-800 transition hover:bg-white disabled:opacity-50"
                >
                  Map sau <ChevronRight size={16} />
                </button>
              </div>

              {mapIdx === 0 ? (
                <button
                  onClick={() => {
                    resetMap1Loop();
                    speakIfVoiceOn("Đã khởi động lại map một.");
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-200 to-lime-200 px-4 py-2 text-sm font-black text-slate-900 transition hover:brightness-105"
                >
                  Chơi lại Map 1
                </button>
              ) : (
                <button
                  onClick={() => markMapComplete(mapIdx)}
                  className="rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-2 text-sm font-black text-slate-900 transition hover:brightness-105"
                >
                  Đánh dấu map này đã ổn
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="rounded-[2rem] bg-white/18 p-8 text-center backdrop-blur-sm border border-white/30">
            <img
              src="/assets/matific-pack/map2-dom/rewards/victory-medal-gold.svg"
              alt="Medal"
              className="mx-auto h-28 w-auto"
            />
            <h2 className="mt-2 text-3xl font-black">Preview hoàn tất</h2>
            <p className="mt-2 text-sky-100">
              Bạn đã duyệt xong 5 map canvas preview với asset pack mới.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCompleted([]);
                  setMapIdx(0);
                  setPhase("play");
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-800"
              >
                Test lại
              </button>
              <button
                onClick={() => navigate("/student/game/number-sequence")}
                className="rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-4 py-2 text-sm font-black text-slate-900"
              >
                Qua game NumberSequence hiện tại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
