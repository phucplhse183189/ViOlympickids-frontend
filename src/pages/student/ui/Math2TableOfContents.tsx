import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Torus, Octahedron, Stars, Text3D, Box, Cone, Dodecahedron } from "@react-three/drei";
import {
  MATH2_TOPICS,
  canAccessLesson,
  getMath2CompletedLessonIds,
  getMath2LessonPlayRoute,
  type Math2Lesson,
  type Math2Topic,
} from "@/shared/api/math2Data";
import { useNavigate } from "react-router-dom";
import { Play, Lock, Star, Compass } from "lucide-react";
import * as THREE from "three";
import { useActiveChild } from "@/shared/lib/activeChild";
import { speakVietnameseWithCaptionProgress } from "@/shared/lib/speakVietnameseWithCaption";
import { PreRollAdModal } from "@/shared/ui/PreRollAdModal";

// --- 3D Design ---
function FloatingMathShapes() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 1.5;
      
      group.current.children.forEach((child, index) => {
        if (child.type === "Points") return;
        const speed = (index % 3 + 1) * 0.01;
        child.position.x += speed;
        if (child.position.x > 25) {
          child.position.x = -25;
          child.position.y = (Math.random() - 0.5) * 15;
        }
      });
    }
  });

  return (
    <group ref={group}>
      <Stars radius={40} depth={50} count={800} factor={6} saturation={1} fade speed={2} />
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1} position={[-8, 6, -20]}>
        <Octahedron args={[2]}>
          <meshStandardMaterial color="#60a5fa" roughness={0.1} metalness={0.2} transparent opacity={0.6} />
        </Octahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={1} position={[8, -3, -18]}>
        <Torus args={[1.5, 0.5, 16, 32]}>
          <meshStandardMaterial color="#34d399" roughness={0.2} metalness={0.6} transparent opacity={0.6} />
        </Torus>
      </Float>

      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1} position={[-6, -8, -25]}>
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.1} transparent opacity={0.6} />
        </Sphere>
      </Float>
      
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0, -5, -35]}>
         <Torus args={[10, 2, 32, 64]}>
           <meshStandardMaterial color="#e0f2fe" roughness={0.4} metalness={0.1} transparent opacity={0.2} />
         </Torus>
      </Float>

      <Float speed={2} rotationIntensity={1} floatIntensity={1} position={[-12, 2, -22]}>
        <Text3D font="/fonts/Inter_Bold.json" size={2} height={0.5} curveSegments={12}>
          1
          <meshStandardMaterial color="#f43f5e" roughness={0.2} metalness={0.5} transparent opacity={0.7} />
        </Text3D>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[12, 6, -28]}>
        <Text3D font="/fonts/Inter_Bold.json" size={3} height={0.8} curveSegments={12}>
          2
          <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.2} transparent opacity={0.6} />
        </Text3D>
      </Float>
      
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1} position={[6, -6, -24]}>
        <Text3D font="/fonts/Inter_Bold.json" size={1.8} height={0.4} curveSegments={12}>
          3
          <meshStandardMaterial color="#a855f7" roughness={0.1} metalness={0.6} transparent opacity={0.8} />
        </Text3D>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1} position={[-4, 8, -30]}>
        <Text3D font="/fonts/Inter_Bold.json" size={2.5} height={0.6} curveSegments={12}>
          5
          <meshStandardMaterial color="#2dd4bf" roughness={0.4} metalness={0.3} transparent opacity={0.5} />
        </Text3D>
      </Float>

      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={1} position={[14, -2, -26]}>
        <Text3D font="/fonts/Inter_Bold.json" size={2.2} height={0.5} curveSegments={12}>
          7
          <meshStandardMaterial color="#fb923c" roughness={0.3} metalness={0.4} transparent opacity={0.7} />
        </Text3D>
      </Float>

      <Float speed={1.4} rotationIntensity={2} floatIntensity={1} position={[-10, -5, -28]}>
        <Text3D font="/fonts/Inter_Bold.json" size={2.8} height={0.6} curveSegments={12}>
          +
          <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.3} transparent opacity={0.7} />
        </Text3D>
      </Float>

      <Float speed={2} rotationIntensity={0.6} floatIntensity={1} position={[8, 9, -32]}>
        <Text3D font="/fonts/Inter_Bold.json" size={3} height={0.5} curveSegments={12}>
          =
          <meshStandardMaterial color="#60a5fa" roughness={0.1} metalness={0.7} transparent opacity={0.5} />
        </Text3D>
      </Float>

      <Float speed={1.7} rotationIntensity={1.1} floatIntensity={1} position={[-2, -8, -25]}>
        <Text3D font="/fonts/Inter_Bold.json" size={2.4} height={0.4} curveSegments={12}>
          9
          <meshStandardMaterial color="#a3e635" roughness={0.4} metalness={0.2} transparent opacity={0.7} />
        </Text3D>
      </Float>

      {/* More Geometry */}
      <Float speed={1.8} rotationIntensity={2} floatIntensity={1} position={[10, -8, -30]}>
        <Box args={[2, 2, 2]}>
          <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.4} transparent opacity={0.6} />
        </Box>
      </Float>

      <Float speed={2.5} rotationIntensity={1} floatIntensity={1} position={[-14, 8, -22]}>
        <Cone args={[1.5, 3, 32]}>
          <meshStandardMaterial color="#fb7185" roughness={0.3} metalness={0.2} transparent opacity={0.7} />
        </Cone>
      </Float>

      <Float speed={1.2} rotationIntensity={1.5} floatIntensity={1} position={[4, 5, -34]}>
        <Dodecahedron args={[2]}>
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.5} transparent opacity={0.5} />
        </Dodecahedron>
      </Float>
    </group>
  );
}

