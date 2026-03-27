import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import { useVideoStore } from './hooks/useVideoStore'
import { GreenScreenVideo } from './components/GreenScreenVideo'
import SelectThumbnail from './components/SelectThumbnail'
import * as THREE from 'three'
import { BlackScreenVideo } from './components/BlackScreenVideo'

const StageLights = () => {
  const spotLightRef1 = useRef()
  const spotLightRef2 = useRef()
  const mainSpotLightRef = useRef()

  const target1 = useRef(new THREE.Object3D())
  const target2 = useRef(new THREE.Object3D())
  const targetMain = useRef(new THREE.Object3D())

  // target positions
  target1.current.position.set(0, -1, -5)
  target2.current.position.set(0, -1, -5)
  targetMain.current.position.set(0, -1, -5)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    
    // Flashing effect and moving slightly
    if (spotLightRef1.current) {
      spotLightRef1.current.intensity = 3 + Math.sin(t * 6) * 3
      spotLightRef1.current.position.x = -3 + Math.sin(t * 2) * 1.5
    }
    if (spotLightRef2.current) {
      spotLightRef2.current.intensity = 3 + Math.cos(t * 7) * 3
      spotLightRef2.current.position.x = 3 + Math.cos(t * 1.5) * 1.5
    }
    // Main spotlight flickering slightly
    if (mainSpotLightRef.current) {
      mainSpotLightRef.current.intensity = 5 + Math.sin(t * 10) * 1
    }
  })

  return (
    <>
      <primitive object={target1.current} />
      <primitive object={target2.current} />
      <primitive object={targetMain.current} />

      <ambientLight intensity={0.5} />
      
      {/* Main Center Light */}
      <SpotLight
        ref={mainSpotLightRef}
        penumbra={0.8}
        distance={20}
        angle={0.6}
        attenuation={4}
        anglePower={5}
        intensity={5}
        color="#ffffff"
        position={[0, 6, 2]}
        target={targetMain.current}
      />

      {/* Flashing Light 1 */}
      <SpotLight
        ref={spotLightRef1}
        penumbra={0.6}
        distance={20}
        angle={0.4}
        attenuation={5}
        anglePower={4}
        intensity={3}
        color="#ff00ff"
        position={[-3, 5, 2]}
        target={target1.current}
      />

      {/* Flashing Light 2 */}
      <SpotLight
        ref={spotLightRef2}
        penumbra={0.6}
        distance={20}
        angle={0.4}
        attenuation={5}
        anglePower={4}
        intensity={3}
        color="#00ffff"
        position={[3, 5, 2]}
        target={target2.current}
      />
    </>
  )
}

const App = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo)

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {/* Background Image */}
      <img 
        src="/images/background.png" 
        alt="background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <StageLights />
          {selectedVideo && <BlackScreenVideo videoSrc={selectedVideo} />}
        </Canvas>
      </div>

      {/* UI Layer */}
      <SelectThumbnail />
    </div>
  )
}

export default App