import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Sphere,
  Torus,
  Octahedron,
  Stars,
  Text3D,
  Box,
  Cone,
  Dodecahedron,
} from "@react-three/drei";
import {
  canAccessLesson,
  getMath2LessonPlayRoute,
} from "@/features/student/utils/lessonHelper";
import * as lessonService from "@/features/student/api/lessonService";
import { useNavigate } from "react-router-dom";
import { Play, Lock, Star, Compass, Trophy } from "lucide-react";
import * as THREE from "three";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { speakVietnameseWithCaptionProgress } from "@/features/student/utils/speakVietnameseWithCaption";
import { PreRollAdModal } from "@/shared/ui/PreRollAdModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useLang } from "@/shared/lib/i18n";
import { LessonDetailsModal } from "@/features/student/components/LessonDetailsModal";

// --- 3D Design ---
function FloatingMathShapes() {
  const group = useRef<THREE.Group>(null);
  const bounds = {
    minX: -18,
    maxX: 18,
    minY: -10,
    maxY: 10,
    minZ: -36,
    maxZ: -14,
  };

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = t * 0.04;
      group.current.position.y = Math.sin(t * 0.22) * 1.1;

      group.current.children.forEach((child, index) => {
        if (child.type === "Points") return;

        if (!child.userData.motionInit) {
          child.userData.motionInit = true;
          child.userData.phase = Math.random() * Math.PI * 2;
          child.userData.vx = (Math.random() - 0.5) * 0.12;
          child.userData.vy = (Math.random() - 0.5) * 0.09;
          child.userData.vz = (Math.random() - 0.5) * 0.06;
          child.userData.spin = 0.0025 + Math.random() * 0.004;
        }

        const phase = child.userData.phase as number;
        const wobble = 0.65 + 0.35 * Math.sin(t * (0.8 + index * 0.03) + phase);

        child.position.x += (child.userData.vx as number) * wobble;
        child.position.y +=
          (child.userData.vy as number) * (1.1 - wobble * 0.35);
        child.position.z +=
          (child.userData.vz as number) * (0.7 + wobble * 0.5);

        if (child.position.x < bounds.minX || child.position.x > bounds.maxX) {
          child.userData.vx = -(child.userData.vx as number);
          child.position.x = THREE.MathUtils.clamp(
            child.position.x,
            bounds.minX,
            bounds.maxX,
          );
        }
        if (child.position.y < bounds.minY || child.position.y > bounds.maxY) {
          child.userData.vy = -(child.userData.vy as number);
          child.position.y = THREE.MathUtils.clamp(
            child.position.y,
            bounds.minY,
            bounds.maxY,
          );
        }
        if (child.position.z < bounds.minZ || child.position.z > bounds.maxZ) {
          child.userData.vz = -(child.userData.vz as number);
          child.position.z = THREE.MathUtils.clamp(
            child.position.z,
            bounds.minZ,
            bounds.maxZ,
          );
        }

        child.rotation.x += (child.userData.spin as number) * 0.5;
        child.rotation.y += child.userData.spin as number;
      });
    }
  });

  return (
    <group ref={group}>
      <Stars
        radius={40}
        depth={50}
        count={800}
        factor={6}
        saturation={1}
        fade
        speed={2}
      />

      <Float
        speed={2}
        rotationIntensity={1.5}
        floatIntensity={1}
        position={[-8, 6, -20]}
      >
        <Octahedron args={[2]}>
          <meshStandardMaterial
            color="#60a5fa"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.6}
          />
        </Octahedron>
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={2}
        floatIntensity={1}
        position={[8, -3, -18]}
      >
        <Torus args={[1.5, 0.5, 16, 32]}>
          <meshStandardMaterial
            color="#34d399"
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0.6}
          />
        </Torus>
      </Float>

      <Float
        speed={2.5}
        rotationIntensity={0.5}
        floatIntensity={1}
        position={[-6, -8, -25]}
      >
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </Float>

      <Float
        speed={1}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        position={[0, -5, -35]}
      >
        <Torus args={[10, 2, 32, 64]}>
          <meshStandardMaterial
            color="#e0f2fe"
            roughness={0.4}
            metalness={0.1}
            transparent
            opacity={0.2}
          />
        </Torus>
      </Float>

      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={1}
        position={[-12, 2, -22]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={2}
          height={0.5}
          curveSegments={12}
        >
          1
          <meshStandardMaterial
            color="#f43f5e"
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={0.7}
          />
        </Text3D>
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={0.5}
        floatIntensity={1}
        position={[12, 6, -28]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={3}
          height={0.8}
          curveSegments={12}
        >
          2
          <meshStandardMaterial
            color="#eab308"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.6}
          />
        </Text3D>
      </Float>

      <Float
        speed={2.5}
        rotationIntensity={1.5}
        floatIntensity={1}
        position={[6, -6, -24]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={1.8}
          height={0.4}
          curveSegments={12}
        >
          3
          <meshStandardMaterial
            color="#a855f7"
            roughness={0.1}
            metalness={0.6}
            transparent
            opacity={0.8}
          />
        </Text3D>
      </Float>

      <Float
        speed={1.8}
        rotationIntensity={0.8}
        floatIntensity={1}
        position={[-4, 8, -30]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={2.5}
          height={0.6}
          curveSegments={12}
        >
          5
          <meshStandardMaterial
            color="#2dd4bf"
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.5}
          />
        </Text3D>
      </Float>

      <Float
        speed={2.2}
        rotationIntensity={1.2}
        floatIntensity={1}
        position={[14, -2, -26]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={2.2}
          height={0.5}
          curveSegments={12}
        >
          7
          <meshStandardMaterial
            color="#fb923c"
            roughness={0.3}
            metalness={0.4}
            transparent
            opacity={0.7}
          />
        </Text3D>
      </Float>

      <Float
        speed={1.4}
        rotationIntensity={2}
        floatIntensity={1}
        position={[-10, -5, -28]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={2.8}
          height={0.6}
          curveSegments={12}
        >
          +
          <meshStandardMaterial
            color="#ec4899"
            roughness={0.2}
            metalness={0.3}
            transparent
            opacity={0.7}
          />
        </Text3D>
      </Float>

      <Float
        speed={2}
        rotationIntensity={0.6}
        floatIntensity={1}
        position={[8, 9, -32]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={3}
          height={0.5}
          curveSegments={12}
        >
          =
          <meshStandardMaterial
            color="#60a5fa"
            roughness={0.1}
            metalness={0.7}
            transparent
            opacity={0.5}
          />
        </Text3D>
      </Float>

      <Float
        speed={1.7}
        rotationIntensity={1.1}
        floatIntensity={1}
        position={[-2, -8, -25]}
      >
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={2.4}
          height={0.4}
          curveSegments={12}
        >
          9
          <meshStandardMaterial
            color="#a3e635"
            roughness={0.4}
            metalness={0.2}
            transparent
            opacity={0.7}
          />
        </Text3D>
      </Float>

      {/* More Geometry */}
      <Float
        speed={1.8}
        rotationIntensity={2}
        floatIntensity={1}
        position={[10, -8, -30]}
      >
        <Box args={[2, 2, 2]}>
          <meshStandardMaterial
            color="#8b5cf6"
            roughness={0.1}
            metalness={0.4}
            transparent
            opacity={0.6}
          />
        </Box>
      </Float>

      <Float
        speed={2.5}
        rotationIntensity={1}
        floatIntensity={1}
        position={[-14, 8, -22]}
      >
        <Cone args={[1.5, 3, 32]}>
          <meshStandardMaterial
            color="#fb7185"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
          />
        </Cone>
      </Float>

      <Float
        speed={1.2}
        rotationIntensity={1.5}
        floatIntensity={1}
        position={[4, 5, -34]}
      >
        <Dodecahedron args={[2]}>
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.2}
            metalness={0.5}
            transparent
            opacity={0.5}
          />
        </Dodecahedron>
      </Float>
    </group>
  );
}

function Math2Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] transition-colors duration-1000"
        id="dynamic-bg"
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sky-400/20 to-transparent blur-3xl opacity-50" />

      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <directionalLight
          position={[-10, -5, -10]}
          intensity={0.5}
          color="#60a5fa"
        />
        <FloatingMathShapes />
      </Canvas>
    </div>
  );
}

