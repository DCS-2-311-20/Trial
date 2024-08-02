//
// オープンキャンパス 2024
//  by T. Minohara
//  This work is based on "4 Low Poly Toon City Cars" (https://sketchfab.com/3d-models/4-low-poly-toon-city-cars-cdce7c9c2a17473cadd03ce4746b4f13)
//      by Viktor Tselikov (https://sketchfab.com/tselikov.viktor) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
//
"use strict";

import * as THREE from 'three';
import GUI from 'ili-gui';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function init() {
    const param = {
        axes: true,
        birdseye: false,
        walls: false,
        piers: false,
        moveX: false,
        moveZ: false,
        rotate: false,
        cars: "Police"
    };

    // 描画関数の定義
    let theta = 0;
    const radius = 26;
    function render() {
        camera.updateProjectionMatrix();
        theta += 0.005 * Math.PI;
        while (theta > 2 * Math.PI) {
            theta -= 2 * Math.PI;
        }
        car.position.z = (param.moveZ)?radius * Math.sin(theta):0;
        car.position.x = (param.moveX)?radius * Math.cos(theta):radius;
        car.rotation.y = (param.rotate)?-theta:0;
        axes.visible = param.axes;
        walls.visible = param.walls;
        piers.visible = param.piers;
        if (param.birdseye)
            renderer.render(scene, camera2);
        else
            renderer.render(scene, camera);
    }

    // シーン作成
    const scene = new THREE.Scene();

    // 座標軸の設定
    const axes = new THREE.AxesHelper(18);
    //axes.visible = false;
    scene.add(axes);

    // 光源の設定
    const light1 = new THREE.DirectionalLight();
    light1.position.set(20, 20, 40);
    light1.castShadow = true;
    light1.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
    light1.shadow.camera.top = 30;
    light1.shadow.camera.bottom = -30;
    light1.shadow.camera.left = -30;
    light1.shadow.camera.right = 30;
    light1.shadow.camera.near = 0.1;
    light1.shadow.camera.far = 120;
    light1.shadow.bias= -0.002;
    scene.add(light1);
    const light2 = new THREE.AmbientLight('white', 0.5);
    scene.add(light2);

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
        60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(70, 20, 0);
    camera.lookAt(0,0,0);
    const camera2 = new THREE.PerspectiveCamera(
        60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera2.position.set(0, 70, 0);
    camera2.up.set(-1,0,0);
    camera2.lookAt(0,0,0);


    // レンダラの設定
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x507090 );
    renderer.shadowMap.enabled = true;
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    // 平面の設定
    const ringMaterial = new THREE.MeshLambertMaterial(
        {color: 0xd0d0c0, side:THREE.DoubleSide})
    
    const top = new THREE.Mesh(
        new THREE.RingGeometry(22, 30),
        ringMaterial
    );
    top.rotateX(-Math.PI/2);
    top.receiveShadow = true;
    scene.add(top);

    const walls = new THREE.Group();
    const outer = new THREE.Mesh(
        new THREE.CylinderGeometry(30, 30, 2, 32, 1, true),
        ringMaterial
    );
    outer.castShadow = true;
    outer.receiveShadow = true;
    walls.add(outer);
    const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(22, 22, 2, 32, 1, true),
        ringMaterial
    );
    inner.castShadow = true;
    inner.receiveShadow = true;
    walls.add(inner);
    scene.add(walls);
    
    const piers = new THREE.Group();
    const N = 12;
    for (let i = 0; i < N; i++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(7,5,2),
            ringMaterial
        );
        box.position.set(
            radius*Math.cos(2*i*Math.PI/N),
            -2.6,
            radius*Math.sin(2*i*Math.PI/N)
        )
        box.rotateY(-2*i*Math.PI/N);
        piers.add(box);
    }
    scene.add(piers);
    
    const modelLoader = new GLTFLoader();
    const PREFIX = "SHTV_Prefab_Car_"
    const cars = [];
    const carNames = [];
    let car;
    modelLoader.load("public/cars/scene.gltf", model => {
        model.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
            if (obj.name.indexOf(PREFIX) == 0) {
                const name = obj.name.substring(PREFIX.length);
                carNames.push(name);
                obj.position.set(0,0,0);
                obj.rotation.y = 0;
                obj.scale.set(0.01,0.01,0.01);
                obj.visible = false;
                cars[name] = obj;
            }
        });
        gui.add(param, "cars", carNames).onChange(newcar => {
            car.visible = false;
            car = cars[newcar];
            car.visible = true;
        }).name("車の種類");
        carNames.map( name => {
            scene.add(cars[name]);
        });
        car = cars[param.cars];
        car.visible = true;
        car.position.x = radius;
        renderer.setAnimationLoop(render);
    });

    // カメラのコントローラ
    const gui = new GUI();
    gui.add(param, "axes").name("座標軸");
    gui.add(param, "birdseye").name("俯瞰");
    gui.add(param, "walls").name("側壁");
    gui.add(param, "piers").name("橋脚");
    gui.add(param, "moveZ").name("z軸方向の移動");
    gui.add(param, "moveX").name("x軸方向の移動");
    gui.add(param, "rotate").name("回転");

    // ウィンドウサイズの変更
    window.addEventListener("resize", ()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        camera2.aspect = window.innerWidth / window.innerHeight;
        camera2.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false);


}

init();