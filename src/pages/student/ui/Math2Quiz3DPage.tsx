import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Image, OrbitControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useGameSound } from "@/shared/lib/useGameSound";
import "./Math2Quiz3DPage.css";

type HiddenObjectTag = "Sphere" | "Cylinder" | "Wrong";
type HiddenRoomShape = "sphere" | "cylinder" | "box" | "cone";
type HiddenObjectState = "idle" | "shake" | "correct" | "gone";

type HiddenRoomObject = {
  id: string;
  label: string;
  tag: HiddenObjectTag;
  shape: HiddenRoomShape;
  position: [number, number, number];
  color: string;
  state: HiddenObjectState;
};

type HiddenChallengeLevel = {
  id: number;
  targetTags: HiddenObjectTag[];
  targetLabel: string;
  introLine: string;
  successLine: string;
  bgUrl: string;
};

type IntroFocus = "sphere" | "cylinder";

const HIDDEN_LEVELS: HiddenChallengeLevel[] = [
  {
    id: 1,
    targetTags: ["Sphere"],
    targetLabel: "Khối Cầu",
    introLine: "Level 1: Bé hãy tìm tất cả các đồ vật có dạng KHỐI CẦU nhé!",
    successLine: "Hoan hô! Bé đã tìm được hết khối cầu rồi!",
    bgUrl: "/bg_phongdochoi.jpg",
  },
  {
    id: 2,
    targetTags: ["Cylinder"],
    targetLabel: "Khối Trụ",
    introLine: "Level 2: Bé hãy tìm các đồ vật có dạng KHỐI TRỤ nào!",
    successLine: "Tuyệt vời! Các khối trụ đã được thu thập đủ!",
    bgUrl: "/bg_sieuthi.jpg",
  },
  {
    id: 3,
    targetTags: ["Sphere", "Cylinder"],
    targetLabel: "Khối Cầu & Khối Trụ",
    introLine: "Level 3: Thử thách tổng hợp! Bé hãy tìm cả KHỐI CẦU và KHỐI TRỤ nhé!",
    successLine: "Xuất sắc! Bé đã trở thành Chuyên Gia Hình Khối 3D!",
    bgUrl: "/bg_xuongphepthuat.jpg",
  },
];

function getHiddenObjectsForLevel(levelId: number): HiddenRoomObject[] {
  if (levelId === 1) {
    return [
      { id: "ball1", label: "quả bóng", tag: "Sphere", shape: "sphere", position: [-2.2, 1.25, -0.8], color: "#ef4444", state: "idle" },
      { id: "orange", label: "quả cam", tag: "Sphere", shape: "sphere", position: [1.8, 0.85, 0.4], color: "#f97316", state: "idle" },
      { id: "marble", label: "viên bi", tag: "Sphere", shape: "sphere", position: [0.2, 0.65, 1.2], color: "#a855f7", state: "idle" },
      { id: "box1", label: "hộp quà", tag: "Wrong", shape: "box", position: [2.6, 1.15, -1.3], color: "#3b82f6", state: "idle" },
      { id: "cone1", label: "nón chóp", tag: "Wrong", shape: "cone", position: [-1.1, 0.78, 1.1], color: "#a855f7", state: "idle" },
    ];
  }

  if (levelId === 2) {
    return [
      { id: "can1", label: "lon nước", tag: "Cylinder", shape: "cylinder", position: [2.4, 1.12, -0.9], color: "#06b6d4", state: "idle" },
      { id: "milk", label: "hộp sữa", tag: "Cylinder", shape: "cylinder", position: [-2.2, 0.92, 0.2], color: "#fef08a", state: "idle" },
      { id: "cup", label: "cái cốc", tag: "Cylinder", shape: "cylinder", position: [0.2, 1.42, -1.7], color: "#ec4899", state: "idle" },
      { id: "tube", label: "ống giấy", tag: "Cylinder", shape: "cylinder", position: [-0.5, 0.7, 1.15], color: "#10b981", state: "idle" },
      { id: "ball2", label: "quả bóng", tag: "Wrong", shape: "sphere", position: [1.2, 0.75, 0.95], color: "#22c55e", state: "idle" },
    ];
  }

  return [
    { id: "globe", label: "quả địa cầu", tag: "Sphere", shape: "sphere", position: [-2.5, 1.25, -1.1], color: "#3b82f6", state: "idle" },
    { id: "drum", label: "cái trống", tag: "Cylinder", shape: "cylinder", position: [2.5, 1.1, -0.8], color: "#ef4444", state: "idle" },
    { id: "marble2", label: "viên bi", tag: "Sphere", shape: "sphere", position: [1.0, 0.65, 1.35], color: "#a855f7", state: "idle" },
    { id: "pipe", label: "ống nước", tag: "Cylinder", shape: "cylinder", position: [-1.45, 0.72, 0.7], color: "#10b981", state: "idle" },
    { id: "ball3", label: "quả bóng", tag: "Sphere", shape: "sphere", position: [0.2, 1.5, -1.9], color: "#f97316", state: "idle" },
    { id: "can3", label: "lon phép", tag: "Cylinder", shape: "cylinder", position: [2.0, 0.88, 0.6], color: "#22d3ee", state: "idle" },
    { id: "box2", label: "khối lập phương", tag: "Wrong", shape: "box", position: [-0.15, 0.92, -1.1], color: "#b45309", state: "idle" },
    { id: "cone2", label: "khối nón", tag: "Wrong", shape: "cone", position: [0.7, 1.1, 0.2], color: "#fde047", state: "idle" },
  ];
}

