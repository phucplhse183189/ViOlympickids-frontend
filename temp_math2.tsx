import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Image, OrbitControls, Stars } from "@react-three/drei";
import { CylinderGeometry, SphereGeometry } from "three";
import type { BufferGeometry } from "three";
import type { Camera, Object3D } from "three";
import { useGameSound } from "@/shared/lib/useGameSound";
import { AudioManager } from "./lesson46/AudioManager";
import { CylinderUnfolder } from "./lesson46/CylinderUnfolder";
import { HiddenObjectManager, type HiddenObjectTag } from "./lesson46/HiddenObjectManager";
import { InteractionManager } from "./lesson46/InteractionManager";
import { SphereSlicer } from "./lesson46/SphereSlicer";
import "./Math2Quiz3DPage.css";

const CYL_RADIUS = 1.05;
const CYL_HEIGHT = 2.2;
const SPHERE_RADIUS = 1.05;
const ROBOT46_SPEAK_RATE = 0.8;
const ROBOT46_SPEAK_PITCH = 1.2;

const ROBOT46_GREETINGS = [
  "Xin chao nha thiet ke nho! Minh la robot Hinh Khoi.",
  "Hom nay minh se giup con nhin 3D that de hieu hinh khoi.",
  "Con co the xoay vat the bang chuot de nhin moi goc.",
];

const ROBOT46_UNFOLD_START = [
  "Be xem nay, khoi tru dang mo ra nhe!",
  "Canh cong dang trai ra day, hay quan sat ky.",
];

const ROBOT46_UNFOLD_COMPLETE = [
  "Do! Khoi tru mo ra thanh 1 hinh chu nhat va 2 hinh tron!",
  "Con da thay duoc mang luoi cua khoi tru roi do.",
];

const ROBOT46_FOLD_START = [
  "Gio minh cuon lai thanh khoi tru nhe!",
  "Tat ca dang gap lai thanh hinh tru.",
];

const ROBOT46_FOLD_COMPLETE = [
  "Khoi tru da cuon lai xong roi!",
  "Xong! Hinh tru da dong kin.",
];

const ROBOT46_SPHERE_SPLIT = [
  "Qua cau da duoc cat doi roi!",
  "Con thay mat cat hinh tron o giua chua?",
];

const ROBOT46_MISSION_DONE = [
  "Tuyet! Con vua hoan thanh 1 nhiem vu!",
  "Xuat sac! Them 1 ngoi sao nua!",
  "Gioi lam! Con dang tro thanh nha tham hiem 3D roi!",
];

const ROBOT46_SUPER_MODE = [
  "Super Combo! Hai khoi dang mo het cung luc!",
  "Wow, trang thai sieu cap da kich hoat!",
];

type MissionKey = "rotateCylinder" | "rotateSphere" | "openCylinder" | "splitSphere";

type Mission = {
  key: MissionKey;
  label: string;
};

type Lesson46Phase = "lesson3d" | "transition" | "hiddenObject" | "finished";

type HiddenRoomShape = "sphere" | "cylinder" | "box" | "cone";

type HiddenRoomObject = {
  id: string;
  label: string;
  tag: HiddenObjectTag;
  shape: HiddenRoomShape;
  position: [number, number, number];
  color: string;
  state: "idle" | "transforming" | "shake" | "gone";
};

type HiddenChallengeLevel = {
  id: number;
  targetTag: HiddenObjectTag;
  targetLabel: string;
  introLine: string;
  successLine: string;
};

const HIDDEN_OBJECTS_INITIAL: HiddenRoomObject[] = [
  {
    id: "orange",
    label: "qua cam",
    tag: "Sphere",
    shape: "sphere",
    position: [-2.7, 1.1, -1.8],
    color: "#fb923c",
    state: "idle",
  },
  {
    id: "soccer",
    label: "qua bong da",
    tag: "Sphere",
    shape: "sphere",
    position: [-0.8, 1.05, -1.2],
    color: "#f8fafc",
    state: "idle",
  },
  {
    id: "globe",
    label: "qua dia cau",
    tag: "Sphere",
    shape: "sphere",
    position: [1.4, 1.15, -1.65],
    color: "#60a5fa",
    state: "idle",
  },
  {
    id: "gift",
    label: "hop qua",
    tag: "Wrong",
    shape: "box",
    position: [2.5, 1.1, 0.45],
    color: "#f43f5e",
    state: "idle",
  },
  {
    id: "can",
    label: "lon nuoc",
    tag: "Cylinder",
    shape: "cylinder",
    position: [0.1, 1.18, 1.05],
    color: "#22d3ee",
    state: "idle",
  },
  {
    id: "coneHat",
    label: "cai non",
    tag: "Wrong",
    shape: "cone",
    position: [-2.25, 1.2, 1.15],
    color: "#a78bfa",
    state: "idle",
  },
];

