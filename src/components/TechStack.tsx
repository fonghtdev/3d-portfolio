import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

const textureLoader = new THREE.TextureLoader();
type BadgeName =
  | "nestjs"
  | "postgresql"
  | "redis"
  | "docker"
  | "flutter"
  | "tailwind"
  | "firebase";
type LogoName = "java" | "git" | "spring" | "sqlserver" | BadgeName;

const BADGES: Record<BadgeName, { color: string; label: string; size: number }> = {
  nestjs: { color: "#e0234e", label: "Nest", size: 46 },
  postgresql: { color: "#336791", label: "Postgres", size: 34 },
  redis: { color: "#d82c20", label: "Redis", size: 46 },
  docker: { color: "#2496ed", label: "Docker", size: 38 },
  flutter: { color: "#02569b", label: "Flutter", size: 38 },
  tailwind: { color: "#06b6d4", label: "Tailwind", size: 30 },
  firebase: { color: "#f57c00", label: "Firebase", size: 32 },
};

type TechItem = {
  name: string;
  scale: number;
  texture: THREE.Texture;
  position: [number, number, number];
};

const drawTechLogo = (context: CanvasRenderingContext2D, logo: LogoName) => {
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (logo === "java") {
    context.fillStyle = "#e76f00";
    context.beginPath();
    context.ellipse(132, 168, 52, 13, -0.08, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#5382a1";
    context.beginPath();
    context.ellipse(136, 202, 64, 13, -0.05, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#e76f00";
    context.lineWidth = 12;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(150, 48);
    context.bezierCurveTo(106, 86, 166, 102, 128, 142);
    context.stroke();
    context.strokeStyle = "#5382a1";
    context.beginPath();
    context.moveTo(122, 38);
    context.bezierCurveTo(75, 83, 152, 101, 102, 148);
    context.stroke();
    context.font = "800 27px Arial, Helvetica, sans-serif";
    context.fillStyle = "#334155";
    context.fillText("JAVA", 128, 232);
    return;
  }

  if (logo === "spring") {
    context.fillStyle = "#6db33f";
    context.beginPath();
    context.ellipse(128, 122, 82, 58, -0.38, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(86, 132);
    context.bezierCurveTo(111, 86, 158, 74, 192, 86);
    context.bezierCurveTo(176, 91, 153, 108, 143, 131);
    context.bezierCurveTo(132, 157, 105, 163, 78, 151);
    context.bezierCurveTo(83, 145, 86, 138, 86, 132);
    context.fill();
    context.strokeStyle = "#6db33f";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(105, 143);
    context.bezierCurveTo(132, 133, 153, 118, 170, 96);
    context.stroke();
    context.font = "800 34px Arial, Helvetica, sans-serif";
    context.fillStyle = "#6db33f";
    context.fillText("BOOT", 128, 214);
    return;
  }

  if (logo === "sqlserver") {
    context.fillStyle = "#cc2927";
    context.beginPath();
    context.ellipse(128, 74, 62, 24, 0, 0, Math.PI * 2);
    context.fill();
    context.fillRect(66, 74, 124, 82);
    context.beginPath();
    context.ellipse(128, 156, 62, 24, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 6;
    [102, 130].forEach((y) => {
      context.beginPath();
      context.ellipse(128, y, 62, 24, 0, 0, Math.PI);
      context.stroke();
    });
    context.fillStyle = "#cc2927";
    context.font = "800 39px Arial, Helvetica, sans-serif";
    context.fillText("SQL", 128, 205);
    context.font = "700 24px Arial, Helvetica, sans-serif";
    context.fillText("SERVER", 128, 232);
    return;
  }

  if (logo === "git") {
    context.save();
    context.translate(128, 128);
    context.rotate(Math.PI / 4);
    context.fillStyle = "#f05032";
    context.fillRect(-62, -62, 124, 124);
    context.restore();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 14;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(94, 92);
    context.lineTo(128, 126);
    context.lineTo(162, 160);
    context.moveTo(128, 126);
    context.lineTo(128, 176);
    context.stroke();
    context.fillStyle = "#ffffff";
    [94, 128, 162].forEach((x, index) => {
      context.beginPath();
      context.arc(x, index === 0 ? 92 : index === 1 ? 126 : 160, 13, 0, Math.PI * 2);
      context.fill();
    });
    return;
  }

  const badge = BADGES[logo as BadgeName];
  context.fillStyle = badge.color;
  context.beginPath();
  context.arc(128, 128, 82, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = `800 ${badge.size}px Arial, Helvetica, sans-serif`;
  context.fillText(badge.label, 128, 132);
};

const createLogoTexture = (logo: LogoName) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  canvas.width = 256;
  canvas.height = 256;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 256, 256);
  drawTechLogo(context, logo);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

const techItems: TechItem[] = [
  { name: "React", texture: textureLoader.load("/images/react2.webp"), scale: 1, position: [-7, 1, -5] },
  { name: "Node", texture: textureLoader.load("/images/node2.webp"), scale: 1, position: [-2.2, 1.1, -4] },
  { name: "MySQL", texture: textureLoader.load("/images/mysql.webp"), scale: 0.92, position: [5, 2.4, -7] },
  { name: "SQLServer", texture: createLogoTexture("sqlserver"), scale: 0.9, position: [6.8, -0.9, -6.4] },
  { name: "TypeScript", texture: textureLoader.load("/images/typescript.webp"), scale: 1, position: [7.2, 0.9, -4.8] },
  { name: "JavaScript", texture: textureLoader.load("/images/javascript.webp"), scale: 0.9, position: [-5.6, -1.4, -3] },
  { name: "Java", texture: createLogoTexture("java"), scale: 0.92, position: [-3.2, -2.8, -5.5] },
  { name: "SpringBoot", texture: createLogoTexture("spring"), scale: 0.92, position: [-1.4, -3.6, -6.8] },
  { name: "Git", texture: createLogoTexture("git"), scale: 0.86, position: [6.2, -2.7, -5.5] },
  { name: "NestJS", texture: createLogoTexture("nestjs"), scale: 0.95, position: [-4.6, 2.7, -7] },
  { name: "PostgreSQL", texture: createLogoTexture("postgresql"), scale: 0.95, position: [2.5, 1, -5] },
  { name: "Redis", texture: createLogoTexture("redis"), scale: 0.9, position: [-0.8, -1.2, -3.8] },
  { name: "Docker", texture: createLogoTexture("docker"), scale: 0.92, position: [1.6, -2.8, -5.6] },
  { name: "Flutter", texture: createLogoTexture("flutter"), scale: 0.92, position: [4, -1.4, -3.2] },
  { name: "Tailwind", texture: createLogoTexture("tailwind"), scale: 0.9, position: [0, -4.4, -7] },
  { name: "Firebase", texture: createLogoTexture("firebase"), scale: 0.9, position: [0.5, 3.2, -6] },
];

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  position: [number, number, number];
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  position,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={position}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = document
        .getElementById("work")!
        .getBoundingClientRect().top;
      setIsActive(scrollY > threshold);
    };
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const materials = useMemo(() => {
    return techItems.map(
      ({ texture }) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {techItems.map((tech, i) => (
            <SphereGeo
              key={tech.name}
              scale={tech.scale}
              position={tech.position}
              material={materials[i]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