// --- Main Page Component ---
export function Math2TableOfContents() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { activeChild } = useActiveChild();
  const [selectedLesson, setSelectedLesson] = useState<{
    lesson: any;
    topic: any;
  } | null>(null);

  const queryClient = useQueryClient();
  const mapQueryKey = ["student", "learning-map", activeChild?.id || "none"] as const;
  const mapQuery = useQuery({ queryKey: mapQueryKey, queryFn: ({ signal }) => lessonService.getStudentMap(activeChild!.id, signal), enabled: Boolean(activeChild), staleTime: 30_000, refetchOnWindowFocus: true, retry: 2 });
  const topics = mapQuery.data?.topics ?? [];
  const completedIdsSet = useMemo(() => new Set(mapQuery.data?.completedLessonIds ?? []), [mapQuery.data?.completedLessonIds]);

  useEffect(() => {
    const bump = () => void queryClient.invalidateQueries({ queryKey: mapQueryKey });
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener("math2-progress-updated", bump);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("math2-progress-updated", bump);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [queryClient, activeChild?.id]);

  const [showAd, setShowAd] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const activeProgress = useMemo(() => {
    if (!activeChild) {
      return {
        completedIds: new Set<string>(),
        nextLessonId: null,
        robotLessonId: null,
        robotAllDone: false,
      };
    }
    let next: string | null = null;
    for (const topic of topics) {
      for (const lesson of topic.lessons) {
        if (
          canAccessLesson(lesson as any, activeChild.plan) &&
          !completedIdsSet.has(lesson.id)
        ) {
          next = lesson.id;
          break;
        }
      }
      if (next) break;
    }

    let robotLesson: string | null = next;
    const preferredRobotLesson = "math2-b2";
    const canUsePreferred = topics.some((topic) =>
      topic.lessons.some(
        (lesson) =>
          lesson.id === preferredRobotLesson &&
          canAccessLesson(lesson as any, activeChild.plan),
      ),
    );
    if (canUsePreferred) {
      robotLesson = preferredRobotLesson;
    }

    if (!robotLesson) {
      for (const topic of topics) {
        for (const lesson of topic.lessons) {
          if (canAccessLesson(lesson as any, activeChild.plan)) {
            robotLesson = lesson.id;
          }
        }
      }
    }

    return {
      completedIds: completedIdsSet,
      nextLessonId: next,
      robotLessonId: robotLesson,
      robotAllDone:
        next === null && robotLesson !== null && completedIdsSet.has(robotLesson),
    };
  }, [completedIdsSet, topics, activeChild?.plan]);

  const completedIds = activeProgress.completedIds;
  const nextLessonId = activeProgress.nextLessonId;
  const robotLessonId = activeProgress.robotLessonId;
  const robotAllDone = activeProgress.robotAllDone;

  const robotCurrentLesson = useMemo(() => {
    if (!robotLessonId) return null;
    for (const topic of topics) {
      for (const lesson of topic.lessons) {
        if (lesson.id === robotLessonId) {
          return { lesson: lesson as any, topic: topic as any };
        }
      }
    }
    return null;
  }, [robotLessonId, topics]);

  const childDisplayName = useMemo(() => {
    const n = activeChild?.name?.trim();
    return n && n.length > 0 ? n : "bạn";
  }, [activeChild?.name]);

  const robotSpeechText = useMemo(() => {
    if (robotAllDone) {
      return `Tuyệt vời, ${childDisplayName}! Bé đã học xong cả lộ trình đang mở rồi!`;
    }
    if (robotCurrentLesson) {
      return `Chào ${childDisplayName}! Tí Tách đang ở Bài ${robotCurrentLesson.lesson.lessonNumber}, mình cùng học nhé!`;
    }
    return `Chào ${childDisplayName}! Tí Tách đợi cậu ở bài này nhé!`;
  }, [childDisplayName, robotAllDone, robotCurrentLesson]);

  const [robotCaptionLen, setRobotCaptionLen] = useState(0);
  const [robotSpeechPlaying, setRobotSpeechPlaying] = useState(false);

  useEffect(() => {
    if (!robotLessonId) return;
    setRobotCaptionLen(0);
    setRobotSpeechPlaying(false);
    let cancelCaption: (() => void) | null = null;
    const arm = window.setTimeout(() => {
      setRobotSpeechPlaying(true);
      cancelCaption = speakVietnameseWithCaptionProgress(
        robotSpeechText,
        setRobotCaptionLen,
        () => setRobotSpeechPlaying(false),
      );
    }, 550);
    return () => {
      window.clearTimeout(arm);
      cancelCaption?.();
      setRobotSpeechPlaying(false);
      window.speechSynthesis?.cancel();
    };
  }, [robotLessonId, robotSpeechText]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // For SVG Path
  const [nodePositions, setNodePositions] = useState<
    { x: number; y: number }[]
  >([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topicRefs = useRef<(HTMLDivElement | null)[]>([]);

  const robotNodeIndex = useMemo(() => {
    if (!robotLessonId) return null;
    let idx = 0;
    for (const topic of topics) {
      idx += 1; // topic portal
      for (const lesson of topic.lessons) {
        if (lesson.id === robotLessonId) return idx;
        idx += 1;
      }
    }
    return null;
  }, [robotLessonId, topics]);

  // Smooth dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Update SVG line positions
  const updatePositions = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;

    // Create an inner wrapper to track coordinates relative to the scroll content width
    const scrollContent = container.firstChild as HTMLDivElement;
    if (!scrollContent) return;

    const containerRect = scrollContent.getBoundingClientRect();

    const positions = nodeRefs.current
      .map((el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        // Relative to the scroll content itself (0 is the very left edge of the entire scrollable area)
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      })
      .filter(Boolean) as { x: number; y: number }[];

    setNodePositions(positions);
  }, []);

  useEffect(() => {
    // The map data arrives asynchronously. Measure once React has committed
    // the lesson nodes, then once more after the browser finishes layout.
    updatePositions();
    const frame = window.requestAnimationFrame(() => {
      updatePositions();
      window.requestAnimationFrame(updatePositions);
    });
    window.addEventListener("resize", updatePositions);
    // Observe DOM changes (like images loading or fonts rendering causing shifts)
    const observer = new ResizeObserver(updatePositions);
    if (scrollRef.current?.firstChild) {
      observer.observe(scrollRef.current.firstChild as Element);
    }
    nodeRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    const timeout = setTimeout(updatePositions, 500); // safety fallback

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [updatePositions, topics]);

  useEffect(() => {
    if (robotNodeIndex == null || !scrollRef.current) return;
    const el = nodeRefs.current[robotNodeIndex];
    if (!el) return;

    const arm = window.setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetLeft =
        container.scrollLeft +
        (elRect.left - containerRect.left) -
        containerRect.width / 2 +
        elRect.width / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }, 240);

    return () => window.clearTimeout(arm);
  }, [activeChild?.id, robotNodeIndex]);

  // Generate SVG Path String
  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
  }

  // Quick jump scrolling
  const scrollToTopic = (index: number) => {
    const el = topicRefs.current[index];
    if (el && scrollRef.current) {
      // Smooth scroll to the topic portal
      const container = scrollRef.current;
      const scrollContent = container.firstChild as HTMLDivElement;
      const scrollContentRect = scrollContent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      // Calculate target scroll left: element's left relative to scroll content minus some padding
      const targetScrollLeft = elRect.left - scrollContentRect.left - 100;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  };

  let globalCount = 0;

  const modalL = selectedLesson?.lesson ?? null;
  const modalPlayRoute = modalL ? getMath2LessonPlayRoute(modalL) : null;
  const modalCanStart = Boolean(
    modalL &&
    activeChild &&
    canAccessLesson(modalL, activeChild.plan) &&
    modalPlayRoute,
  );

  if (!activeChild) return null;

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] overflow-hidden bg-slate-900 font-sans selection:bg-sky-500/30">
      <Math2Background3D />

      {/* Header */}
      <div className="absolute top-8 left-0 w-full text-center z-20 pointer-events-none px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)] mb-3 tracking-tight">
          Hành trình Toán 2
        </h1>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg">
          <Compass className="text-sky-300" size={14} />
          <p className="text-xs md:text-sm text-sky-100 font-bold tracking-wide">
            Click giữ chuột và kéo qua lại để khám phá
          </p>
        </div>
        
        {/* Leaderboard Button */}
        <button
          onClick={() => navigate("/student/leaderboard")}
          className="mt-4 pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_4px_0_#b45309] hover:shadow-[0_2px_0_#b45309] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Trophy size={18} />
          Bảng Xếp Hạng Quiz
        </button>
      </div>

      {/* Main Drag/Scroll Container */}
      <div
        ref={scrollRef}
        className={`relative z-10 w-full h-full overflow-x-auto overflow-y-hidden hide-scrollbar flex items-center pt-24 pb-32 ${isDragging ? "cursor-grabbing select-none scroll-auto" : "cursor-grab scroll-smooth"}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="relative flex flex-row items-center w-max h-full px-24 md:px-48 gap-16 md:gap-[clamp(8rem,15vw,16rem)] min-h-[500px]">
          {/* S V G   P A T H */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10"
            style={{ minWidth: "100%" }}
          >
            {/* Glowing background path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
            {/* Dashed trail */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20 20"
              className="animate-[dash_10s_linear_infinite]"
            />
            {/* Active Progress Path (Simulation) */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20 20"
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="30%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Dynamic Topics */}
          {topics.map((topic, tIdx) => {
            const portalIdx = globalCount++;

            return (
              <div
                key={topic.id}
                className="flex flex-row items-center h-full gap-16 md:gap-[clamp(8rem,15vw,16rem)] relative"
              >
                {/* --- TOPIC PORTAL (Gateway) --- */}
                <div
                  ref={(el) => {
                    nodeRefs.current[portalIdx] = el;
                    topicRefs.current[tIdx] = el;
                  }}
                  className="relative z-20 shrink-0 transform hover:-translate-y-4 transition-all duration-500 ease-out flex items-center justify-center p-4 group"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${topic.color || "from-sky-400 to-indigo-500"} rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`}
                  ></div>

                  <div className="relative flex flex-col items-center justify-center w-64 md:w-80 h-[380px] bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.4)] overflow-hidden cursor-default">
                    {/* Glass glare */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[3rem]"></div>

                    <div className="bg-white/20 p-6 rounded-3xl shadow-inner backdrop-blur-md border border-white/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-6xl md:text-7xl drop-shadow-2xl block animate-[float_4s_ease-in-out_infinite]">
                        {topic.emoji}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center px-6">
                      <div className="px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-4 shadow-inner border border-white/10 flex items-center gap-2">
                        <Star size={14} fill="currentColor" /> Chủ đề{" "}
                        {topic.topicNumber}{" "}
                        <Star size={14} fill="currentColor" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-tight">
                        {topic.title}
                      </h2>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* --- LESSON NODES (Levels) --- */}
                {topic.lessons.map((lesson) => {
                  const idx = globalCount++;
                  // Beautiful sweeping sine wave, wider and taller
                  const offsetY = Math.sin((idx * Math.PI) / 3) * 120;

                  const isLocked = !canAccessLesson(lesson as any, activeChild.plan);
                  const isCompleted = completedIds.has(lesson.id);
                  const isNextUp = lesson.id === nextLessonId;

                  return (
                    <div
                      key={lesson.id}
                      ref={(el) => {
                        nodeRefs.current[idx] = el;
                      }}
                      className="relative flex flex-col items-center justify-center shrink-0 z-20"
                      style={{ transform: `translateY(${offsetY}px)` }}
                    >
                      {/* Tactile 3D Button wrapper */}
                      <div className="relative group">
                        {/* Robot Tí Tách — đánh dấu bài hiện tại trên roadmap */}
                        {lesson.id === robotLessonId && !isLocked && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-[45] mb-4 flex w-[min(280px,84vw)] -translate-x-1/2 flex-col items-center">
                            <div className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-50/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-700 shadow-[0_6px_14px_rgba(2,132,199,0.25)]">
                              <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                              Bài hiện tại
                            </div>

                            <div className="relative mb-2 rounded-3xl border border-white/70 bg-gradient-to-b from-white to-sky-50/95 px-3.5 py-2.5 shadow-[0_14px_36px_rgba(8,47,73,0.35)] backdrop-blur-md ring-1 ring-cyan-200/60">
                              <p
                                className="min-h-[2.7rem] max-w-[min(250px,76vw)] text-left text-[10.5px] font-black leading-snug text-sky-900 md:min-h-[2.9rem] md:text-xs"
                                role="status"
                                aria-live="polite"
                              >
                                {robotSpeechText.slice(0, robotCaptionLen)}
                                {robotSpeechPlaying &&
                                robotCaptionLen < robotSpeechText.length ? (
                                  <span
                                    className="robot-caption-caret ml-0.5 inline-block h-3 w-0.5 translate-y-px bg-sky-600 align-middle md:h-3.5"
                                    aria-hidden
                                  />
                                ) : null}
                              </p>
                              <span
                                className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-cyan-100 bg-sky-50"
                                aria-hidden
                              />
                              <span
                                className="absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-200 to-transparent"
                                aria-hidden
                              />
                            </div>
                          </div>
                        )}
                        {/* Aura glow for unlocked/completed */}
                        {!isLocked && (
                          <div
                            className={`absolute -inset-4 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isCompleted ? "bg-yellow-400" : "bg-sky-400"}`}
                          ></div>
                        )}

                        <button
                          onClick={() => {
                            if (!isLocked) setSelectedLesson({ lesson: lesson as any, topic: topic as any });
                          }}
                          className={`
                              relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold
                              transition-all duration-300 outline-none
                              ${
                                isLocked
                                  ? "bg-slate-300 border-4 border-slate-400/50 shadow-[0_8px_0_#94a3b8,0_15px_20px_rgba(0,0,0,0.2)] text-slate-500 cursor-not-allowed"
                                  : isCompleted
                                    ? "bg-gradient-to-b from-amber-200 to-yellow-400 border-[6px] border-white shadow-[0_12px_0_#b45309,0_15px_30px_rgba(0,0,0,0.4)] text-amber-900 group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_0_#b45309,0_25px_40px_rgba(0,0,0,0.4)] active:translate-y-[8px] active:shadow-[0_4px_0_#b45309,0_5px_10px_rgba(0,0,0,0.4)]"
                                    : "bg-gradient-to-b from-sky-300 to-blue-500 border-[6px] border-white shadow-[0_12px_0_#1d4ed8,0_15px_30px_rgba(0,0,0,0.4)] text-white group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_0_#1d4ed8,0_25px_40px_rgba(0,0,0,0.4)] active:translate-y-[8px] active:shadow-[0_4px_0_#1d4ed8,0_5px_10px_rgba(0,0,0,0.4)]"
                              }
                            `}
                        >
                          <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] group-active:scale-95 transition-transform origin-center">
                            {isLocked ? (
                              <Lock size={36} className="text-slate-400" />
                            ) : lesson.id === robotLessonId ? (
                              <img
                                src="/robot-head.png"
                                alt="Tí Tách"
                                className="h-16 w-16 object-contain md:h-20 md:w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
                                loading="lazy"
                              />
                            ) : (
                              lesson.emoji
                            )}
                          </span>

                          {/* Glass reflection bubble on the button */}
                          <div className="absolute top-1 right-2 w-8 h-8 bg-white/40 rounded-full blur-[2px] z-20 pointer-events-none"></div>
                          <div className="absolute top-2 right-4 w-3 h-3 bg-white/60 rounded-full z-20 pointer-events-none"></div>

                          {/* Crown/Star for completed */}
                          {isCompleted && !isLocked && (
                            <div className="absolute -top-4 -right-2 bg-gradient-to-br from-yellow-300 to-amber-500 text-white rounded-full p-2 animate-[bounce_2s_infinite] shadow-lg border-[3px] border-white z-30">
                              <Star size={18} fill="currentColor" />
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Lesson Label underneath */}
                      <div className="absolute top-[120%] flex flex-col items-center w-max max-w-[200px] pointer-events-none z-20">
                        <span className="bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm md:text-base font-bold px-5 py-2 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.3)] drop-shadow-md">
                          Bài {lesson.lessonNumber}
                        </span>
                        {!isLocked && !isCompleted && isNextUp && (
                          <span className="text-sky-200 text-xs font-bold mt-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm animate-pulse">
                            Vừa mở khóa!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- QUICK JUMP SIDEBAR / BOTTOM BAR --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-500">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-1.5 md:p-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-row items-center justify-center gap-1.5 md:gap-2 overflow-x-auto max-w-[90vw] hide-scrollbar">
          {topics.map((t, index) => (
            <button
              key={t.id}
              onClick={() => scrollToTopic(index)}
              title={t.title}
              className="relative group shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/20 border border-transparent hover:border-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <span className="text-xl md:text-2xl drop-shadow-md">
                {t.emoji}
              </span>

              {/* Tooltip */}
              <span className="absolute bottom-[130%] opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] md:text-xs font-bold py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none border border-white/10 shadow-xl backdrop-blur-md">
                CĐ {t.topicNumber}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes dash {
            to {
                stroke-dashoffset: -1000;
            }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @keyframes roadmap-robot-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        @keyframes roadmap-caption-caret {
            0%, 45% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
        .robot-caption-caret {
            animation: roadmap-caption-caret 0.85s step-end infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .robot-caption-caret {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Premium Game Modal */}
      <AnimatePresence>{selectedLesson && <LessonDetailsModal lesson={selectedLesson.lesson} topic={selectedLesson.topic} childPlan={activeChild.plan} completed={completedIds.has(selectedLesson.lesson.id)} lang={lang} canStart={modalCanStart} onClose={() => setSelectedLesson(null)} onStart={() => { const L = selectedLesson.lesson; const route = modalPlayRoute; if (!canAccessLesson(L, activeChild.plan) || !route) return; const isPremium = activeChild.plan === "PRO" || activeChild.plan === "VIP"; if (L.gameType === "number-sequence-chart" && !isPremium) { setPendingRoute(route); setShowAd(true); } else navigate(route); }} />}</AnimatePresence>
      {selectedLesson && activeChild && Boolean(0) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setSelectedLesson(null)}
          />

          <div className="relative w-full max-w-[460px] overflow-hidden rounded-[2.5rem] border-[3px] border-white/20 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div
              className={`relative flex flex-col items-center px-6 pb-14 pt-8 text-center text-white ${selectedLesson.topic.color || "from-sky-400 to-blue-600"} bg-gradient-to-br`}
            >
              {/* Glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-60"></div>
              {/* Star sparkles */}
              <div className="absolute left-10 top-10 h-1 w-1 rounded-full bg-white shadow-[0_0_10px_2px_white] animate-pulse"></div>
              <div className="absolute right-12 top-24 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_2px_white] animate-pulse delay-300"></div>
              
              <button
                className="absolute right-4 top-4 z-20 rounded-full bg-black/20 p-2 text-white/90 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/40 active:scale-95"
                onClick={() => setSelectedLesson(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>

              <div className="relative z-10 mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm">
                <span>🤖</span> CHẾ ĐỘ ROBOT
              </div>

              {/* Floating Avatar Orb */}
              <div className="relative z-10 mb-4 flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-white/50 bg-gradient-to-b from-white/20 to-white/5 shadow-[0_0_40px_rgba(255,255,255,0.4)] backdrop-blur-md">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-[ping_3s_ease-in-out_infinite]"></div>
                <img
                  src="/robot-head.png"
                  alt="Tí Tách"
                  className="relative z-10 h-20 w-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] motion-safe:animate-[roadmap-robot-float_3s_ease-in-out_infinite]"
                  loading="lazy"
                />
              </div>

              <h2 className="z-10 mb-3 text-[2.75rem] font-black tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                Bài {selectedLesson.lesson.lessonNumber}
              </h2>

              <div className="z-10 w-full max-w-[90%] rounded-[1.25rem] border border-white/30 bg-black/20 px-5 py-3 shadow-inner backdrop-blur-md">
                <p className="text-[17px] font-extrabold leading-snug text-white drop-shadow-md">
                  {selectedLesson.lesson.title}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative -mt-8 rounded-t-[2rem] bg-slate-900 px-7 pb-8 pt-8 shadow-[0_-15px_30px_rgba(0,0,0,0.25)]">
              {/* Grab handle decoration */}
              <div className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-700/50"></div>

              <div className="mb-6 mt-2 flex flex-wrap items-center justify-center gap-2.5">
                <span className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-400">
                  Lớp 2
                </span>
                <span className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Nhiệm vụ AI
                </span>
                <span className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Vũ trụ Toán
                </span>
              </div>

              <p className="mx-auto mb-8 max-w-[320px] text-center text-[15px] font-semibold leading-relaxed text-slate-300">
                {selectedLesson.lesson.description}
              </p>

              <button
                className={`group relative w-full overflow-hidden rounded-[1.25rem] py-4 text-[22px] font-black text-white transition-all duration-300
                   ${
                     !modalCanStart
                       ? "cursor-not-allowed bg-slate-700 text-slate-400 shadow-[0_6px_0_#334155]"
                       : "bg-gradient-to-b from-sky-400 to-blue-600 shadow-[0_8px_0_#1e3a8a,0_15px_25px_rgba(37,99,235,0.4)] hover:-translate-y-1 hover:shadow-[0_10px_0_#1e3a8a,0_20px_35px_rgba(37,99,235,0.5)] active:translate-y-[6px] active:shadow-[0_2px_0_#1e3a8a,0_0px_0px_rgba(37,99,235,0.4)]"
                   }
                   `}
                disabled={!modalCanStart}
                onClick={() => {
                  const L = selectedLesson.lesson;
                  const route = modalPlayRoute;
                  if (!canAccessLesson(L, activeChild.plan) || !route) return;
                  const isPremium = activeChild.plan === "PRO" || activeChild.plan === "VIP";
                  if (L.gameType === "number-sequence-chart" && !isPremium) {
                    setPendingRoute(route);
                    setShowAd(true);
                  } else {
                    navigate(route);
                  }
                }}
              >
                {/* Button Glossy Effect */}
                {modalCanStart && (
                  <div className="absolute inset-0 h-1/2 w-full bg-gradient-to-b from-white/30 to-transparent opacity-50"></div>
                )}
                
                <div className="relative z-10 flex items-center justify-center gap-2.5 drop-shadow-md">
                  {!canAccessLesson(selectedLesson.lesson, activeChild.plan) ? (
                    <>
                      <Lock fill="currentColor" size={26} /> MỞ KHÓA PRO
                    </>
                  ) : !selectedLesson.lesson.gameType ? (
                    <>SẮP RA MẮT</>
                  ) : (
                    <>
                      <Play fill="currentColor" size={26} /> VÀO HỌC NGAY
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-roll Ad Modal */}
      <PreRollAdModal
        isOpen={showAd}
        onClose={() => {
          setShowAd(false);
          setPendingRoute(null);
        }}
        onAdComplete={() => {
          setShowAd(false);
          if (pendingRoute) {
            navigate(pendingRoute);
          }
        }}
      />
    </div>
  );
}
