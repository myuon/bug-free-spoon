import "./style.css";
import * as THREE from "three";
import fragmentShader from "./glsl/pt.frag?raw";
import vertexShader from "./glsl/pt.vert?raw";
import Stats from "three/examples/jsm/libs/stats.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mat = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  },
  vertexShader,
  fragmentShader,
});

const geometry = new THREE.BoxGeometry(2, 2, 2);
scene.add(new THREE.Mesh(geometry, mat));

camera.position.z = 5;

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  stats.update();
  renderer.render(scene, camera);
}

animate();