function Math2Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] transition-colors duration-1000" id="dynamic-bg" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sky-400/20 to-transparent blur-3xl opacity-50" />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, -5, -10]} intensity={0.5} color="#60a5fa" />
        <FloatingMathShapes />
      </Canvas>
    </div>
  );
}

// --- Main Page Component ---
export function Math2TableOfContents() {
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Math2Lesson; topic: Math2Topic } | null>(null);

  const [showAd, setShowAd] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const [progressTick, setProgressTick] = useState(0);
  useEffect(() => {
    const bump = () => setProgressTick((t) => t + 1);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener("math2-progress-updated", bump);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("math2-progress-updated", bump);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const completedIds = useMemo(
    () => getMath2CompletedLessonIds(activeChild.id),
    [activeChild.id, progressTick],
  );

  const nextLessonId = useMemo(() => {
    for (const topic of MATH2_TOPICS) {
      for (const lesson of topic.lessons) {
        if (
          canAccessLesson(lesson, activeChild.plan) &&
          !completedIds.has(lesson.id)
        ) {
          return lesson.id;
        }
      }
    }
    return null;
  }, [activeChild.plan, completedIds]);

  /** Robot đứng tại bài tiếp theo; nếu đã xong hết bài mở được → đứng ở bài mở cuối lộ trình */
  const robotLessonId = useMemo(() => {
    if (nextLessonId) return nextLessonId;
    let lastAccessible: string | null = null;
    for (const topic of MATH2_TOPICS) {
      for (const lesson of topic.lessons) {
        if (canAccessLesson(lesson, activeChild.plan))
          lastAccessible = lesson.id;
      }
    }
    return lastAccessible;
  }, [nextLessonId, activeChild.plan]);

  const robotAllDone =
    nextLessonId === null &&
    robotLessonId !== null &&
    completedIds.has(robotLessonId);

  const childDisplayName = useMemo(() => {
    const n = activeChild.name?.trim();
    return n && n.length > 0 ? n : "bạn";
  }, [activeChild.name]);

  const robotSpeechText = useMemo(() => {
    if (robotAllDone) {
      return `Tuyệt vời, ${childDisplayName}! Bé đã học xong cả lộ trình đang mở rồi!`;
    }
    return `Chào ${childDisplayName}! Tí Tách đợi cậu ở bài này nhé!`;
  }, [childDisplayName, robotAllDone]);

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
  const [nodePositions, setNodePositions] = useState<{x: number, y: number}[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topicRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    
    const positions = nodeRefs.current.map(el => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      // Relative to the scroll content itself (0 is the very left edge of the entire scrollable area)
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    }).filter(Boolean) as {x: number, y: number}[];
    
    setNodePositions(positions);
  }, []);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    // Observe DOM changes (like images loading or fonts rendering causing shifts)
    const observer = new ResizeObserver(updatePositions);
    if (scrollRef.current?.firstChild) {
      observer.observe(scrollRef.current.firstChild as Element);
    }
    const timeout = setTimeout(updatePositions, 500); // safety fallback

    return () => {
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [updatePositions]);

  // Generate SVG Path String
  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
        const prev = nodePositions[i-1];
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
        const targetScrollLeft = (elRect.left - scrollContentRect.left) - 100;

        container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }
  };

  let globalCount = 0;

  const modalL = selectedLesson?.lesson ?? null;
  const modalPlayRoute = modalL ? getMath2LessonPlayRoute(modalL) : null;
  const modalCanStart = Boolean(
    modalL?.gameType &&
      modalL &&
      canAccessLesson(modalL, activeChild.plan) &&
      modalPlayRoute,
  );

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
      </div>

      {/* Main Drag/Scroll Container */}
      <div 
        ref={scrollRef}
        className={`relative z-10 w-full h-full overflow-x-auto overflow-y-hidden hide-scrollbar flex items-center pt-24 pb-32 ${isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="relative flex flex-row items-center w-max h-full px-24 md:px-48 gap-16 md:gap-[clamp(8rem,15vw,16rem)] min-h-[500px]">
          
          {/* S V G   P A T H */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10" style={{ minWidth: "100%" }}>
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
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="30%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {MATH2_TOPICS.map((topic, tIdx) => {
            const portalIdx = globalCount++;
            
            return (
              <div key={topic.id} className="flex flex-row items-center h-full gap-16 md:gap-[clamp(8rem,15vw,16rem)] relative">
                
                {/* --- TOPIC PORTAL (Gateway) --- */}
                <div 
                    ref={(el) => {
                        nodeRefs.current[portalIdx] = el;
                        topicRefs.current[tIdx] = el;
                    }}
                    className="relative z-20 shrink-0 transform hover:-translate-y-4 transition-all duration-500 ease-out flex items-center justify-center p-4 group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${topic.color || 'from-sky-400 to-indigo-500'} rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                  
                  <div className="relative flex flex-col items-center justify-center w-64 md:w-80 h-[380px] bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.4)] overflow-hidden cursor-default">
                    {/* Glass glare */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[3rem]"></div>
                    
                    <div className="bg-white/20 p-6 rounded-3xl shadow-inner backdrop-blur-md border border-white/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-6xl md:text-7xl drop-shadow-2xl block animate-[float_4s_ease-in-out_infinite]">{topic.emoji}</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center px-6">
                        <div className="px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-4 shadow-inner border border-white/10 flex items-center gap-2">
                            <Star size={14} fill="currentColor" /> Chủ đề {topic.topicNumber} <Star size={14} fill="currentColor" />
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

                  const isLocked = !canAccessLesson(lesson, activeChild.plan);
                  const isCompleted = completedIds.has(lesson.id);
                  const isNextUp = lesson.id === nextLessonId;

                  return (
                    <div
                      key={lesson.id}
                      ref={(el) => { nodeRefs.current[idx] = el; }}
                      className="relative flex flex-col items-center justify-center shrink-0 z-20"
                      style={{ transform: `translateY(${offsetY}px)` }}
                    >
                      {/* Tactile 3D Button wrapper */}
                      <div className="relative group">
                          {/* Robot Tí Tách — đánh dấu bài hiện tại trên roadmap */}
                          {lesson.id === robotLessonId && !isLocked && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-[45] mb-2 flex w-[min(240px,78vw)] -translate-x-1/2 flex-col items-center">
                              <div className="relative mb-1.5 rounded-2xl border-2 border-cyan-200/90 bg-white/95 px-2 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                                <p
                                  className="min-h-[2.5rem] max-w-[min(220px,72vw)] text-left text-[10px] font-black leading-snug text-sky-900 md:min-h-[2.75rem] md:text-xs"
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
                                  className="absolute -bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-cyan-200/90 bg-white/95"
                                  aria-hidden
                                />
                              </div>
                              <img
                                src="/robot-head.png"
                                alt=""
                                width={112}
                                height={112}
                                className="h-14 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] motion-safe:animate-[roadmap-robot-float_2.8s_ease-in-out_infinite] md:h-[4.25rem]"
                                onLoad={() => {
                                  requestAnimationFrame(() => updatePositions());
                                }}
                              />
                              <span className="mt-0.5 rounded-full bg-sky-500/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-md md:text-[10px]">
                                Tí Tách
                              </span>
                            </div>
                          )}
                          {/* Aura glow for unlocked/completed */}
                          {!isLocked && (
                              <div className={`absolute -inset-4 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isCompleted ? 'bg-yellow-400' : 'bg-sky-400'}`}></div>
                          )}

                          <button 
                            onClick={() => {
                              if (!isLocked) setSelectedLesson({ lesson, topic });
                            }}
                            className={`
                              relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold
                              transition-all duration-300 outline-none
                              ${isLocked 
                                ? "bg-slate-300 border-4 border-slate-400/50 shadow-[0_8px_0_#94a3b8,0_15px_20px_rgba(0,0,0,0.2)] text-slate-500 cursor-not-allowed" 
                                : isCompleted 
                                  ? "bg-gradient-to-b from-amber-200 to-yellow-400 border-[6px] border-white shadow-[0_12px_0_#b45309,0_15px_30px_rgba(0,0,0,0.4)] text-amber-900 group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_0_#b45309,0_25px_40px_rgba(0,0,0,0.4)] active:translate-y-[8px] active:shadow-[0_4px_0_#b45309,0_5px_10px_rgba(0,0,0,0.4)]" 
                                  : "bg-gradient-to-b from-sky-300 to-blue-500 border-[6px] border-white shadow-[0_12px_0_#1d4ed8,0_15px_30px_rgba(0,0,0,0.4)] text-white group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_0_#1d4ed8,0_25px_40px_rgba(0,0,0,0.4)] active:translate-y-[8px] active:shadow-[0_4px_0_#1d4ed8,0_5px_10px_rgba(0,0,0,0.4)]"
                              }
                            `}
                          >
                            <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] group-active:scale-95 transition-transform origin-center">
                              {isLocked ? <Lock size={36} className="text-slate-400" /> : lesson.emoji}
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
            {MATH2_TOPICS.map((t, index) => (
                <button 
                    key={t.id}
                    onClick={() => scrollToTopic(index)}
                    title={t.title}
                    className="relative group shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/20 border border-transparent hover:border-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <span className="text-xl md:text-2xl drop-shadow-md">{t.emoji}</span>
                    
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

      {/* Modal is completely styled with premium CSS */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity animate-in fade-in" 
            onClick={() => setSelectedLesson(null)} 
          />
          
          <div className="relative w-full max-w-[500px] bg-white rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-300 border-[8px] border-white/10">
            {/* Modal Header */}
            <div className={`pt-12 pb-14 bg-gradient-to-br ${selectedLesson.topic.color || 'from-indigo-500 via-sky-500 to-sky-400'} text-white flex flex-col items-center text-center relative overflow-hidden`}>
              {/* Background decors inside header */}
              <div className="absolute top-0 right-0 p-8 opacity-20"><Star size={64} /></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

              <button 
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-3 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-90" 
                onClick={() => setSelectedLesson(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <div className="relative z-10">
                <div className="text-8xl mb-6 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] animate-[bounce_2s_infinite]">{selectedLesson.lesson.emoji}</div>
              </div>

              <h2 className="text-4xl font-black mb-4 drop-shadow-md z-10">Bài {selectedLesson.lesson.lessonNumber}</h2>
              <div className="bg-white/20 px-6 py-3 rounded-[2rem] backdrop-blur-md border border-white/30 shadow-lg max-w-[85%] z-10">
                 <p className="font-bold text-xl leading-tight text-white drop-shadow-sm">{selectedLesson.lesson.title}</p>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="relative p-10 flex flex-col items-center bg-slate-50/90 backdrop-blur-3xl -mt-6 rounded-t-[3rem] shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
               <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-8"></div>
               
               <p className="text-slate-600 text-center mb-10 text-lg font-medium leading-relaxed max-w-sm">
                   {selectedLesson.lesson.description}
               </p>
               
               <button 
                 className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] text-2xl font-black text-white transition-all duration-300
                   ${
                     !modalCanStart
                       ? "bg-slate-300 shadow-[0_8px_0_#94a3b8] cursor-not-allowed hover:translate-y-1 hover:shadow-[0_4px_0_#94a3b8] active:translate-y-[8px] active:shadow-none text-slate-500 border-2 border-slate-300"
                       : "bg-gradient-to-b from-sky-400 to-blue-600 shadow-[0_10px_0_#1d4ed8,0_15px_30px_rgba(37,99,235,0.4)] hover:translate-y-[-2px] hover:shadow-[0_12px_0_#1d4ed8,0_20px_40px_rgba(37,99,235,0.5)] active:translate-y-[10px] active:shadow-none ring-4 ring-sky-500/20 border border-sky-300"
                   }
                   `}
                 disabled={!modalCanStart}
                 onClick={() => {
                   const L = selectedLesson.lesson;
                   const route = modalPlayRoute;
                   if (
                     !L.gameType ||
                     !canAccessLesson(L, activeChild.plan) ||
                     !route
                   )
                     return;
                   const isPremium =
                     activeChild.plan === "PRO" || activeChild.plan === "VIP";
                   if (L.gameType === "number-sequence-chart" && !isPremium) {
                     setPendingRoute(route);
                     setShowAd(true);
                   } else {
                     navigate(route);
                   }
                 }}
               >
                 {!canAccessLesson(selectedLesson.lesson, activeChild.plan) ? (
                   <>
                     <Lock fill="currentColor" size={28} /> Mở khóa PRO
                   </>
                 ) : !selectedLesson.lesson.gameType ? (
                   <>
                     Sắp ra mắt
                   </>
                 ) : (
                   <>
                     <Play fill="currentColor" size={28} /> Vào học ngay
                   </>
                 )}
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
