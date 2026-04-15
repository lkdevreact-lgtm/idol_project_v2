import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { SOCKET_URL } from "../../utils/constant";

let particlesInitPromise = null;

const ParticleOverlayRenderer = ({ overlay }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!particlesInitPromise) {
      particlesInitPromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    particlesInitPromise.then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  const config = overlay.particle_config || {};
  
  // Transform our simplified config panel settings into tsParticles format
  // Fallbacks applied safely
  const direction = config.direction || "bottom";
  const pSpeed = config.speed || { min: 2, max: 5 };
  const pSize = config.size || { min: 15, max: 35 };
  const pOpacity = config.opacity || { min: 0.6, max: 0.9 };
  const quantity = config.quantity ?? 30;

  // Build the tsParticles options rationally
  const particleOptions = {
    fullScreen: { enable: false },
    particles: {
      number: { 
        value: direction === "none" ? 0 : quantity, // If explosion, start with 0
      },
      shape: {
        type: overlay.media_url ? "image" : "circle",
        options: overlay.media_url ? {
          image: {
            src: `${SOCKET_URL}${overlay.media_url}`,
            width: 100,
            height: 100,
          }
        } : undefined
      },
      color: { value: overlay.preview_color || "#d946ef" },
      opacity: {
        value: pOpacity,
        animation: config.fadeOut ? { enable: true, speed: 0.5, minimumValue: 0, sync: false } : undefined
      },
      size: { value: pSize, random: true },
      move: {
        enable: true,
        speed: pSpeed,
        direction: direction,
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      rotate: config.rotation ? {
        value: { min: 0, max: 360 },
        random: true,
        direction: "random",
        animation: { enable: true, speed: config.rotationSpeed || 8 }
      } : { value: 0 },
      wobble: config.wobble ? {
        enable: true,
        distance: 10,
        speed: config.wobbleSpeed || 3
      } : undefined
    },
    // Emitters configuration for continuous rain or burst
    emitters: direction === "none" 
      ? {
          direction: "none",
          rate: { quantity: quantity, delay: 0.1 },
          size: { width: 0, height: 0 },
          position: { x: 50, y: 50 },
          life: { duration: 0.1, count: 1 } // Burst once
        } 
      : {
          direction: direction,
          rate: { quantity: Math.ceil(quantity / 10), delay: 0.2 }, // Emit continuously
          size: { width: 100, height: 0 },
          position: direction === "bottom" ? { x: 50, y: -5 } : (direction === "top" ? { x: 50, y: 105 } : { x: 50, y: 50 })
        }
  };

  return (
    <div className="absolute inset-0 z-[80] pointer-events-none overflow-hidden">
      <Particles
        id={`particle-overlay-${overlay.id || Math.random()}`}
        options={particleOptions}
        className="w-full h-full"
      />
    </div>
  );
};

export default ParticleOverlayRenderer;