const HIDDEN_LEVELS: HiddenChallengeLevel[] = [
  {
    id: 1,
    targetTag: "Sphere",
    targetLabel: "khoi cau",
    introLine: "Level 1. Nhiem vu: cham vao tat ca vat co dang khoi cau.",
    successLine: "Level 1 hoan thanh. Con nhin hinh khoi rat tot!",
  },
  {
    id: 2,
    targetTag: "Cylinder",
    targetLabel: "khoi tru",
    introLine: "Level 2. Tang do kho. Bay gio tim cac vat co dang khoi tru.",
    successLine: "Tuyet voi! Level 2 xong roi.",
  },
  {
    id: 3,
    targetTag: "Sphere",
    targetLabel: "khoi cau nang cao",
    introLine: "Level 3. Chung ket. Tim lai cac khoi cau trong boi canh moi.",
    successLine: "Level cuoi da xong. Ban da vuot qua thu thach 3 cap do!",
  },
];

function getHiddenObjectsForLevel(levelId: number): HiddenRoomObject[] {
  if (levelId === 2) {
    return HIDDEN_OBJECTS_INITIAL.map((item) => {
      if (item.id === "coneHat") {
        return {
          ...item,
          label: "ong nho",
          tag: "Cylinder",
          shape: "cylinder",
          color: "#38bdf8",
          position: [-2.1, 1.18, 1.3],
          state: "idle" as const,
        };
      }
      return { ...item, state: "idle" as const };
    });
  }

  if (levelId === 3) {
    return HIDDEN_OBJECTS_INITIAL.map((item) => {
      if (item.id === "gift") {
        return {
          ...item,
          label: "bong den",
          tag: "Sphere",
          shape: "sphere",
          color: "#fbbf24",
          position: [2.25, 1.2, 0.75],
          state: "idle" as const,
        };
      }

      if (item.id === "orange") {
        return { ...item, position: [-2.95, 1.22, -1.25], state: "idle" as const };
      }

      if (item.id === "globe") {
        return { ...item, position: [1.9, 1.25, -1.15], state: "idle" as const };
      }

      return { ...item, state: "idle" as const };
    });
  }

  return HIDDEN_OBJECTS_INITIAL.map((item) => ({ ...item, state: "idle" as const }));
}

function countTargets(objects: HiddenRoomObject[], targetTag: HiddenObjectTag): number {
  return objects.filter((item) => item.tag === targetTag).length;
}

const MISSIONS: Mission[] = [
  { key: "rotateCylinder", label: "Xoay khoi tru tron 1 vong" },
  { key: "openCylinder", label: "Mo khoi tru het co" },
  { key: "rotateSphere", label: "Xoay khoi cau tron 1 vong" },
  { key: "splitSphere", label: "Tach khoi cau toi da" },
];

function pickRandom(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? "";
}

function GlassMat({ color }: Readonly<{ color: string }>) {
  return (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={0.2}
      roughness={0.15}
      metalness={0.08}
      transmission={0.88}
      clearcoat={0.9}
      clearcoatRoughness={0.12}
    />
  );
}

