import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import * as dat from "lil-gui";
import { gsap } from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });

// Canvas
const canvas = document.querySelector(".webgl");

/**
 * texture
 */
const textureLoader = new THREE.TextureLoader();
const matcapMatel = textureLoader.load("/textures/matelMatcap1.png");

// Scene
const scene = new THREE.Scene();

// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector4() },
    uTexture: { value: matcapMatel },
    uMouse: { value: new THREE.Vector2(10, 10) },
    uNumber: { value: 0 },
  },
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//debug
gui
  .add(material.uniforms.uNumber, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Cube to Sphere");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  //res
  resizeRes();
});

const resizeRes = () => {
  const imageAspect = 1;
  let a1;
  let a2;
  if (sizes.height / sizes.width > imageAspect) {
    a1 = sizes.width / sizes.height;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = sizes.height / sizes.width;
  }
  material.uniforms.uResolution.value.x = sizes.width;
  material.uniforms.uResolution.value.y = sizes.height;
  material.uniforms.uResolution.value.z = a1;
  material.uniforms.uResolution.value.w = a2;
};

resizeRes();

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX / sizes.width - 0.5;
  mouse.y = -(event.clientY / sizes.height) + 0.5;

  material.uniforms.uMouse.value = mouse;
});

let isSphere = false;

const addToSphere = () => {
  const animate = {
    o: 0.25,
  };
  const initial = {
    o: material.uniforms.uNumber.value,
  };

  gsap.to(initial, {
    o: initial.o + animate.o,
    duration: 0.2,
    onUpdate: () => {
      material.uniforms.uNumber.value = initial.o;
    },
  });
};

const addToCube = () => {
  const animate = {
    o: 0.25,
  };
  const initial = {
    o: material.uniforms.uNumber.value,
  };

  gsap.to(initial, {
    o: initial.o - animate.o,
    duration: 0.2,
    onUpdate: () => {
      material.uniforms.uNumber.value = initial.o;
    },
  });
};

const uNumberAdjust = () => {
  if (isSphere === false) {
    // material.uniforms.uNumber.value += 0.33;
    addToSphere();
    console.log(material.uniforms.uNumber.value);
    if (material.uniforms.uNumber.value >= 0.9) {
      isSphere = true;
    }
  }
  if (isSphere) {
    // material.uniforms.uNumber.value -= 0.33;
    addToCube();
    console.log(material.uniforms.uNumber.value);
    if (material.uniforms.uNumber.value <= 0.2) {
      isSphere = false;
    }
  }
};

window.addEventListener("click", () => {
  uNumberAdjust();
});

/**
 * Camera
 */
// Base camera
var frustumSize = 1;
var aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  frustumSize / -2,
  frustumSize / 2,
  frustumSize / 2,
  frustumSize / -2,
  -1000,
  1000
);
camera.position.z = 2.6;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setClearColor("#000000");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  material.uniforms.uTime.value = elapsedTime;

  if (
    material.uniforms.uNumber.value >= 0 &&
    material.uniforms.uNumber.value <= 0.99
  ) {
    if (isSphere === false) {
      material.uniforms.uNumber.value -= 0.001;
    }
    if (isSphere) {
      material.uniforms.uNumber.value += 0.001;
    }
  }

  // Update controls
  // controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
