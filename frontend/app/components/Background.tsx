"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF, Center } from "@react-three/drei";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";

function Model({ onLoaded }: { onLoaded: () => void }) {
  const { scene } = useGLTF("/models/thai_court.glb");
  
  // シーンが用意できたらロード完了を通知
  useEffect(() => {
    if (scene) {
      onLoaded();
    }
  }, [scene, onLoaded]);

  return (
    <primitive 
      object={scene} 
      // モデルの大きさ
      scale={2} 
      // モデルの位置
      position={[-11, -3, 15]} 
    />
  );
}

// Canvas内での登場アニメーションと回転を制御するコンポーネント
function SceneContents() {
  const [loaded, setLoaded] = useState(false);
  const modelRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!modelRef.current) return;

    // ロード完了前はさらに奥(-20)、完了後は手前(0)へ移動
    const targetZ = loaded ? 0 : -20;
    modelRef.current.position.z += (targetZ - modelRef.current.position.z) * 0.07;

    // 回転方法
    modelRef.current.rotation.y += 0.003;
  });

  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight position={[7, 5, 5]} intensity={1.2} />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Center>
          {/* おくから手前に来る距離 */}
          <group ref={modelRef} position={[0, 0, -500]}>
            <Suspense fallback={null}>
              <Model onLoaded={() => setLoaded(true)} />
            </Suspense>
          </group>
        </Center>
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

export default function Background() {
  return (
    <div className="h-full w-full">
      {/* カメラの角度 */}
      <Canvas camera={{ position: [0, 1, 5] }}>
        <SceneContents />
      </Canvas>
    </div>
  );
}
