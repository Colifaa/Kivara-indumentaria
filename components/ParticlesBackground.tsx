"use client";

import { useCallback } from "react";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";

export function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full  pointer-events-none">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: {
            enable: true,
            zIndex:0
          },
          background: {
            color: {
              value: "#FAD4D8",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#BB6A8C", "#000000", "#FFFFFF"],
            },
            move: {
              enable: true,
              speed: 0.6,
              direction: "top",
              random: true,
              straight: false,
              outModes: {
                default: "out",
              },
            },
            number: {
              value: 50,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            opacity: {
              value: { min: 0.3, max: 0.7 },
            },
            shape: {
              type: ["circle", "square"],
            },
            size: {
              value: { min: 2, max: 6 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}