function countTargets(objects: HiddenRoomObject[], targetTags: HiddenObjectTag[]): number {
  return objects.filter((item) => targetTags.includes(item.tag)).length;
}

function GameItem({
  obj,
  onClick,
  onCorrectFlyDone,
}: {
  obj: HiddenRoomObject;
  onClick: (id: string, tag: HiddenObjectTag, evt: ThreeEvent<MouseEvent>) => void;
  onCorrectFlyDone: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseYRef = useRef(obj.position[1]);
  const doneRef = useRef(false);

  useEffect(() => {
    baseYRef.current = obj.position[1];
    doneRef.current = false;
  }, [obj.id, obj.position, obj.state]);

  useFrame((state) => {
    if (!meshRef.current) return;

    if (obj.state === "idle") {
      meshRef.current.position.y =
        baseYRef.current + Math.sin(state.clock.elapsedTime * 2 + obj.position[0]) * 0.05;
      meshRef.current.rotation.z = 0;
      meshRef.current.rotation.y += 0.005;
      return;
    }

    if (obj.state === "shake") {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 35) * 0.25;
      return;
    }

    if (obj.state === "correct") {
      meshRef.current.rotation.y += 0.22;
      meshRef.current.rotation.x += 0.14;
      meshRef.current.position.y += 0.045;
      meshRef.current.position.z -= 0.015;
      meshRef.current.scale.multiplyScalar(0.988);

      if (!doneRef.current && meshRef.current.position.y > baseYRef.current + 1.35) {
        doneRef.current = true;
        onCorrectFlyDone(obj.id);
      }
    }
  });

  if (obj.state === "gone") return null;

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      scale={hovered ? 1.2 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(evt) => onClick(obj.id, obj.tag, evt)}
    >
      {obj.shape === "sphere" && <sphereGeometry args={[0.38, 32, 32]} />}
      {obj.shape === "cylinder" && <cylinderGeometry args={[0.31, 0.31, 0.72, 32]} />}
      {obj.shape === "box" && <boxGeometry args={[0.62, 0.62, 0.62]} />}
      {obj.shape === "cone" && <coneGeometry args={[0.42, 0.74, 32]} />}

      <meshStandardMaterial
        color={obj.color}
        roughness={0.3}
        metalness={0.08}
        emissive={hovered ? obj.color : "#000000"}
        emissiveIntensity={hovered ? 0.4 : 0}
      />
    </mesh>
  );
}

