import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader, RoundedBoxGeometry } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const normalizeObjectName = (name: string) =>
  name.replace(/\s/g, "_").replace(/[\[\].:/]/g, "");

const hasObjectName = (object: THREE.Object3D, ...names: string[]) => {
  const objectNames = [object.name, object.userData.name]
    .filter((name): name is string => typeof name === "string")
    .map(normalizeObjectName);

  return names.some((name) => objectNames.includes(normalizeObjectName(name)));
};

const colorMaterial = (
  material: THREE.Material | THREE.Material[],
  color: string,
  options: {
    roughness?: number;
    metalness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    colorIntensity?: number;
  } = {}
) => {
  const colorSingleMaterial = (source: THREE.Material) => {
    const material = source.clone() as THREE.MeshStandardMaterial;

    if (material.color) {
      material.color.set(color);
      if (typeof options.colorIntensity === "number") {
        material.color.multiplyScalar(options.colorIntensity);
      }
    }
    if (typeof options.roughness === "number") material.roughness = options.roughness;
    if (typeof options.metalness === "number") material.metalness = options.metalness;
    if (material.emissive && options.emissive) material.emissive.set(options.emissive);
    if (typeof options.emissiveIntensity === "number") {
      material.emissiveIntensity = options.emissiveIntensity;
    }
    material.needsUpdate = true;

    return material;
  };

  return Array.isArray(material)
    ? material.map(colorSingleMaterial)
    : colorSingleMaterial(material);
};

const createHatStar = () => {
  const shape = new THREE.Shape();
  const outerRadius = 0.28;
  const innerRadius = 0.11;

  for (let point = 0; point < 10; point++) {
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const angle = Math.PI / 2 + point * (Math.PI / 5);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (point === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshStandardMaterial({
    color: "#ffd21f",
    emissive: "#ffd21f",
    emissiveIntensity: 0.12,
    metalness: 0,
    roughness: 0.35,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const star = new THREE.Mesh(geometry, material);

  star.name = "HatStar";
  star.position.set(0, 14.25, 1.08);
  star.renderOrder = 10;

  return star;
};

const addHatStar = (character: THREE.Object3D) => {
  const star = createHatStar();
  const headBone =
    character.getObjectByName("spine006") || character.getObjectByName("spine.006");

  character.updateMatrixWorld(true);
  star.updateMatrixWorld(true);

  if (headBone) headBone.attach(star);
  else character.add(star);
};

const createAppleLogo = () => {
  const logo = new THREE.Group();
  const logoMaterial = new THREE.MeshBasicMaterial({ color: "#f4f4f4" });
  const body = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), logoMaterial);
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), logoMaterial);

  body.scale.set(0.8, 1, 1);
  leaf.scale.set(0.55, 0.35, 1);
  leaf.position.set(0.035, 0.065, 0.001);
  leaf.rotation.z = -0.45;
  logo.add(body, leaf);

  return logo;
};

const createWallpaper = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 160);

  gradient.addColorStop(0, "#5b8cff");
  gradient.addColorStop(0.55, "#8a5cff");
  gradient.addColorStop(1, "#ff7ab8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(0, 0, 256, 7);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

const createKeys = (material: THREE.Material) => {
  const rows = 4;
  const cols = 12;
  const keys = new THREE.InstancedMesh(
    new RoundedBoxGeometry(0.083, 0.014, 0.06, 2, 0.008),
    material,
    rows * cols
  );
  const matrix = new THREE.Matrix4();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      matrix.setPosition(-0.5 + col * 0.091, 0.108, -0.07 + row * 0.07);
      keys.setMatrixAt(row * cols + col, matrix);
    }
  }

  return keys;
};

