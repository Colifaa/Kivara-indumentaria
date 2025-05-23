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
              value: "#BB6A8C",
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
              value: 20,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            opacity: {
              value: { min: 0.5, max: 1 },
            },
            shape: {
              type: "char",
              character: {
                value: ["❤" ,"🖤"],
                font: "Verdana",
                style: "",
                weight: "900",
                fill: true
              }
            },
            size: {
              value: { min: 8, max: 12 },
            },
            custom: {
              color: {
                value: {
                  "❤": "#BB6A8C",
                  "🖤":"#B6AEAA",
                }
              }
            }
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}