export default function Math2Quiz3DPage() {
  const navigate = useNavigate();
  const sound = useGameSound();

  const [phase, setPhase] = useState<"intro-explain" | "menu" | "playing" | "finished">("intro-explain");
  const [levelIndex, setLevelIndex] = useState(0);
  const [hiddenObjects, setHiddenObjects] = useState<HiddenRoomObject[]>([]);
  const [hiddenTargetTotal, setHiddenTargetTotal] = useState(0);
  const [remainingTargetCount, setRemainingTargetCount] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [robotLine, setRobotLine] = useState(
    "Chào bé! Đây là phòng khám phá hình khối. Chạm vào khối cầu hoặc khối trụ để nghe giải thích nhé!",
  );
  const [introFocus, setIntroFocus] = useState<IntroFocus>("sphere");
  const [sphereSplit, setSphereSplit] = useState(0);
  const [cylinderOpen, setCylinderOpen] = useState(0);
  const [sphereExplained, setSphereExplained] = useState(false);
  const [cylinderExplained, setCylinderExplained] = useState(false);

  const timersRef = useRef<number[]>([]);
  const currentHiddenLevel = HIDDEN_LEVELS[levelIndex] ?? HIDDEN_LEVELS[0];

  const progressPercent = useMemo(() => {
    if (hiddenTargetTotal <= 0) return 0;
    const done = hiddenTargetTotal - remainingTargetCount;
    return Math.round((done / hiddenTargetTotal) * 100);
  }, [hiddenTargetTotal, remainingTargetCount]);

  const speakRobot = useCallback(
    (text: string) => {
      setRobotLine(text);
      sound.speak(text, undefined, { rate: 0.78, pitch: 1.15 });
    },
    [sound],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => globalThis.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const startLevel = useCallback(
    (nextLevelIndex: number) => {
      const level = HIDDEN_LEVELS[nextLevelIndex] ?? HIDDEN_LEVELS[0];
      const objects = getHiddenObjectsForLevel(level.id);
      const targetCount = countTargets(objects, level.targetTags);

      setLevelIndex(nextLevelIndex);
      setHiddenObjects(objects);
      setHiddenTargetTotal(targetCount);
      setRemainingTargetCount(targetCount);
      setShowFireworks(false);
      setPhase("playing");
      speakRobot(level.introLine);
    },
    [speakRobot],
  );

  const onStartGame = useCallback(() => {
    sound.click();
    setScore(0);
    setStars(0);
    startLevel(0);
  }, [sound, startLevel]);

  const openLevelMenu = useCallback(() => {
    if (!sphereExplained || !cylinderExplained) {
      speakRobot("Bé cần xem giải thích cả khối cầu và khối trụ trước nhé!");
      return;
    }
    setPhase("menu");
    speakRobot("Bé đã khám phá xong. Bây giờ mình chọn thử thách và bắt đầu 3 level nhé!");
  }, [cylinderExplained, speakRobot, sphereExplained]);

  const explainSphere = useCallback(() => {
    setIntroFocus("sphere");
    setSphereSplit(1);
    setSphereExplained(true);
    speakRobot("Khối cầu tròn đều mọi phía, không có cạnh và không có đỉnh. Ví dụ như quả bóng hoặc viên bi.");
  }, [speakRobot]);

  const explainCylinder = useCallback(() => {
    setIntroFocus("cylinder");
    setCylinderOpen(1);
    setCylinderExplained(true);
    speakRobot(
      "Khối trụ có hai mặt đáy hình tròn và một mặt cong xung quanh. Ví dụ như lon nước, cái cốc hoặc ống giấy.",
    );
  }, [speakRobot]);

  const resetIntroModels = useCallback(() => {
    setSphereSplit(0);
    setCylinderOpen(0);
    speakRobot("Bé có thể xoay để nhìn mô hình từ nhiều hướng, rồi bấm bắt đầu để vào 3 level nhé!");
  }, [speakRobot]);

  const onCorrectFlyDone = useCallback((id: string) => {
    setHiddenObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, state: "gone" } : obj)));
  }, []);

  const handleHiddenObjectClick = useCallback(
    (id: string, tag: HiddenObjectTag, evt: ThreeEvent<MouseEvent>) => {
      if (phase !== "playing") return;
      evt.stopPropagation();

      const picked = hiddenObjects.find((item) => item.id === id);
      if (!picked || picked.state !== "idle") return;

      const isCorrect = currentHiddenLevel.targetTags.includes(tag);

      if (isCorrect) {
        sound.correct();
        setScore((prev) => prev + 20);

        setHiddenObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, state: "correct" } : obj)));

        setRemainingTargetCount((prev) => {
          const next = Math.max(prev - 1, 0);

          if (next <= 0) {
            const isFinalLevel = levelIndex >= HIDDEN_LEVELS.length - 1;
            sound.victory();
            setStars((s) => Math.min(s + 1, 3));
            speakRobot(currentHiddenLevel.successLine);

            if (isFinalLevel) {
              setShowFireworks(true);
              setPhase("finished");
              return next;
            }

            const toNextLevelTimer = globalThis.setTimeout(() => {
              startLevel(levelIndex + 1);
            }, 1400);
            timersRef.current.push(toNextLevelTimer);
            return next;
          }

          speakRobot(`Giỏi quá! Bé cần tìm thêm ${next} đồ vật nữa nhé!`);
          return next;
        });

        return;
      }

      sound.wrong();
      speakRobot("Chưa đúng hình rồi bé ơi, tìm kỹ lại nha!");

      setHiddenObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, state: "shake" } : obj)));

      const resetShakeTimer = globalThis.setTimeout(() => {
        setHiddenObjects((prev) =>
          prev.map((obj) => (obj.id === id && obj.state === "shake" ? { ...obj, state: "idle" } : obj)),
        );
      }, 500);
      timersRef.current.push(resetShakeTimer);
    },
    [currentHiddenLevel, hiddenObjects, levelIndex, phase, sound, speakRobot, startLevel],
  );

  return (
    <div className="l46-page">
      <div className="l46-canvas-wrap">
        <Canvas camera={{ position: [0, 2.3, 7.2], fov: 45 }}>
          <ambientLight intensity={1.05} />
          <directionalLight position={[6, 10, 5]} intensity={1.1} />
          <pointLight position={[-5, 4, 4]} intensity={0.55} color="#93c5fd" />

          {phase === "intro-explain" ? (
            <group>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[18, 11]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.16} />
              </mesh>

              <group
                position={[-2.15, 1.35, 0]}
                onClick={(evt) => {
                  evt.stopPropagation();
                  explainSphere();
                }}
              >
                <mesh position={[-sphereSplit * 0.56, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <sphereGeometry args={[0.85, 40, 40, 0, Math.PI]} />
                  <meshStandardMaterial
                    color={introFocus === "sphere" ? "#f97316" : "#fb923c"}
                    roughness={0.28}
                    metalness={0.06}
                  />
                </mesh>
                <mesh position={[sphereSplit * 0.56, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                  <sphereGeometry args={[0.85, 40, 40, 0, Math.PI]} />
                  <meshStandardMaterial
                    color={introFocus === "sphere" ? "#ea580c" : "#fdba74"}
                    roughness={0.28}
                    metalness={0.06}
                  />
                </mesh>
              </group>

              <group
                position={[2.35, 1.32, 0]}
                onClick={(evt) => {
                  evt.stopPropagation();
                  explainCylinder();
                }}
              >
                <mesh position={[0, 0.58 + cylinderOpen * 0.46, 0]}>
                  <cylinderGeometry args={[0.58, 0.58, 0.15, 40]} />
                  <meshStandardMaterial
                    color={introFocus === "cylinder" ? "#0ea5e9" : "#38bdf8"}
                    roughness={0.2}
                    metalness={0.24}
                  />
                </mesh>

                <mesh>
                  <cylinderGeometry args={[0.58, 0.58, 1.22, 40, 1, true]} />
                  <meshStandardMaterial
                    color={introFocus === "cylinder" ? "#0284c7" : "#7dd3fc"}
                    roughness={0.2}
                    metalness={0.22}
                    transparent
                    opacity={0.95}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                <mesh position={[0, -0.58 - cylinderOpen * 0.46, 0]}>
                  <cylinderGeometry args={[0.58, 0.58, 0.15, 40]} />
                  <meshStandardMaterial
                    color={introFocus === "cylinder" ? "#0369a1" : "#0ea5e9"}
                    roughness={0.2}
                    metalness={0.24}
                  />
                </mesh>
              </group>

              <mesh position={[-2.15, 0.2, 0]}>
                <boxGeometry args={[2.2, 0.16, 1.4]} />
                <meshStandardMaterial color="#fed7aa" />
              </mesh>
              <mesh position={[2.35, 0.2, 0]}>
                <boxGeometry args={[2.2, 0.16, 1.4]} />
                <meshStandardMaterial color="#bae6fd" />
              </mesh>
            </group>
          ) : null}

          {(phase === "playing" || phase === "finished") ? (
            <group>
              <Image
                url={currentHiddenLevel.bgUrl}
                scale={[16.8, 9.6]}
                position={[0, 2.4, -5.6]}
                transparent
                opacity={0.92}
                toneMapped={false}
              />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[16, 10]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
              </mesh>

              {hiddenObjects.map((obj) => (
                <GameItem
                  key={obj.id}
                  obj={obj}
                  onClick={handleHiddenObjectClick}
                  onCorrectFlyDone={onCorrectFlyDone}
                />
              ))}
            </group>
          ) : null}

          <OrbitControls
            enablePan={false}
            minDistance={5.8}
            maxDistance={8.8}
            minPolarAngle={0.68}
            maxPolarAngle={1.5}
          />
        </Canvas>
      </div>

      {phase !== "intro-explain" ? (
      <div className="l46-hud-top">
        <div className="l46-chip">
          {phase === "menu" ? "Menu 3 level" : `Cấp độ ${currentHiddenLevel.id}/3`}
        </div>
        <div className="l46-chip">Điểm: {score}</div>
        <div className="l46-chip">Ngôi sao: {stars}</div>
        <div className="l46-chip">
          {phase === "menu" ? "Sẵn sàng bắt đầu" : `Cần tìm: ${remainingTargetCount}/${hiddenTargetTotal}`}
        </div>
        <button type="button" className="l46-back" onClick={() => navigate("/student")}>Quay lại</button>
      </div>
      ) : null}

      {phase === "playing" ? (
        <div className="l46-mission-panel">
          <div className="l46-mission-title">Nhiệm vụ Level {currentHiddenLevel.id}</div>
          <div className="l46-mission-text">Bé hãy tìm các vật có dạng {currentHiddenLevel.targetLabel}.</div>
          <div className="l46-progress-track">
            <div className="l46-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      ) : null}

      {showFireworks ? <div className="l46-fireworks" aria-hidden="true" /> : null}

      {phase === "finished" ? (
        <div className="l46-win-panel">
          <div className="l46-win-title">Hoàn thành cả 3 level. Bé làm rất giỏi!</div>
          <div className="l46-win-actions">
            <button type="button" className="l46-win-btn" onClick={() => navigate("/student")}>Quay lại</button>
            <button type="button" className="l46-win-btn alt" onClick={() => setPhase("intro-explain")}>Chơi lại</button>
          </div>
        </div>
      ) : null}

      <div className="l46-robot-panel">
        <button
          type="button"
          className="l46-robot-avatar"
          onClick={() =>
            speakRobot(
              phase === "intro-explain"
                ? "Bé hãy chạm vào khối cầu hoặc khối trụ để nghe giải thích, rồi bấm tiếp tục để vào menu 3 level nhé!"
                : phase === "menu"
                ? "Nếu sẵn sàng, bé bấm bắt đầu 3 level nhé!"
                : currentHiddenLevel.introLine,
            )
          }
          aria-label="Robot hướng dẫn"
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
        <div className="l46-robot-bubble">
          <div className="l46-robot-cheer">Robot hướng dẫn</div>
          <div className="l46-robot-sub">{robotLine}</div>
        </div>
      </div>

      {phase === "intro-explain" ? (
        <div className="l46-intro-dock">
          <div className="l46-intro-title">Bài 46: Khối Trụ & Khối Cầu</div>
          <div className="l46-intro-actions">
            <button type="button" className="l46-intro-btn" onClick={explainSphere}>Giải thích khối cầu</button>
            <button type="button" className="l46-intro-btn" onClick={explainCylinder}>Giải thích khối trụ</button>
            <button type="button" className="l46-intro-btn ghost" onClick={resetIntroModels}>Đóng mô hình</button>
          </div>

          {sphereExplained && cylinderExplained ? (
            <button type="button" className="l46-level-start" onClick={openLevelMenu}>
              Tiếp tục tới menu 3 level
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === "menu" ? (
        <div className="l46-level-menu">
          <div className="l46-level-card">
            <div className="l46-level-title">Bài 46: Khối Trụ & Khối Cầu</div>
            <div className="l46-level-subtitle">Chọn đúng hình khối để đồ vật biến mất và vượt qua 3 level.</div>
            <div className="l46-level-list">
              <div className="l46-level-item active">Level 1: Nhận biết Khối Cầu (phòng đồ chơi)</div>
              <div className="l46-level-item">Level 2: Nhận biết Khối Trụ (siêu thị/nhà bếp)</div>
              <div className="l46-level-item">Level 3: Thử thách tổng hợp (xưởng phép thuật)</div>
            </div>

            <button type="button" className="l46-level-start" onClick={onStartGame}>Bắt đầu 3 level</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
