import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useGameSound } from "@/shared/lib/useGameSound";
import "./Math2Quiz3DPage.css";

type ShapeType = "cylinder" | "sphere";

type LessonRound = {
  id: string;
  label: string;
  shape: ShapeType;
  color: string;
  material: "metal" | "wood" | "soccer";
  hasFlatFace: boolean;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

type RuntimeRefs = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  objectGroup: THREE.Group;
  mainMesh: THREE.Mesh;
  stackMesh: THREE.Mesh;
  floor: THREE.Mesh;
  fireworks: THREE.Points;
  fireworksVelocities: Float32Array;
};

type StackState = "idle" | "drop-success" | "drop-fail";

type AnimationState = {
  rolling: boolean;
  rollStart: number;
  stackState: StackState;
  stackStart: number;
  shake: boolean;
  shakeStart: number;
  firework: boolean;
  fireworkStart: number;
};

const LESSON_ROUNDS: LessonRound[] = [
  {
    id: "can-cylinder",
    label: "Lon nước ngọt",
    shape: "cylinder",
    color: "#14b8a6",
    material: "metal",
    hasFlatFace: true,
  },
  {
    id: "soccer-sphere",
    label: "Quả bóng đá",
    shape: "sphere",
    color: "#f8fafc",
    material: "soccer",
    hasFlatFace: false,
  },
  {
    id: "wood-cylinder",
    label: "Khối gỗ hình trụ",
    shape: "cylinder",
    color: "#d97706",
    material: "wood",
    hasFlatFace: true,
  },
  {
    id: "steel-ball",
    label: "Viên bi thép",
    shape: "sphere",
    color: "#cbd5e1",
    material: "metal",
    hasFlatFace: false,
  },
  {
    id: "pipe-cylinder",
    label: "Ống nhựa hình trụ",
    shape: "cylinder",
    color: "#0ea5e9",
    material: "metal",
    hasFlatFace: true,
  },
];

const YES_NO_OPTIONS = ["Có", "Không"];

const RESULT_CONFETTI = ["🎉", "⭐", "🌟", "🎊", "💫", "✨", "🎈", "🏅"];

function createMeshByRound(round: LessonRound): THREE.Mesh {
  // Each lesson round swaps only geometry/material to keep interaction logic reused.
  const geometry =
    round.shape === "cylinder"
      ? new THREE.CylinderGeometry(0.62, 0.62, 1.38, 48)
      : new THREE.SphereGeometry(0.72, 56, 56);

  let material: THREE.Material;
  if (round.material === "metal") {
    material = new THREE.MeshStandardMaterial({
      color: round.color,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color("#0f172a"),
      emissiveIntensity: 0.1,
    });
  } else if (round.material === "wood") {
    material = new THREE.MeshStandardMaterial({
      color: round.color,
      metalness: 0.06,
      roughness: 0.78,
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: round.color,
      metalness: 0.06,
      roughness: 0.52,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  if (round.material === "soccer") {
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(0.728, 18, 18),
      new THREE.MeshStandardMaterial({
        color: "#0f172a",
        wireframe: true,
        transparent: true,
        opacity: 0.32,
      })
    );
    mesh.add(wire);
  }

  return mesh;
}

function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m: THREE.Material) => m.dispose());
    } else {
      mesh.material?.dispose();
    }
  });
}

