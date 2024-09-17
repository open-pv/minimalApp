import { ShadingScene } from "@openpv/simshady";
import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { raster } from "./raster";

async function main() {
  console.log("Main script started");
  const geometry = await loadSTLFile("building.stl");
  console.log("geometry:");
  console.log(geometry);
  const scene = new ShadingScene(50, 11);
  scene.addSimulationGeometry(geometry);
  let url = "https://www.openpv.de/data/irradiance";
  //scene.addElevationRaster(raster, { x: 3, y: 3, z: 0 }, 20)
  let mesh = await scene.calculate({
    numberSimulations: 100,
    diffuseIrradiance: "https://www.openpv.de/data/irradiance",
    urlDirectIrrandianceTIF:
      "https://www.openpv.de/data/irradiance/geotiff/average_direct_radiation.tif",
    urlDiffuseIrrandianceTIF:
      "https://www.openpv.de/data/irradiance/geotiff/average_diffuse_radiation.tif",
  });

  console.log("Mesh calculated:", mesh);
  showThreeJS(mesh);
}

async function calibration() {
  console.log("Calibration script started");
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -1.0,
    -1.0,
    0.0, // Vertex 1
    1.0,
    -1.0,
    0.0, // Vertex 2
    0.0,
    1.0,
    0.0, // Vertex 3
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  const scene = new ShadingScene(50, 11);
  scene.addSimulationGeometry(geometry);
  let mesh = await scene.calculate({
    numberSimulations: 100,
    diffuseIrradiance: "https://www.openpv.de/data/irradiance",
    urlDirectIrrandianceTIF:
      "https://www.openpv.de/data/irradiance/geotiff/average_direct_radiation.tif",
    urlDiffuseIrrandianceTIF:
      "https://www.openpv.de/data/irradiance/geotiff/average_diffuse_radiation.tif",
  });
  console.log("Mesh calculated:", mesh);
  showThreeJS(mesh);
}

main();

async function loadSTLFile(url) {
  const loader = new STLLoader();
  const response = await fetch(url);
  console.log(response);
  const arrayBuffer = await response.arrayBuffer();
  return loader.parse(arrayBuffer);
}

function showThreeJS(mesh) {
  console.log("Called showThreeJS");
  console.log(mesh);

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.up = new THREE.Vector3(0, 0, 1);
  const controls = new MapControls(camera, renderer.domElement);

  camera.position.set(0, -5, 5); // Adjust the camera position as needed
  camera.up.set(0, 0, 1);

  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener(
    "resize",
    function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    },
    false,
  );

  scene.add(mesh);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