function VertexDots({
  geometry,
  step = 22,
  size = 0.035,
  palette,
}: Readonly<{
  geometry: BufferGeometry;
  step?: number;
  size?: number;
  palette: string[];
}>) {
  const points = useMemo(() => {
    const attr = geometry.getAttribute("position");
    if (!attr) return [] as Array<[number, number, number]>;

    const unique = new Map<string, [number, number, number]>();
    for (let i = 0; i < attr.count; i += step) {
      const x = attr.getX(i);
      const y = attr.getY(i);
      const z = attr.getZ(i);
      const key = `${x.toFixed(2)}|${y.toFixed(2)}|${z.toFixed(2)}`;
      if (!unique.has(key)) unique.set(key, [x, y, z]);
    }
    return Array.from(unique.values());
  }, [geometry, step]);

  return (
    <group>
      {points.map((point, idx) => (
        <mesh key={`${point[0]}-${point[1]}-${point[2]}`} position={point}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={palette[idx % palette.length]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Math2Quiz3DPage() {
  const navigate = useNavigate();
  const sound = useGameSound();

  const [robotLine, setRobotLine] = useState("Robot Hinh Khoi dang san sang huong dan!");
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const speakRobot = useCallback((line: string) => {
    setRobotLine(line);
    soundRef.current.speak(line, undefined, {
      rate: ROBOT46_SPEAK_RATE,
      pitch: ROBOT46_SPEAK_PITCH,
    });
  }, []);

  const audioManager = useMemo(
    () =>
      new AudioManager({
        onUnfoldStart: () => speakRobot(pickRandom(ROBOT46_UNFOLD_START)),
        onUnfoldComplete: () => speakRobot(pickRandom(ROBOT46_UNFOLD_COMPLETE)),
        onFoldStart: () => speakRobot(pickRandom(ROBOT46_FOLD_START)),
        onFoldComplete: () => speakRobot(pickRandom(ROBOT46_FOLD_COMPLETE)),
        onSphereSplit: () => speakRobot(pickRandom(ROBOT46_SPHERE_SPLIT)),
      }),
    [speakRobot],
  );

  const interactionManager = useMemo(() => new InteractionManager(audioManager), [audioManager]);
  const cylinderUnfolder = useMemo(() => new CylinderUnfolder(CYL_RADIUS, CYL_HEIGHT, 52, 12), []);
  const sphereSlicer = useMemo(() => new SphereSlicer(), []);

  const [unfoldProgress, setUnfoldProgress] = useState(interactionManager.getUnfoldProgress());
  const [sphereSplit, setSphereSplit] = useState(sphereSlicer.getSplitAmount());
  const [cylinderYaw, setCylinderYaw] = useState(0);
  const [sphereYaw, setSphereYaw] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [missionIndex, setMissionIndex] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [isSuperMode, setIsSuperMode] = useState(false);
  const [phase, setPhase] = useState<Lesson46Phase>("lesson3d");
  const [showSceneFade, setShowSceneFade] = useState(false);
  const [hiddenLevelIndex, setHiddenLevelIndex] = useState(0);
  const [hiddenObjects, setHiddenObjects] = useState<HiddenRoomObject[]>(() =>
    getHiddenObjectsForLevel(HIDDEN_LEVELS[0]?.id ?? 1),
  );
  const [hiddenTargetTotal, setHiddenTargetTotal] = useState(() =>
    countTargets(getHiddenObjectsForLevel(HIDDEN_LEVELS[0]?.id ?? 1), HIDDEN_LEVELS[0]?.targetTag ?? "Sphere"),
  );
  const [remainingTargetCount, setRemainingTargetCount] = useState(() =>
    countTargets(getHiddenObjectsForLevel(HIDDEN_LEVELS[0]?.id ?? 1), HIDDEN_LEVELS[0]?.targetTag ?? "Sphere"),
  );
  const [showWinPanel, setShowWinPanel] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const dragTargetRef = useRef<"cylinder" | "sphere" | null>(null);
  const lastXRef = useRef<number | null>(null);
  const swipeStartXRef = useRef<number | null>(null);
  const autoUnfoldDirectionRef = useRef<1 | -1>(1);
  const autoSplitDirectionRef = useRef<1 | -1>(1);
  const superModeCooldownRef = useRef(false);
  const transitionStartedRef = useRef(false);
  const lessonPeakReachedRef = useRef(false);
  const timerRef = useRef<number[]>([]);
  const phaseRef = useRef<Lesson46Phase>("lesson3d");
  const announcedMissionRef = useRef<MissionKey | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const hiddenObjectManager = useMemo(() => new HiddenObjectManager("Sphere"), []);
  const currentHiddenLevel = HIDDEN_LEVELS[hiddenLevelIndex] ?? HIDDEN_LEVELS[0];

  useEffect(() => {
    if (!currentHiddenLevel) return;
    hiddenObjectManager.setTargetTag(currentHiddenLevel.targetTag);
  }, [currentHiddenLevel, hiddenObjectManager]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const unsubscribe = interactionManager.subscribe(() => {
      setUnfoldProgress(interactionManager.getUnfoldProgress());
    });
    return unsubscribe;
  }, [interactionManager]);

  useEffect(() => {
    const hello = pickRandom(ROBOT46_GREETINGS);
    speakRobot(hello);
  }, [speakRobot]);

  useEffect(() => {
    // Mo san mo hinh ngay khi vao bai de be nhin ro cau truc.
    interactionManager.setUnfoldProgress(1);
    sphereSlicer.setSplitAmount(1);
    setSphereSplit(1);
    interactionManager.setSphereSplit(true);
    autoUnfoldDirectionRef.current = -1;
    autoSplitDirectionRef.current = -1;
  }, [interactionManager, sphereSlicer]);

  // Auto animate unfold/fold and sphere split/merge (khong can bam nut)
  useEffect(() => {
    if (phase !== "lesson3d") return;

    let frameId = 0;

    const tick = () => {
      const nowUnfold = interactionManager.getUnfoldProgress();
      let nextUnfold = nowUnfold + autoUnfoldDirectionRef.current * 0.0045;

      if (nextUnfold >= 1) {
        nextUnfold = 1;
        autoUnfoldDirectionRef.current = -1;
      } else if (nextUnfold <= 0) {
        nextUnfold = 0;
        autoUnfoldDirectionRef.current = 1;
      }
      interactionManager.setUnfoldProgress(nextUnfold);

      const nowSplit = sphereSlicer.getSplitAmount();
      let nextSplit = nowSplit + autoSplitDirectionRef.current * 0.0032;
      if (nextSplit >= 1) {
        nextSplit = 1;
        autoSplitDirectionRef.current = -1;
      } else if (nextSplit <= 0) {
        nextSplit = 0;
        autoSplitDirectionRef.current = 1;
      }

      sphereSlicer.setSplitAmount(nextSplit);
      setSphereSplit(nextSplit);
      interactionManager.setSphereSplit(nextSplit > 0.45);

      frameId = globalThis.requestAnimationFrame(tick);
    };

    frameId = globalThis.requestAnimationFrame(tick);
    return () => globalThis.cancelAnimationFrame(frameId);
  }, [interactionManager, phase, sphereSlicer]);

  const sideGeometry = useMemo(() => {
    return cylinderUnfolder.createSideGeometry(unfoldProgress);
  }, [cylinderUnfolder, unfoldProgress]);

  useEffect(() => {
    return () => sideGeometry.dispose();
  }, [sideGeometry]);

  const capTransforms = useMemo(() => {
    return cylinderUnfolder.getCapTransforms(unfoldProgress);
  }, [cylinderUnfolder, unfoldProgress]);

  const topCapGeometry = useMemo(() => new CylinderGeometry(CYL_RADIUS, CYL_RADIUS, 0.06, 52), []);
  const bottomCapGeometry = useMemo(() => new CylinderGeometry(CYL_RADIUS, CYL_RADIUS, 0.06, 52), []);

  useEffect(() => {
    return () => {
      topCapGeometry.dispose();
      bottomCapGeometry.dispose();
    };
  }, [topCapGeometry, bottomCapGeometry]);

  const topHemisphereGeometry = useMemo(
    () => new SphereGeometry(SPHERE_RADIUS, 56, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  );
  const bottomHemisphereGeometry = useMemo(
    () => new SphereGeometry(SPHERE_RADIUS, 56, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    [],
  );

  useEffect(() => {
    return () => {
      topHemisphereGeometry.dispose();
      bottomHemisphereGeometry.dispose();
    };
  }, [topHemisphereGeometry, bottomHemisphereGeometry]);

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (dragTargetRef.current == null || lastXRef.current == null) return;

      const delta = event.clientX - lastXRef.current;
      lastXRef.current = event.clientX;

      if (dragTargetRef.current === "cylinder") {
        setCylinderYaw((prev) => prev + delta * 0.011);
      } else {
        setSphereYaw((prev) => prev + delta * 0.011);
      }
    };

    const onWindowPointerUp = () => {
      if (dragTargetRef.current === "sphere" && swipeStartXRef.current != null && lastXRef.current != null) {
        const deltaX = lastXRef.current - swipeStartXRef.current;
        if (Math.abs(deltaX) > 42) {
          if (deltaX > 0) {
            sphereSlicer.splitStep(0.14);
          } else {
            sphereSlicer.mergeStep(0.14);
          }
          const nextSplit = sphereSlicer.getSplitAmount();
          setSphereSplit(nextSplit);
          interactionManager.setSphereSplit(sphereSlicer.isSplit());
        }
      }

      dragTargetRef.current = null;
      lastXRef.current = null;
      swipeStartXRef.current = null;
      setControlsEnabled(true);
    };

    globalThis.addEventListener("pointermove", onWindowPointerMove);
    globalThis.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      globalThis.removeEventListener("pointermove", onWindowPointerMove);
      globalThis.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [interactionManager, sphereSlicer]);

  const beginShapeRotate = (target: "cylinder" | "sphere") => (event: ThreeEvent<PointerEvent>) => {
    if (phase !== "lesson3d") return;
    event.stopPropagation();
    dragTargetRef.current = target;
    lastXRef.current = event.clientX;
    if (target === "sphere") {
      swipeStartXRef.current = event.clientX;
    }
    setControlsEnabled(false);
  };

  const currentMission = MISSIONS[missionIndex % MISSIONS.length];

  useEffect(() => {
    if (phase !== "lesson3d") return;
    if (!currentMission) return;
    if (announcedMissionRef.current === currentMission.key) return;

    announcedMissionRef.current = currentMission.key;
    speakRobot(`Nhiem vu moi. ${currentMission.label}. Be nghe ky va lam tung buoc nhe.`);
  }, [currentMission, phase, speakRobot]);

  const resetHiddenRound = useCallback((levelIndex: number) => {
    const level = HIDDEN_LEVELS[levelIndex] ?? HIDDEN_LEVELS[0];
    const nextObjects = getHiddenObjectsForLevel(level.id);
    const targetTotal = countTargets(nextObjects, level.targetTag);

    hiddenObjectManager.setTargetTag(level.targetTag);
    setHiddenObjects(nextObjects);
    setHiddenTargetTotal(targetTotal);
    setRemainingTargetCount(targetTotal);
    setShowWinPanel(false);
    setShowFireworks(false);
  }, [hiddenObjectManager]);

  const enterHiddenObjectNow = useCallback(() => {
    setPhase("hiddenObject");
    setShowSceneFade(false);
    resetHiddenRound(hiddenLevelIndex);
    if (currentHiddenLevel) {
      speakRobot(currentHiddenLevel.introLine);
    }
  }, [currentHiddenLevel, hiddenLevelIndex, resetHiddenRound, speakRobot]);

  const queueHiddenObjectTransition = useCallback(
    (delayMs: number, withNarration: boolean) => {
      if (phaseRef.current === "hiddenObject" || phaseRef.current === "finished") return;

      setPhase("transition");
      setShowSceneFade(true);

      if (withNarration) {
        speakRobot(
          "Be gioi qua! Bay gio chung minh vao mini game nhan dien hinh khoi theo tung level nhe!",
        );
      }

      const toHiddenTimer = globalThis.setTimeout(() => {
        if (phaseRef.current === "hiddenObject" || phaseRef.current === "finished") return;
        enterHiddenObjectNow();
      }, delayMs);

      timerRef.current.push(toHiddenTimer);
    },
    [enterHiddenObjectNow, speakRobot],
  );

  useEffect(() => {
    if (phase !== "lesson3d") return;
    if (!currentMission) return;

    const fullTurn = Math.PI * 2;
    let progress = 0;

    if (currentMission.key === "rotateCylinder") {
      progress = Math.min(Math.abs(cylinderYaw) / fullTurn, 1);
    } else if (currentMission.key === "rotateSphere") {
      progress = Math.min(Math.abs(sphereYaw) / fullTurn, 1);
    } else if (currentMission.key === "openCylinder") {
      progress = unfoldProgress;
    } else {
      progress = sphereSplit;
    }

    setMissionProgress(progress);

    if (progress >= 0.98) {
      setMissionIndex((prev) => prev + 1);
      setScore((prev) => prev + 120);
      setStars((prev) => prev + 1);
      soundRef.current.correct();
      speakRobot(pickRandom(ROBOT46_MISSION_DONE));

      if (currentMission.key === "rotateCylinder") {
        setCylinderYaw(0);
      }
      if (currentMission.key === "rotateSphere") {
        setSphereYaw(0);
      }
    }
  }, [currentMission, cylinderYaw, phase, sphereYaw, unfoldProgress, sphereSplit, speakRobot]);

  useEffect(() => {
    if (phase !== "lesson3d") return undefined;

    if (unfoldProgress > 0.9 && sphereSplit > 0.9 && !superModeCooldownRef.current) {
      superModeCooldownRef.current = true;
      setIsSuperMode(true);
      setScore((prev) => prev + 180);
      soundRef.current.victory();
      speakRobot(pickRandom(ROBOT46_SUPER_MODE));

      const offTimer = globalThis.setTimeout(() => {
        setIsSuperMode(false);
      }, 2200);

      const resetTimer = globalThis.setTimeout(() => {
        superModeCooldownRef.current = false;
      }, 3600);

      return () => {
        globalThis.clearTimeout(offTimer);
        globalThis.clearTimeout(resetTimer);
      };
    }

    return undefined;
  }, [phase, unfoldProgress, sphereSplit, speakRobot]);

  useEffect(() => {
    if (phase !== "lesson3d") return;

    if (unfoldProgress > 0.92 && sphereSplit > 0.92) {
      lessonPeakReachedRef.current = true;
    }

    if (!lessonPeakReachedRef.current || transitionStartedRef.current) return;

    transitionStartedRef.current = true;
    queueHiddenObjectTransition(1600, true);
  }, [phase, queueHiddenObjectTransition, sphereSplit, unfoldProgress]);

  const startHiddenObjectPhase = useCallback(() => {
    if (phase === "hiddenObject" || phase === "finished") return;
    const shouldNarrate = !transitionStartedRef.current;
    transitionStartedRef.current = true;
    queueHiddenObjectTransition(1200, shouldNarrate);
  }, [phase, queueHiddenObjectTransition]);

  useEffect(() => {
    if (phase !== "lesson3d" && phase !== "transition") return;

    // Fallback: neu runtime bi ket, van tu dong vao mini-game.
    const fallbackTimer = globalThis.setTimeout(() => {
      startHiddenObjectPhase();
    }, phase === "lesson3d" ? 9000 : 2400);

    timerRef.current.push(fallbackTimer);
    return () => globalThis.clearTimeout(fallbackTimer);
  }, [phase, startHiddenObjectPhase]);

  useEffect(() => {
    return () => {
      timerRef.current.forEach((id) => globalThis.clearTimeout(id));
      timerRef.current = [];
    };
  }, []);

  const markObjectState = useCallback((id: string, state: HiddenRoomObject["state"]) => {
    setHiddenObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;
        return {
          ...obj,
          state,
        };
      }),
    );
  }, []);

  const bindHiddenObjectRef = useCallback(
    (item: HiddenRoomObject) => (node: Object3D | null) => {
      if (!node) {
        hiddenObjectManager.removeObject(item.id);
        return;
      }
      hiddenObjectManager.setObject(item.id, item.label, item.tag, node);
      hiddenObjectManager.setObjectActive(item.id, item.state !== "gone");
    },
    [hiddenObjectManager],
  );

  useEffect(() => {
    hiddenObjects.forEach((item) => {
      hiddenObjectManager.setObjectActive(item.id, item.state !== "gone");
    });
  }, [hiddenObjectManager, hiddenObjects]);

  const handleHiddenRoomPick = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (phase !== "hiddenObject") return;
      if (!cameraRef.current || !canvasWrapRef.current) return;

      const rect = canvasWrapRef.current.getBoundingClientRect();
      const result = hiddenObjectManager.handlePointer(event.clientX, event.clientY, rect, cameraRef.current);

      if (result.kind === "none") return;

      if (result.kind === "wrong") {
        soundRef.current.wrong();
        markObjectState(result.id, "shake");
        const targetName = currentHiddenLevel?.targetLabel ?? "khoi cau";
        speakRobot(`Chua dung roi, ${result.label} khong phai ${targetName}. Be binh tinh tim lai nhe!`);

        const shakeTimer = globalThis.setTimeout(() => {
          markObjectState(result.id, "idle");
        }, 420);
        timerRef.current.push(shakeTimer);
        return;
      }

      soundRef.current.correct();
      setScore((prev) => prev + 90);
      setStars((prev) => prev + 1);

      if (result.id === "soccer") {
        speakRobot("Dung roi! Qua bong da la mot khoi cau rat de nhan ra.");
      } else {
        const targetName = currentHiddenLevel?.targetLabel ?? "khoi cau";
        speakRobot(`Dung roi, ${result.label} thuoc nhom ${targetName}!`);
      }

      markObjectState(result.id, "transforming");

      const goneTimer = globalThis.setTimeout(() => {
        markObjectState(result.id, "gone");
      }, 900);
      timerRef.current.push(goneTimer);

      if (result.kind === "correct") {
        setRemainingTargetCount(result.remainingTargetCount);
        return;
      }

      const currentLevel = currentHiddenLevel ?? HIDDEN_LEVELS[0];
      const isFinalLevel = hiddenLevelIndex >= HIDDEN_LEVELS.length - 1;

      setRemainingTargetCount(0);
      setShowFireworks(true);
      soundRef.current.victory();

      if (!isFinalLevel) {
        const nextLevelIndex = hiddenLevelIndex + 1;
        const nextLevel = HIDDEN_LEVELS[nextLevelIndex];

        speakRobot(`${currentLevel.successLine} Chuan bi. ${nextLevel?.introLine ?? "Bat dau level tiep theo."}`);

        const nextLevelTimer = globalThis.setTimeout(() => {
          setHiddenLevelIndex(nextLevelIndex);
          resetHiddenRound(nextLevelIndex);
          setPhase("hiddenObject");
          setShowFireworks(false);
        }, 1700);
        timerRef.current.push(nextLevelTimer);
        return;
      }

      setShowWinPanel(true);
      setPhase("finished");
      speakRobot("Hoan ho! Ban da vuot qua tat ca level cua bai 46!");

      const fireworksOffTimer = globalThis.setTimeout(() => {
        setShowFireworks(false);
      }, 2600);
      timerRef.current.push(fireworksOffTimer);
    },
    [currentHiddenLevel, hiddenLevelIndex, hiddenObjectManager, markObjectState, phase, resetHiddenRound, speakRobot],
  );

  return (
    <div className={`l46-page ${isSuperMode ? "l46-super" : ""} l46-phase-${phase}`}>
      <div className="l46-canvas-wrap" ref={canvasWrapRef} onPointerDown={handleHiddenRoomPick}>
        <Canvas
          camera={{ position: [8.8, 6.9, 8.8], fov: 42 }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
        >
          <ambientLight intensity={0.62} />
          <directionalLight position={[7, 9, 6]} intensity={1.2} />
          <pointLight position={[-7, 5, -4]} intensity={0.65} color="#93c5fd" />
          <Stars radius={40} depth={18} count={1900} factor={3} saturation={0.4} fade speed={0.7} />

          {(phase === "lesson3d" || phase === "transition") ? (
            <>
              <gridHelper args={[24, 24, "#3b82f6", "#1e3a8a"]} position={[0, 0, 0]} />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
                <planeGeometry args={[28, 22]} />
                <meshStandardMaterial color="#071232" transparent opacity={0.58} />
              </mesh>

              <mesh position={[-3.6, 1.25, -2.05]}>
                <planeGeometry args={[5.1, 4.8]} />
                <meshStandardMaterial color="#0a1f57" transparent opacity={0.55} />
              </mesh>

              <mesh position={[4.2, 1.2, -2.05]}>
                <planeGeometry args={[5.1, 4.8]} />
                <meshStandardMaterial color="#0a1f57" transparent opacity={0.55} />
              </mesh>

              <group position={[-3.6, 1.25, 0]} rotation={[0, cylinderYaw, 0]}>
                <mesh geometry={sideGeometry}>
                  <GlassMat color="#5eead4" />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[sideGeometry]} />
                  <lineBasicMaterial color="#a7f3d0" transparent opacity={0.98} />
                </lineSegments>
                <VertexDots
                  geometry={sideGeometry}
                  step={30}
                  size={0.03}
                  palette={["#22d3ee", "#86efac", "#facc15", "#f472b6"]}
                />

                <group
                  position={capTransforms.topCapPosition.toArray()}
                  rotation={[capTransforms.topCapRotationX, 0, 0]}
                >
                  <mesh geometry={topCapGeometry}>
                    <GlassMat color="#93c5fd" />
                  </mesh>
                  <lineSegments>
                    <edgesGeometry args={[topCapGeometry]} />
                    <lineBasicMaterial color="#bfdbfe" transparent opacity={1} />
                  </lineSegments>
                  <VertexDots
                    geometry={topCapGeometry}
                    step={28}
                    size={0.03}
                    palette={["#22d3ee", "#f472b6", "#fde047", "#a7f3d0"]}
                  />
                </group>

                <group
                  position={capTransforms.bottomCapPosition.toArray()}
                  rotation={[capTransforms.bottomCapRotationX, 0, 0]}
                >
                  <mesh geometry={bottomCapGeometry}>
                    <GlassMat color="#93c5fd" />
                  </mesh>
                  <lineSegments>
                    <edgesGeometry args={[bottomCapGeometry]} />
                    <lineBasicMaterial color="#bfdbfe" transparent opacity={1} />
                  </lineSegments>
                  <VertexDots
                    geometry={bottomCapGeometry}
                    step={28}
                    size={0.03}
                    palette={["#22d3ee", "#f472b6", "#fde047", "#a7f3d0"]}
                  />
                </group>

                <mesh onPointerDown={beginShapeRotate("cylinder")}>
                  <boxGeometry args={[3.6, 2.8, 3.6]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
              </group>

              <group position={[4.2, 1.2, 0]} rotation={[0, sphereYaw, 0]}>
                <mesh position={[-sphereSplit * 1.15, 0, 0]} geometry={topHemisphereGeometry}>
                  <GlassMat color="#60a5fa" />
                </mesh>
                <lineSegments position={[-sphereSplit * 1.15, 0, 0]}>
                  <edgesGeometry args={[topHemisphereGeometry]} />
                  <lineBasicMaterial color="#dbeafe" transparent opacity={0.98} />
                </lineSegments>
                <group position={[-sphereSplit * 1.15, 0, 0]}>
                  <VertexDots
                    geometry={topHemisphereGeometry}
                    step={34}
                    size={0.028}
                    palette={["#22d3ee", "#fbbf24", "#f472b6", "#86efac"]}
                  />
                </group>

                <mesh position={[sphereSplit * 1.15, 0, 0]} geometry={bottomHemisphereGeometry}>
                  <GlassMat color="#60a5fa" />
                </mesh>
                <lineSegments position={[sphereSplit * 1.15, 0, 0]}>
                  <edgesGeometry args={[bottomHemisphereGeometry]} />
                  <lineBasicMaterial color="#dbeafe" transparent opacity={0.98} />
                </lineSegments>
                <group position={[sphereSplit * 1.15, 0, 0]}>
                  <VertexDots
                    geometry={bottomHemisphereGeometry}
                    step={34}
                    size={0.028}
                    palette={["#22d3ee", "#fbbf24", "#f472b6", "#86efac"]}
                  />
                </group>

                <mesh onPointerDown={beginShapeRotate("sphere")}>
                  <sphereGeometry args={[SPHERE_RADIUS * 1.45, 24, 24]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
              </group>
            </>
          ) : null}

          {(phase === "hiddenObject" || phase === "finished") ? (
            <>
              <Image url="/AnhNoi.jpg" scale={[16.2, 9.1]} position={[0, 3.05, -6.2]} toneMapped={false} />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[16, 12]} />
                <meshStandardMaterial color="#f8fafc" transparent opacity={0.25} />
              </mesh>

              {hiddenObjects.map((item) => {
                if (item.state === "gone") return null;

                const isTransforming = item.state === "transforming";
                const shakeRotation: [number, number, number] = item.state === "shake" ? [0, 0, 0.24] : [0, 0, 0];

                return (
                  <mesh key={item.id} ref={bindHiddenObjectRef(item)} position={item.position} rotation={shakeRotation}>
                    {isTransforming ? <sphereGeometry args={[0.52, 24, 24]} /> : null}
                    {!isTransforming && item.shape === "sphere" ? <sphereGeometry args={[0.5, 22, 22]} /> : null}
                    {!isTransforming && item.shape === "cylinder" ? <cylinderGeometry args={[0.34, 0.34, 0.95, 24]} /> : null}
                    {!isTransforming && item.shape === "box" ? <boxGeometry args={[0.92, 0.92, 0.92]} /> : null}
                    {!isTransforming && item.shape === "cone" ? <coneGeometry args={[0.48, 0.96, 24]} /> : null}

                    {isTransforming ? (
                      <meshStandardMaterial color="#93c5fd" wireframe transparent opacity={0.88} />
                    ) : (
                      <meshStandardMaterial color={item.color} />
                    )}
                  </mesh>
                );
              })}
            </>
          ) : null}

          <OrbitControls
            enabled={phase === "lesson3d" ? controlsEnabled : true}
            enablePan={false}
            minDistance={phase === "lesson3d" ? 6 : 7}
            maxDistance={phase === "lesson3d" ? 18 : 16}
            maxPolarAngle={phase === "lesson3d" ? 1.5 : 1.4}
            minPolarAngle={phase === "lesson3d" ? 0.65 : 0.78}
          />
        </Canvas>
      </div>

      <div className="l46-hud-top">
        <div className="l46-chip">Score {score}</div>
        <div className="l46-chip">Stars {stars}</div>
        {phase === "lesson3d" || phase === "transition" ? (
          <>
            <div className="l46-chip">Cylinder {Math.round(unfoldProgress * 100)}%</div>
            <div className="l46-chip">Sphere Split {Math.round(sphereSplit * 100)}%</div>
            {phase === "lesson3d" ? (
              <button
                type="button"
                className="l46-mini-btn"
                onClick={startHiddenObjectPhase}
                disabled={phase !== "lesson3d"}
              >
                Vao mini-game
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="l46-chip">Level {currentHiddenLevel?.id ?? 1}</div>
            <div className="l46-chip">Tim {currentHiddenLevel?.targetLabel ?? "khoi cau"}</div>
            <div className="l46-chip">Con lai {remainingTargetCount}/{hiddenTargetTotal}</div>
          </>
        )}
        <button type="button" className="l46-back" onClick={() => navigate("/student")}>Back</button>
      </div>

      {phase === "lesson3d" || phase === "transition" ? (
        <div className="l46-mission-panel">
          <div className="l46-mission-title">Mission {((missionIndex % MISSIONS.length) + 1).toString()}</div>
          <div className="l46-mission-text">{currentMission.label}</div>
          <div className="l46-progress-track">
            <div className="l46-progress-fill" style={{ width: `${Math.round(missionProgress * 100)}%` }} />
          </div>
        </div>
      ) : (
        <div className="l46-mission-panel">
          <div className="l46-mission-title">Level {currentHiddenLevel?.id ?? 1} / {HIDDEN_LEVELS.length}</div>
          <div className="l46-mission-text">Cham vao do vat dang {currentHiddenLevel?.targetLabel ?? "khoi cau"} de thu thap.</div>
          <div className="l46-progress-track">
            <div
              className="l46-progress-fill"
              style={{
                width: `${Math.round(((hiddenTargetTotal - remainingTargetCount) / Math.max(hiddenTargetTotal, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {isSuperMode ? <div className="l46-super-badge">SUPER COMBO</div> : null}

      {showSceneFade ? <div className="l46-scene-fade" /> : null}
      {showFireworks ? <div className="l46-fireworks" aria-hidden="true" /> : null}

      {showWinPanel ? (
        <div className="l46-win-panel">
          <div className="l46-win-title">Hoan ho! Tim du khoi cau roi!</div>
          <div className="l46-win-actions">
            <button type="button" className="l46-win-btn" onClick={() => navigate("/student")}>Bai hoc tiep theo</button>
            <button
              type="button"
              className="l46-win-btn alt"
              onClick={() => {
                setHiddenLevelIndex(0);
                resetHiddenRound(0);
                setPhase("hiddenObject");
                speakRobot("Minigame moi bat dau! Bat dau lai tu level 1 nhe!");
              }}
            >
              Choi tiep
            </button>
          </div>
        </div>
      ) : null}

      <div className="l46-robot-panel">
        <button
          type="button"
          className="l46-robot-avatar"
          onClick={() => speakRobot(pickRandom(ROBOT46_GREETINGS))}
          aria-label="Robot huong dan"
        >
          <video
            className="l46-robot-video"
            src="/videos/VideoRobotHoatDong.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls={false}
          />
        </button>
        <div className="l46-robot-bubble">{robotLine}</div>
      </div>
    </div>
  );
}