function buildRuntime(container: HTMLDivElement, round: LessonRound, onRotate: () => void): RuntimeRefs {
  const scene = new THREE.Scene();
  // Scene bootstrap: renderer, camera, controls, lights and initial meshes.
  scene.background = new THREE.Color("#071226");
  scene.fog = new THREE.Fog("#071226", 6, 14);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.8, 4.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 3.2;
  controls.maxDistance = 6.4;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 2.5;
  controls.addEventListener("change", onRotate);

  const ambient = new THREE.AmbientLight("#ffffff", 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight("#ffffff", 1.4);
  directional.position.set(4, 6, 3);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 1024;
  directional.shadow.mapSize.height = 1024;
  scene.add(directional);

  const point = new THREE.PointLight("#38bdf8", 0.6);
  point.position.set(-4, 3.5, -2);
  scene.add(point);

  const objectGroup = new THREE.Group();
  objectGroup.position.set(0, 0.85, 0);

  const mainMesh = createMeshByRound(round);
  objectGroup.add(mainMesh);

  const stackMesh = createMeshByRound(round);
  stackMesh.position.set(0, 3.2, 0);
  stackMesh.visible = false;
  scene.add(stackMesh);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshStandardMaterial({ color: "#0f172a", transparent: true, opacity: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.08, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const labelSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeLabelTexture(round.label),
      transparent: true,
      opacity: 1,
    })
  );
  labelSprite.scale.set(2.8, 0.68, 1);
  labelSprite.position.set(0, 2.35, 0);
  scene.add(labelSprite);

  const fireworksGeometry = new THREE.BufferGeometry();
  const fireworksCount = 280;
  const positions = new Float32Array(fireworksCount * 3);
  const velocities = new Float32Array(fireworksCount * 3);
  fireworksGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const fireworks = new THREE.Points(
    fireworksGeometry,
    new THREE.PointsMaterial({
      color: "#fef08a",
      size: 0.14,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(fireworks);

  scene.add(objectGroup);

  return {
    scene,
    camera,
    renderer,
    controls,
    objectGroup,
    mainMesh,
    stackMesh,
    floor,
    fireworks,
    fireworksVelocities: velocities,
  };
}

function makeLabelTexture(text: string): THREE.Texture {
  const canvas = globalThis.document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.Texture();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(2,6,23,0.55)";
  roundRect(ctx, 18, 28, 732, 124, 24);
  ctx.fill();

  ctx.strokeStyle = "rgba(186,230,253,0.6)";
  ctx.lineWidth = 4;
  roundRect(ctx, 18, 28, 732, 124, 24);
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 52px 'Trebuchet MS', sans-serif";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function updateIdleMotion(now: number, objectGroup: THREE.Group) {
  objectGroup.position.y = 0.85 + Math.sin(now * 1.4) * 0.08;
  objectGroup.rotation.y += 0.004;
}

function updateRollingMotion({
  now,
  state,
  objectGroup,
  shape,
  onFinish,
}: {
  now: number;
  state: AnimationState;
  objectGroup: THREE.Group;
  shape: ShapeType;
  onFinish: () => void;
}) {
  const t = Math.min(1, (now - state.rollStart) / 1.4);
  const moveX = -2.8 + t * 5.4;
  objectGroup.position.set(moveX, 0.35, shape === "sphere" ? -0.8 + t : 0);

  if (shape === "sphere") {
    objectGroup.rotation.x += 0.09;
    objectGroup.rotation.z += 0.06;
  } else {
    const tilt = Math.min(1, (now - state.rollStart) / 0.35);
    objectGroup.rotation.z = tilt * Math.PI * 0.5;
    if (tilt > 0.98) {
      objectGroup.rotation.x += 0.1;
    }
  }

  if (t >= 1) {
    state.rolling = false;
    objectGroup.position.set(0, 0.85, 0);
    objectGroup.rotation.set(0, 0, 0);
    onFinish();
  }
}

function updateStackMotion(now: number, state: AnimationState, stackMesh: THREE.Mesh) {
  if (state.stackState === "drop-success") {
    const t = Math.min(1, (now - state.stackStart) / 0.7);
    stackMesh.visible = true;
    stackMesh.position.set(0, 3.2 - t * 1.7, 0);
    return;
  }

  if (state.stackState === "drop-fail") {
    const t = Math.min(1, (now - state.stackStart) / 1.1);
    stackMesh.visible = true;
    stackMesh.position.set(0.4 + t * 2.2, 2.8 - t * 2.3, t * 0.8);
    stackMesh.rotation.z = t * Math.PI * 1.35;
    stackMesh.rotation.x = t * Math.PI;
    return;
  }

  stackMesh.visible = false;
  stackMesh.position.set(0, 3.2, 0);
  stackMesh.rotation.set(0, 0, 0);
}

function updateShakeMotion({
  now,
  state,
  objectGroup,
  onFinish,
}: {
  now: number;
  state: AnimationState;
  objectGroup: THREE.Group;
  onFinish: () => void;
}) {
  const t = now - state.shakeStart;
  const amp = 0.12 * Math.exp(-t * 3);
  objectGroup.position.x = Math.sin(t * 36) * amp;
  if (t > 0.55) {
    objectGroup.position.x = 0;
    state.shake = false;
    onFinish();
  }
}

function updateFireworksMotion({
  now,
  state,
  runtime,
  onFinish,
}: {
  now: number;
  state: AnimationState;
  runtime: RuntimeRefs;
  onFinish: () => void;
}) {
  const fireworksMaterial = runtime.fireworks.material as THREE.PointsMaterial;
  if (!state.firework) {
    return;
  }

  const t = now - state.fireworkStart;
  const positions = runtime.fireworks.geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += runtime.fireworksVelocities[i] * 0.022;
    positions[i + 1] += runtime.fireworksVelocities[i + 1] * 0.022;
    positions[i + 2] += runtime.fireworksVelocities[i + 2] * 0.022;
    runtime.fireworksVelocities[i + 1] -= 0.0035;
  }
  runtime.fireworks.geometry.attributes.position.needsUpdate = true;

  fireworksMaterial.opacity = Math.max(0, 1.25 - t * 0.9);
  fireworksMaterial.color.setHSL((t * 0.7) % 1, 0.9, 0.65);
  if (t > 1.45) {
    state.firework = false;
    fireworksMaterial.opacity = 0;
    onFinish();
  }
}

function RobotCharacter({
  message,
  onToggle,
}: Readonly<{
  message: string;
  onToggle: () => void;
}>) {
  return (
    <div className="shape-lab-robot">
      <button type="button" onClick={onToggle} className="shape-lab-robot-btn" aria-label="Mở khung chat robot">
        <video
          className="shape-lab-robot-video"
          src="/videos/VideoRobotHoatDong.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
          disablePictureInPicture
        />
      </button>
      <div className="shape-lab-robot-bubble">
        <p>{message}</p>
      </div>
    </div>
  );
}

function QuizQuestionCard({
  question,
  selectedOption,
  onSelect,
  disabled,
}: Readonly<{
  question: QuizQuestion;
  selectedOption?: string;
  onSelect: (option: string) => void;
  disabled: boolean;
}>) {
  return (
    <div className="shape-lab-question">
      <p>{question.prompt}</p>
      <div className="shape-lab-option-row">
        {question.options.map((opt) => (
          <button
            type="button"
            key={opt}
            className={`shape-lab-option ${selectedOption === opt ? "selected" : ""}`}
            onClick={() => onSelect(opt)}
            disabled={disabled}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function getResultStars(score: number, maxScore: number) {
  if (maxScore <= 0) {
    return 0;
  }

  const ratio = score / maxScore;
  if (ratio >= 0.95) {
    return 3;
  }
  if (ratio >= 0.75) {
    return 2;
  }
  if (ratio >= 0.5) {
    return 1;
  }
  return 0;
}

function getResultRank(stars: number) {
  if (stars === 3) return { label: "🏆 Xuất sắc!", color: "shape-lab-rank-gold" };
  if (stars === 2) return { label: "🌟 Giỏi lắm!", color: "shape-lab-rank-sky" };
  if (stars === 1) return { label: "👍 Cố gắng hơn nhé!", color: "shape-lab-rank-purple" };
  return { label: "💪 Thử lại nhé!", color: "shape-lab-rank-red" };
}

function ResultStar({ lit }: Readonly<{ lit: boolean }>) {
  return <span className={`shape-lab-result-star ${lit ? "lit" : ""}`}>⭐</span>;
}

function ResultOverlay({
  score,
  maxScore,
  onReplay,
  onBackToToc,
}: Readonly<{
  score: number;
  maxScore: number;
  onReplay: () => void;
  onBackToToc: () => void;
}>) {
  const stars = getResultStars(score, maxScore);
  const rank = getResultRank(stars);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const [litStars, setLitStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: `${RESULT_CONFETTI[i % RESULT_CONFETTI.length]}-${Math.random().toString(36).slice(2, 10)}`,
        left: `${(i / 28) * 100}%`,
        delay: `${Math.random() * 1.2}s`,
        duration: `${1.2 + Math.random() * 1.2}s`,
        emoji: RESULT_CONFETTI[i % RESULT_CONFETTI.length],
      })),
    []
  );

  useEffect(() => {
    setLitStars(0);
    setShowConfetti(false);

    const timers = [1, 2, 3].map((n, i) =>
      globalThis.setTimeout(() => {
        if (n <= stars) {
          setLitStars(n);
        }
      }, 300 + i * 400)
    );

    if (stars >= 2) {
      timers.push(globalThis.setTimeout(() => setShowConfetti(true), 420));
    }

    return () => timers.forEach((id) => globalThis.clearTimeout(id));
  }, [stars]);

  return (
    <div className="shape-lab-result-overlay">
      {showConfetti && (
        <div className="shape-lab-result-confetti" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="shape-lab-result-confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            >
              {piece.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="shape-lab-result-card">
        <div className="shape-lab-result-header">Bài 46: Khối trụ và khối cầu</div>
        <div className="shape-lab-result-body">
          <div className="shape-lab-result-emoji">{stars >= 2 ? "🏆" : "🌟"}</div>
          <h2 className={`shape-lab-result-rank ${rank.color}`}>{rank.label}</h2>
          <p className="shape-lab-result-subtitle">
            Bé đã hoàn thành đủ 5 level và đạt <strong>{score}/{maxScore}</strong> điểm
          </p>

          <div className="shape-lab-result-stars">
            {[1, 2, 3].map((i) => (
              <ResultStar key={i} lit={litStars >= i} />
            ))}
          </div>

          <div className="shape-lab-result-stats">
            <div>
              <p>{LESSON_ROUNDS.length}</p>
              <span>Level</span>
            </div>
            <div>
              <p>{score}</p>
              <span>Điểm</span>
            </div>
            <div>
              <p>{percentage}%</p>
              <span>Hiệu suất</span>
            </div>
          </div>

          <div className="shape-lab-result-actions">
            <button type="button" onClick={onBackToToc} className="shape-lab-result-primary">
              Về mục lục
            </button>
            <button type="button" onClick={onReplay} className="shape-lab-result-secondary">
              Chơi lại bài 46
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Math2Quiz3DPage() {
  const navigate = useNavigate();
  const sound = useGameSound();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeRefs | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [rotated, setRotated] = useState(false);
  const [triedRoll, setTriedRoll] = useState(false);
  const [triedStack, setTriedStack] = useState(false);

  const [rolling, setRolling] = useState(false);
  const [shake, setShake] = useState(false);
  const [firework, setFirework] = useState(false);
  const [combo, setCombo] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [message, setMessage] = useState("Xoay khối và thử 2 nút bên dưới để khám phá tính chất!");
  const [robotMsg, setRobotMsg] = useState("Xin chào! Mình là Tí Tách, cùng khám phá khối 3D nhé!");
  const [robotInput, setRobotInput] = useState("");
  const [robotLoading, setRobotLoading] = useState(false);
  const [robotChatOpen, setRobotChatOpen] = useState(false);

  const round = LESSON_ROUNDS[roundIndex];
  const maxScore = useMemo(() => LESSON_ROUNDS.length * 35, []);
  const quizQuestions = useMemo<QuizQuestion[]>(
    () => [
      {
        id: "flat-face",
        prompt: "Khối này có mặt phẳng nào không?",
        options: YES_NO_OPTIONS,
        correctAnswer: round.hasFlatFace ? "Có" : "Không",
      },
      {
        id: "shape-name",
        prompt: "Đây là khối gì?",
        options: ["Khối Trụ", "Khối Cầu"],
        correctAnswer: round.shape === "cylinder" ? "Khối Trụ" : "Khối Cầu",
      },
      {
        id: "roll-many-directions",
        prompt: "Khối này có lăn theo nhiều hướng được không?",
        options: YES_NO_OPTIONS,
        correctAnswer: round.shape === "sphere" ? "Có" : "Không",
      },
      {
        id: "stack-stable",
        prompt: "Khối này có thể xếp chồng vững không?",
        options: YES_NO_OPTIONS,
        correctAnswer: round.hasFlatFace ? "Có" : "Không",
      },
      {
        id: "real-object",
        prompt: "Vật nào giống khối đang quan sát nhất?",
        options: LESSON_ROUNDS.map((item) => item.label),
        correctAnswer: round.label,
      },
    ],
    [round]
  );
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const answeredCount = currentQuestionIndex;
  // Quiz appears only after learner has explored with rotation + both experiments.
  const quizUnlocked = rotated && triedRoll && triedStack;

  const animationState = useRef({
    rolling: false,
    rollStart: 0,
    stackState: "idle" as StackState,
    stackStart: 0,
    shake: false,
    shakeStart: 0,
    firework: false,
    fireworkStart: 0,
  } as AnimationState);

  const resetRoundInteraction = useCallback((nextRoundIndex: number) => {
    setRoundIndex(nextRoundIndex);
    setRotated(false);
    setTriedRoll(false);
    setTriedStack(false);
    setRolling(false);
    setShake(false);
    setFirework(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerLocked(false);
    setMessage("Xoay khối và thử 2 nút bên dưới để khám phá tính chất!");
    setRobotMsg("Xoay khối và thử 2 nút để tìm ra tính chất của hình nhé!");

    animationState.current.rolling = false;
    animationState.current.stackState = "idle";
    animationState.current.shake = false;
    animationState.current.firework = false;
  }, []);

  const restartGame = useCallback(() => {
    setScore(0);
    setCombo(0);
    setGameFinished(false);
    resetRoundInteraction(0);
  }, [resetRoundInteraction]);

  useEffect(() => {
    const intro = "Xin chào! Mình là Tí Tách, cùng khám phá khối trụ và khối cầu nào!";
    setRobotMsg(intro);
    sound.speak(intro);
  }, [sound]);

  useEffect(() => {
    if (!quizUnlocked || gameFinished || !currentQuestion) {
      return;
    }

    const ask = `Câu ${currentQuestionIndex + 1}. ${currentQuestion.prompt}`;
    setRobotMsg(ask);
    sound.speak(ask);
  }, [currentQuestion, currentQuestionIndex, gameFinished, quizUnlocked, sound]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const runtime = buildRuntime(container, round, () => setRotated(true));
    runtimeRef.current = runtime;

    const onResize = () => {
      const current = runtimeRef.current;
      const host = containerRef.current;
      if (!current || !host) {
        return;
      }

      current.camera.aspect = host.clientWidth / host.clientHeight;
      current.camera.updateProjectionMatrix();
      current.renderer.setSize(host.clientWidth, host.clientHeight);
    };

    globalThis.addEventListener("resize", onResize);

    const animate = () => {
      rafRef.current = globalThis.requestAnimationFrame(animate);
      const current = runtimeRef.current;
      if (!current) {
        return;
      }

      timeRef.current += 1 / 60;
      const now = timeRef.current;
      const state = animationState.current;

      const obj = current.objectGroup;
      const stackMesh = current.stackMesh;

      if (!state.rolling && !state.shake && state.stackState === "idle") {
        updateIdleMotion(now, obj);
      }

      if (state.rolling) {
        // Roll test: scripted movement shows rolling behavior differences by shape.
        updateRollingMotion({
          now,
          state,
          objectGroup: obj,
          shape: round.shape,
          onFinish: () => setRolling(false),
        });
      }

      // Stack test: second object lands or slips based on shape behavior.
      updateStackMotion(now, state, stackMesh);

      if (state.shake) {
        updateShakeMotion({
          now,
          state,
          objectGroup: obj,
          onFinish: () => setShake(false),
        });
      }

      // Correct answer reward effect.
      updateFireworksMotion({
        now,
        state,
        runtime: current,
        onFinish: () => setFirework(false),
      });

      current.controls.update();
      current.renderer.render(current.scene, current.camera);
    };

    animate();

    return () => {
      globalThis.removeEventListener("resize", onResize);
      if (rafRef.current) {
        globalThis.cancelAnimationFrame(rafRef.current);
      }

      runtime.controls.dispose();
      runtime.renderer.dispose();
      runtime.scene.clear();
      disposeObject3D(runtime.mainMesh);
      disposeObject3D(runtime.stackMesh);
      runtime.floor.geometry.dispose();
      (runtime.floor.material as THREE.Material).dispose();
      runtime.fireworks.geometry.dispose();
      (runtime.fireworks.material as THREE.Material).dispose();

      if (container.contains(runtime.renderer.domElement)) {
        runtime.renderer.domElement.remove();
      }

      runtimeRef.current = null;
    };
    // Re-init full scene whenever lesson object changes.
  }, [round]);

  const handleRoll = useCallback(() => {
    if (rolling) {
      return;
    }

    const state = animationState.current;
    state.rolling = true;
    state.rollStart = timeRef.current;

    setTriedRoll(true);
    setRolling(true);
    state.stackState = "idle";

    const explain =
      round.shape === "sphere"
        ? "Khối cầu có thể lăn theo nhiều hướng."
        : "Khối trụ cần nằm ngang để lăn mượt.";
    setMessage(explain);
    setRobotMsg(explain);
    sound.speak(explain);
  }, [rolling, round.shape, sound]);

  const handleStack = useCallback(() => {
    const state = animationState.current;
    state.stackStart = timeRef.current;
    setTriedStack(true);

    if (round.shape === "cylinder") {
      state.stackState = "drop-success";
      const explain = "Xếp chồng thành công vì khối trụ có mặt phẳng.";
      setMessage(explain);
      setRobotMsg(explain);
      sound.speak(explain);
    } else {
      state.stackState = "drop-fail";
      const explain = "Khối cầu bị trượt và lăn đi vì không có mặt phẳng.";
      setMessage(explain);
      setRobotMsg(explain);
      sound.speak(explain);
    }
  }, [round.shape, sound]);

  const sendRobotQuestion = useCallback(async () => {
    const trimmed = robotInput.trim();
    if (!trimmed || robotLoading) {
      return;
    }

    setRobotInput("");
    setRobotLoading(true);
    setRobotMsg("Tí Tách đang suy nghĩ...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        throw new Error("AI error");
      }

      const data = await res.json();
      const answer = data?.answer || "Robot chưa nghe rõ. Con hỏi lại được không?";
      setRobotMsg(answer);
      sound.speak(answer);
    } catch {
      const fallback = "Robot đang bận một chút, con thử lại nhé!";
      setRobotMsg(fallback);
      sound.speak(fallback);
    } finally {
      setRobotLoading(false);
    }
  }, [robotInput, robotLoading, sound]);

  const handleSelectAnswer = useCallback((option: string) => {
    if (!currentQuestion || answerLocked) {
      return;
    }

    setSelectedAnswer(option);
    setAnswerLocked(true);

    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      const successMsg = "Đúng rồi!";
      setRobotMsg(successMsg);
      sound.speak(successMsg);

      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < quizQuestions.length) {
        setMessage(`Rất tốt! Con đã hoàn thành câu ${currentQuestionIndex + 1}.`);
        globalThis.setTimeout(() => {
          setSelectedAnswer(null);
          setAnswerLocked(false);
          setCurrentQuestionIndex(nextQuestionIndex);
        }, 520);
        return;
      }

      const state = animationState.current;
      const runtime = runtimeRef.current;

      if (runtime) {
        const positions = runtime.fireworks.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = 0;
          positions[i + 1] = 0.9;
          positions[i + 2] = 0;

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const speed = 0.16 + Math.random() * 0.12;
          runtime.fireworksVelocities[i] = Math.cos(theta) * Math.sin(phi) * speed;
          runtime.fireworksVelocities[i + 1] = Math.cos(phi) * speed + 0.05;
          runtime.fireworksVelocities[i + 2] = Math.sin(theta) * Math.sin(phi) * speed;
        }
        runtime.fireworks.geometry.attributes.position.needsUpdate = true;
      }

      state.firework = true;
      state.fireworkStart = timeRef.current;
      setFirework(true);
      setScore((prev: number) => prev + quizQuestions.length * 5 + combo * 2);
      setCombo((prev) => prev + 1);
      const finishRoundMsg = "Đúng rồi! Nhiệm vụ hoàn thành xuất sắc.";
      setRobotMsg(finishRoundMsg);
      sound.speak(finishRoundMsg);
      setMessage("Quá đỉnh! Hoàn thành nhiệm vụ 5/5, nhận thưởng điểm và mở màn kế tiếp.");

      globalThis.setTimeout(() => {
        const nextRound = roundIndex + 1;
        if (nextRound < LESSON_ROUNDS.length) {
          resetRoundInteraction(nextRound);
        } else {
          const finishMsg = "Bé đã vượt qua toàn bộ thử thách của bài 46!";
          setRobotMsg(finishMsg);
          sound.speak(finishMsg);
          setMessage("Hoàn thành bài 46! Bé đã vượt tất cả nhiệm vụ game và phân biệt rất tốt khối trụ - khối cầu.");
          setGameFinished(true);
        }
      }, 1300);
    } else {
      const state = animationState.current;
      state.shake = true;
      state.shakeStart = timeRef.current;
      setShake(true);
      setCombo(0);
      const retryMsg = "Chưa đúng rồi, cùng quan sát lại và thử thêm lần nữa nhé!";
      setRobotMsg(retryMsg);
      sound.speak(retryMsg);
      setMessage("Chưa đúng rồi, combo về 0. Quan sát lại mô hình và thử lại nhé!");
      globalThis.setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerLocked(false);
      }, 620);
    }
  }, [
    answerLocked,
    combo,
    currentQuestion,
    currentQuestionIndex,
    quizQuestions,
    resetRoundInteraction,
    roundIndex,
    sound,
  ]);

  const roundProgress = useMemo(() => `${roundIndex + 1}/${LESSON_ROUNDS.length}`, [roundIndex]);

  return (
    <div className="shape-lab-page">
      <header className="shape-lab-header">
        <div>
          <p className="shape-lab-kicker">Phòng Thí Nghiệm Khối 3D Của Hiệp Sĩ Nhí</p>
          <h1>Khối trụ và khối cầu</h1>
        </div>
        <div className="shape-lab-score">Điểm: {score} • Combo: {combo} • Màn {roundProgress}</div>
      </header>

      <main className="shape-lab-main">
        <section className="shape-lab-canvas-wrap">
          <div ref={containerRef} className="shape-lab-canvas-host" />
        </section>

        <section className="shape-lab-panel">
          <p className="shape-lab-status">{message}</p>

          <div className="shape-lab-actions">
            <button type="button" onClick={handleRoll} className="shape-lab-btn primary" disabled={rolling}>
              Lăn thử
            </button>
            <button type="button" onClick={handleStack} className="shape-lab-btn secondary">
              Xếp chồng
            </button>
          </div>

          <div className="shape-lab-hints">
            <span className={rotated ? "done" : "todo"}>Xoay quan sát</span>
            <span className={triedRoll ? "done" : "todo"}>Lăn thử</span>
            <span className={triedStack ? "done" : "todo"}>Xếp chồng</span>
          </div>

          {quizUnlocked && (
            <div className="shape-lab-quiz-board">
              <div className="shape-lab-quiz-head">
                <h2>Nhiệm vụ game theo từng câu</h2>
                <p className="shape-lab-feedback">
                  Tiến độ: {answeredCount}/{quizQuestions.length} câu
                </p>
                <div className="shape-lab-quiz-progress">
                  <span
                    style={{
                      width: `${(answeredCount / quizQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {currentQuestion && (
                <div className="shape-lab-quiz">
                  <QuizQuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    selectedOption={selectedAnswer ?? undefined}
                    onSelect={handleSelectAnswer}
                    disabled={answerLocked}
                  />
                  <p className="shape-lab-quiz-auto-note">Chọn đáp án, hệ thống sẽ tự chuyển câu tiếp theo.</p>
                </div>
              )}

              {shake && <p className="shape-lab-feedback">Khối đang lắc nhẹ vì đáp án chưa đúng.</p>}
              {firework && <p className="shape-lab-feedback">Pháo hoa đang bắn, chuẩn bị qua màn mới!</p>}
            </div>
          )}
        </section>
      </main>

      <RobotCharacter message={robotMsg} onToggle={() => setRobotChatOpen((v) => !v)} />

      {robotChatOpen && (
        <div className="shape-lab-chatbox">
          <div className="shape-lab-chatbox-header">Hỏi Tí Tách</div>
          <div className="shape-lab-chatbox-row">
            <input
              value={robotInput}
              onChange={(e) => setRobotInput(e.target.value)}
              placeholder="Ví dụ: Vì sao khối cầu không xếp chồng được?"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void sendRobotQuestion();
                }
              }}
            />
            <button type="button" onClick={() => void sendRobotQuestion()} disabled={robotLoading}>
              {robotLoading ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}

      {gameFinished && (
        <ResultOverlay
          score={score}
          maxScore={maxScore}
          onReplay={restartGame}
          onBackToToc={() => navigate("/student")}
        />
      )}
    </div>
  );
}
