// ─── Logic sinh dãy số ngẫu nhiên cho game "Biểu đồ dãy số" ─────────────────
// Tách biệt logic tính toán khỏi UI

export interface SequencePuzzle {
  /** Dãy số đầy đủ (đáp án) */
  fullValues: number[];
  /** Chỉ số các vị trí bị khuyết (học sinh cần điền) */
  missingIndices: number[];
  /** Khoảng cách giữa các số (dương = tăng, âm = giảm) */
  step: number;
  /** Cấp độ hiện tại */
  level: number;
}

/**
 * Sinh một dãy số có quy luật cộng/trừ đều.
 *
 * @param level - Cấp độ (1, 2, 3)
 *   - Cấp 1: bước nhảy 1 hoặc 2
 *   - Cấp 2: bước nhảy 5 hoặc 10
 *   - Cấp 3: bước nhảy phức tạp hơn (7, 8, 9, 11, 12)
 * @param length - Số phần tử trong dãy (mặc định 8)
 * @param missingCount - Số vị trí khuyết (mặc định 2)
 */
export function generateSequence(
  level: number,
  length = 8,
  missingCount = 2,
): SequencePuzzle {
  // Chọn bước nhảy theo cấp độ
  const step = pickStep(level);

  // Chọn hướng: tăng hoặc giảm
  const ascending = Math.random() > 0.5;
  const actualStep = ascending ? step : -step;

  // Tính start sao cho tất cả giá trị đều dương và hợp lý cho lớp 2
  const start = ascending
    ? pickAscendingStart(step, length)
    : pickDescendingStart(step, length);

  // Tạo dãy số đầy đủ
  const fullValues: number[] = [];
  for (let i = 0; i < length; i++) {
    fullValues.push(start + i * actualStep);
  }

  // Chọn vị trí khuyết (tránh vị trí đầu và cuối để bé có manh mối)
  const missingIndices = pickMissingIndices(length, missingCount);

  return { fullValues, missingIndices, step: actualStep, level };
}

/** Chọn bước nhảy theo cấp độ */
function pickStep(level: number): number {
  const steps: Record<number, number[]> = {
    1: [1, 2],
    2: [5, 10],
    3: [7, 8, 9, 11, 12],
  };
  const pool = steps[level] ?? steps[3];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Chọn giá trị bắt đầu cho dãy tăng */
function pickAscendingStart(step: number, length: number): number {
  const maxStart = Math.max(1, 150 - (length - 1) * step);
  return randomInt(1, Math.min(maxStart, 40));
}

/** Chọn giá trị bắt đầu cho dãy giảm */
function pickDescendingStart(step: number, length: number): number {
  const minStart = (length - 1) * step + 1;
  return randomInt(minStart, minStart + 40);
}

/** Chọn missingCount vị trí khuyết ngẫu nhiên (tránh index 0 và length-1) */
function pickMissingIndices(length: number, count: number): number[] {
  const candidates: number[] = [];
  for (let i = 1; i < length - 1; i++) {
    candidates.push(i);
  }
  // Shuffle rồi lấy `count` phần tử đầu
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, Math.min(count, candidates.length)).sort((a, b) => a - b);
}

/** Random số nguyên trong khoảng [min, max] */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tính phần trăm chiều cao cột dựa trên giá trị hiện tại
 * so với giá trị lớn nhất trong dãy.
 *
 * @param value - Giá trị hiện tại của cột
 * @param maxValue - Giá trị lớn nhất trong toàn dãy
 * @returns Phần trăm chiều cao (0–100)
 */
export function calcBarHeightPercent(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  // Đảm bảo tối thiểu 5% để cột không biến mất hoàn toàn khi value = 0
  return Math.max(5, (value / maxValue) * 100);
}

/** Tổng số level trong game */
export const TOTAL_LEVELS = 3;
