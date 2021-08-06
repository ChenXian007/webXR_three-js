import * as THREE from './libs/three.module.js'
import {
    OrbitControls
} from './libs/OrbitControls.modules.js'

import {
    GUI
} from './libs/dat.gui.module.js'
import {
    ColladaLoader
} from './libs/ColladaLoader.js'

import {
    GLTFLoader
} from './libs/GLTFLoader.js'


import Stats from '../libs/stats.module.js';
import {
    OBJLoader
} from './libs/OBJLoader.js';
import {
    MTLLoader
} from './libs/MTLLoader.js'

const stats = Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let aspectRation = (window.innerWidth / window.innerHeight);
let scene, camera, renderer, controls;
let mixer, mixer2;
let meshFloor, billBoard;
let cube, cylinder, sphere, step; //shader

const clock = new THREE.Clock(); //for animation
const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
const posSound = new THREE.PositionalAudio(listener);


//createScene
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('grey');
}


//createCamera
function createCamera() {
    camera = new THREE.PerspectiveCamera(60, aspectRation, 0.1, 1000);
    camera.position.x = 200;
    camera.position.y = 120;
    camera.position.z = 200;
    camera.lookAt(scene.position);
    //add AudioListener to camera
    camera.add(listener);
    controls = new OrbitControls(camera, renderer.domElement);

}
//create AmbientSound
function createAmbientSound() {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./sounds/amb.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.01);
        sound.play();
    });
}
//create PositionSound
function createPositionSound() {
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load('./sounds/pos.wav', function(buffer) {
        posSound.setBuffer(buffer)
        posSound.setVolume(1);
        posSound.setLoop(true);
        posSound.setRefDistance(10)
        posSound.play()
    });
    meshFloor.add(posSound);
}
//create DirectionalLight and AmbientLight
function createLight() {
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

//incorporate three 3D objects demonstrating 3 different vertex-fragment shader pairs.
//MTLLoader is for texture of vertex-fragment shader
function loadModel() {
    const mtlLoader = new MTLLoader();
    mtlLoader.load("./obj/anime.mtl", function(materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('./obj/anime.obj', function(object) {
            scene.add(object);
            object.scale.set(0.5, 0.5, 0.5)
            object.position.x = -100
            object.position.z = 50
            object.position.y = 70
            object.rotation.y = Math.PI / 3;
            //demonstrate the use of a 3rd party library to incorporate some basic physics OR animation.

            const tl = new TimelineMax();
            tl.from(object.position, 2, { y: 100, x: 100, z: 0, ease: Expo.easeOut })
        });
    });

    const mtlLoader2 = new MTLLoader();
    mtlLoader2.load("./obj/welcome.mtl", function(materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('./obj/welcome.obj', function(object) {
            scene.add(object);
            object.scale.set(0.2, 0.2, 0.2)
            object.position.x = -70
            object.position.y = 95
            object.rotation.y = Math.PI / 3;
            //demonstrate the use of a 3rd party library to incorporate some basic physics OR animation.
            const tl = new TimelineMax();
            tl.from(object.position, 2, { y: 150, x: -80, z: 0, ease: Expo.easeOut })
        });
    });

    const mtlLoader3 = new MTLLoader();
    mtlLoader3.load("./obj/happy.mtl", function(materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('./obj/happy.obj', function(object) {
            scene.add(object);
            object.scale.set(0.2, 0.2, 0.2)
            object.position.x = -80
            object.position.y = 80
            object.rotation.y = Math.PI / 3;
            //demonstrate the use of a 3rd party library to incorporate some basic physics OR animation.
            const tl = new TimelineMax();
            tl.from(object.position, 2, { y: 150, x: -80, z: 0, ease: Expo.easeOut })
        });
    });

}


//a ground floor
function createFloor() {
    // load texture with 3 callback function.
    const texture = new THREE.TextureLoader().load('./texture/floor_tiles_06_diff_2k.png',
        () => {
            console.log('loading finished\n');
        },
        undefined,
        () => { console.log('loading error') }
    );

    meshFloor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(300, 300, 5, 5),
        new THREE.MeshPhysicalMaterial({ map: texture })
    )
    meshFloor.encoding = THREE.sRGBEncoding;
    meshFloor.receiveShadow = true;


    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.rotation.z = Math.PI / 7;
    meshFloor.position.x = 5;
    meshFloor.position.z = -10;
    scene.add(meshFloor)
}
var time = 0;

function createRenderer() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1.0);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}





function shader() {
    var material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: "f",
                value: 1.0
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2()
            }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    //Create a square using shader material
    var cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.y = 60
    cube.position.x = 180
    cube.position.z = 50
        //Add the square to the scene
    scene.add(cube);

    //Used for cube rotation
    step = 0;
}

function shader2() {
    var material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: "f",
                value: 1.0
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2()
            }
        },
        vertexShader: document.getElementById('vertexShader2').textContent,
        fragmentShader: document.getElementById('fragmentShader2').textContent
    });
    //Create a cylinder using shader material
    var Geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    cylinder = new THREE.Mesh(Geometry, material);



    cylinder.position.y = 60
    cylinder.position.x = -50
    cylinder.position.z = 150

    //Add the cylinder to the scene
    scene.add(cylinder);

    //Used for cylinder rotation
    step = 0;
}