const createMacBook = () => {
  const laptop = new THREE.Group();
  const laptopBody = new THREE.Group();
  const aluminum = new THREE.MeshStandardMaterial({
    color: "#d6d8dc",
    metalness: 0.85,
    roughness: 0.22,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#0b0c10",
    metalness: 0.2,
    roughness: 0.4,
  });
  const keyMaterial = new THREE.MeshStandardMaterial({
    color: "#15171c",
    metalness: 0.05,
    roughness: 0.55,
  });
  const trackpadMaterial = new THREE.MeshStandardMaterial({
    color: "#c4c6ca",
    metalness: 0.6,
    roughness: 0.18,
  });
  const displayMaterial = new THREE.MeshBasicMaterial({ map: createWallpaper() });

  const base = new THREE.Mesh(new RoundedBoxGeometry(1.72, 0.08, 1.05, 4, 0.035), aluminum);
  base.position.y = 0.04;
  laptopBody.add(base);

  const keyboardDeck = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.014, 0.4, 2, 0.006), dark);
  keyboardDeck.position.set(0, 0.088, 0.06);
  laptopBody.add(keyboardDeck, createKeys(keyMaterial));

  const trackpad = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.012, 0.3, 3, 0.02),
    trackpadMaterial
  );
  trackpad.position.set(0, 0.092, -0.36);
  laptopBody.add(trackpad);

  const screen = new THREE.Group();
  screen.position.set(0, 0.62, 0.49);
  screen.rotation.x = -0.14;

  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.72, 1.08, 0.055, 4, 0.03), aluminum);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(1.64, 1.0), dark);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(1.52, 0.92), displayMaterial);
  const notch = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.035, 0.004, 2, 0.0015), dark);
  const logo = createAppleLogo();

  bezel.position.z = -0.0285;
  bezel.rotation.y = Math.PI;
  display.position.z = -0.0292;
  display.rotation.y = Math.PI;
  notch.position.set(0, 0.452, -0.0295);
  logo.position.z = 0.031;
  screen.add(shell, bezel, display, notch, logo);
  laptopBody.add(screen);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.42, 24), aluminum);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.12, 0.5);
  laptopBody.add(hinge);

  const standMaterial = new THREE.MeshStandardMaterial({
    color: "#aeb0b4",
    metalness: 0.75,
    roughness: 0.24,
  });
  const standTop = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.05, 0.84), standMaterial);
  standTop.position.set(0, 0.08, 0);
  standTop.rotation.x = -0.16;

  const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.12), standMaterial);
  standNeck.position.set(0, -0.22, -0.12);
  standNeck.rotation.x = -0.18;

  const standFoot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), standMaterial);
  standFoot.position.set(0, -0.54, -0.18);

  laptop.add(standTop, standNeck, standFoot);
  laptopBody.position.set(0, 0.16, -0.02);
  laptopBody.rotation.x = -0.16;
  laptop.add(laptopBody);

  laptop.name = "DeskMacBook";
  laptop.position.set(-3.65, 9.12, 3.85);
  laptop.rotation.y = -0.65;
  laptop.scale.setScalar(1.22);
  laptop.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return laptop;
};

const addMacBook = (character: THREE.Object3D) => {
  character.add(createMacBook());
};

const extendDesk = (character: THREE.Object3D) => {
  const desk = character.getObjectByName("Cube002");

  if (desk) {
    desk.scale.x *= 1.18;
    desk.position.x -= 0.35;
  }
};

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  onProgress?: (percent: number) => void
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc?v=2",
          "MyCharacter12",
          onProgress
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        onProgress?.(70);
        loader.load(
          blobUrl,
          async (gltf) => {
            onProgress?.(82);
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            onProgress?.(92);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;

                if (mesh.material) {
                  if (hasObjectName(mesh, "BODY.SHIRT")) {
                    mesh.material = colorMaterial(mesh.material, "#8b4513");
                  } else if (hasObjectName(mesh, "Pant")) {
                    mesh.material = colorMaterial(mesh.material, "#000000");
                  } else if (hasObjectName(mesh, "CAP.001")) {
                    mesh.material = colorMaterial(mesh.material, "#d71920", {
                      roughness: 0.48,
                      metalness: 0.08,
                    });
                  } else if (hasObjectName(mesh, "Face.002", "Ear.001", "Neck", "Hand")) {
                    mesh.material = colorMaterial(mesh.material, "#ffd0b5", {
                      roughness: 0.46,
                      metalness: 0,
                      emissive: "#5a2c1c",
                      emissiveIntensity: 0.18,
                      colorIntensity: 1.18,
                    });
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            addHatStar(character);
            addMacBook(character);
            extendDesk(character);
            onProgress?.(96);
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            onProgress?.(98);
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;

            // Monitor scale is handled by GsapScroll.ts animations

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
