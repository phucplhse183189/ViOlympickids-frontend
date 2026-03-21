import { randInt, shuffle } from "./robotGameLogic";

export interface CanvasSlot {
  id: string;
  expectedValue: number;
  label: string;
}

export interface CanvasToken {
  id: string;
  value: number;
}

export interface CanvasRound {
  id: string;
  prompt: string;
  slots: CanvasSlot[];
  tokens: CanvasToken[];
}

export function validateDrop(
  expectedValue: number,
  tokenValue: number,
): boolean {
  return expectedValue === tokenValue;
}

export function generateCanvasRound(seed: number): CanvasRound {
  const count = 3;
  const base = randInt(8, 35);

  const slotValues = Array.from(
    { length: count },
    (_, idx) => base + idx * randInt(2, 4),
  );
  const slots = slotValues.map((value, idx) => ({
    id: `slot-${seed}-${idx}`,
    expectedValue: value,
    label: `Vị trí ${idx + 1}`,
  }));

  const distractors = new Set<number>();
  while (distractors.size < 2) {
    const pick = base + randInt(-3, 8);
    if (!slotValues.includes(pick) && pick > 0) distractors.add(pick);
  }

  const tokens = shuffle([...slotValues, ...distractors]).map((value, idx) => ({
    id: `token-${seed}-${idx}`,
    value,
  }));

  return {
    id: `round-${seed}`,
    prompt: `Kéo đúng số vào từng ô sáng để hoàn thành bản đồ số #${seed + 1}`,
    slots,
    tokens,
  };
}

export function generateCanvasRounds(totalRounds: number): CanvasRound[] {
  return Array.from({ length: totalRounds }, (_, idx) =>
    generateCanvasRound(idx),
  );
}