function shader3() {
    var material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: "f",
                value: 1.0
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2()
            }
        },
        vertexShader: document.getElementById('vertexShader3').textContent,
        fragmentShader: document.getElementById('fragmentShader3').textContent
    });
    //Create a Sphere using shader material
    var Geometry = new THREE.SphereGeometry(2, 20, 20);;
    sphere = new THREE.Mesh(Geometry, material);


    sphere.position.y = 60
    sphere.position.x = 20
    sphere.scale.set(3.0, 3.0, 3.0)
        //Add the sphere to the scene
    scene.add(sphere);

    //Used for sphere rotation
    step = 0;
}
//animate
function animate() {
    window.requestAnimationFrame(animate);
    //shader
    cube.rotation.y = step += 0.01;
    cube.rotation.x = step;
    cube.rotation.z = step;
    cube.material.uniforms.time.value += 0.1;
    //shader2
    cylinder.rotation.y = step += 0.01;
    cylinder.rotation.x = step;
    cylinder.rotation.z = step;
    cylinder.material.uniforms.time.value += 0.1;
    //shader3
    sphere.rotation.y = step += 0.01;
    sphere.rotation.x = step;
    sphere.rotation.z = step;
    sphere.material.uniforms.time.value += 0.1;

    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);
    if (mixer2) mixer2.update(delta);

    controls.update();
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
}



function loadbuilding() {
    const loader = new ColladaLoader();

    loader.load("./UCC_Quad_Model_DAE/quad.dae", function(result) {
        const mesh = result.scene;
        mesh.scale.set(0.07, 0.07, 0.07);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });
}


function createChar() {
    var loader = new GLTFLoader();
    loader.load('./human/scene.gltf', (gltf) => {
        const model = gltf.scene;
        const spotlight = new THREE.SpotLight(0xffffff, 1.0, 120.0, 0.60, 0.0, 0.0);
        spotlight.position.set(80, 35, 25);
        spotlight.castShadow = true;
        scene.add(spotlight);
        // SpotLight to trace the character
        const targetObject = model;
        scene.add(targetObject);
        spotlight.target = targetObject;

        model.position.x = 80;
        model.position.z = 25;
        model.position.y = 10;
        model.scale.set(0.1, 0.1, 0.1);
        model.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        //creat GUI to control the movement of character
        const gui = new GUI();
        const humanFolder = gui.addFolder("human");
        humanFolder.add(model.position, "z", 15, 40, 1).name("move");
        humanFolder.open();
        //creat AnimationMixer for animation
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        scene.add(model);
        console.log(mixer.info);
        console.log(gltf);
    });
}

function createChar2() {
    const loader2 = new GLTFLoader();
    loader2.load('./human2/scene.gltf', (gltf) => {
        const model2 = gltf.scene;
        const spotlight = new THREE.SpotLight(0xffffff, 1.0, 120.0, 0.80, 0.0, 0.0);
        spotlight.position.set(-10, 30, 15);
        spotlight.castShadow = true;
        scene.add(spotlight);
        // SpotLight to trace the character
        const targetObject = model2;
        scene.add(targetObject);
        spotlight.target = targetObject;

        model2.position.x = -10;
        model2.position.z = 15;
        model2.scale.set(15.0, 15.0, 15.0);
        model2.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        //creat GUI to control the movement of character
        const gui = new GUI();
        const humanFolder = gui.addFolder("human2");
        humanFolder.add(model2.position, "z", 5, 25, 1).name("move2");
        humanFolder.open();
        //creat AnimationMixer for animation
        mixer2 = new THREE.AnimationMixer(model2);
        mixer2.clipAction(gltf.animations[0]).play();
        scene.add(model2);
        console.log(mixer2.info);
        console.log(gltf);
    });
}



function createBillBoard() {
    //Create screen
    const geometry = new THREE.PlaneGeometry(16, 9);
    const video = document.getElementById('video');
    //Create your video texture:
    const videoTexture = new THREE.VideoTexture(video);
    const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.FrontSide,
        toneMapped: false
    });

    billBoard = new THREE.Mesh(geometry, videoMaterial);
    billBoard.rotation.y = Math.PI / 7;
    billBoard.scale.set(8, 5);
    billBoard.position.set(10, 60, -50);
    billBoard.castShadow = true;
    scene.add(billBoard);
}


function createUtils() {

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);


    // GUI
    const gui = new GUI();
    //Positional sound stop and play
    const soundFolder = gui.addFolder("Positional Audio");
    const playObj = { play: function() { posSound.play() } };
    const stopObj = { stop: function() { posSound.stop() } };
    soundFolder.add(playObj, 'play');
    soundFolder.add(stopObj, 'stop');
    soundFolder.open();

    //Ambient sound stop and play
    const allAudioFolder = gui.addFolder("Ambient Audio");
    const soundplayObj = { play: function() { sound.play() } };
    const soundstopObj = { stop: function() { sound.stop() } };
    allAudioFolder.add(soundplayObj, 'play');
    allAudioFolder.add(soundstopObj, 'stop');
    allAudioFolder.open();
    //billBoard movement
    const videorotateFolder = gui.addFolder("video");
    videorotateFolder.add(billBoard.rotation, "y", -3, 3, .001).name("Rotate");
    videorotateFolder.add(billBoard.position, "y", 25, 60, 1).name("Position");
    videorotateFolder.open();


}


function init() {
    createRenderer()
    createScene()
    createCamera()
    createLight();
    loadbuilding()
    createFloor();
    createChar()
    createChar2()
    createBillBoard();
    createAmbientSound();
    createPositionSound();
    createUtils();
    loadModel();
    shader()
    shader2()
    shader3()
    animate()

}

init()