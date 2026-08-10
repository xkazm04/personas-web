"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Scene } from "./data";
import type { FieldLayout, Point } from "./layout";
import { Travel, type Spring } from "./parts";

/**
 * Athena, reading the field.
 *
 * She has one job here and the composition gives her exactly one movement for
 * it: she rides down the lattice while the survey band rides with her, and
 * when it is done she goes and stands at the head of the list — which is the
 * only claim this section needs her to make. She put them in that order.
 *
 * Placed by the same percent geometry everything else uses and moved only by
 * transform, so nothing on the field reflows while she crosses it.
 */

const GLIDE: Spring = { type: "spring", stiffness: 58, damping: 15, mass: 0.9 };
const STILL: Spring = { duration: 0 };

function whereShe(L: FieldLayout, scene: Scene): Point {
  if (scene.lifted) return L.head;
  if (scene.surveying) {
    return { x: L.lane, y: L.rowTop + (Math.max(scene.band, 0) + 0.5) * L.rowH };
  }
  return L.dock;
}

export default function Surveyor({
  L,
  scene,
  reduced,
}: {
  L: FieldLayout;
  scene: Scene;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const at = whereShe(L, scene);
  const awake = scene.surveying || scene.lifted;
  return (
    <Travel x={at.x} y={at.y} spring={reduced ? STILL : GLIDE} z={30}>
      <div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="relative">
          {/* Halo — it blooms the moment she starts reading */}
          <motion.span
            className="absolute -inset-3 rounded-full blur-xl"
            style={{ backgroundColor: tint("cyan", 32) }}
            initial={false}
            animate={
              reduced
                ? { opacity: awake ? 0.8 : 0.2 }
                : scene.surveying
                  ? { opacity: [0.55, 1, 0.55], scale: [1, 1.14, 1] }
                  : { opacity: awake ? 0.7 : 0.18, scale: 1 }
            }
            transition={
              scene.surveying && !reduced
                ? { duration: 1.5, repeat: Infinity }
                : { duration: 0.5 }
            }
          />
          {/* A slow dashed ring while she is still reading */}
          <motion.span
            className="absolute -inset-1.5 rounded-full border border-dashed"
            style={{ borderColor: tint("cyan", awake ? 40 : 12) }}
            animate={scene.surveying && !reduced ? { rotate: 360 } : { rotate: 0 }}
            transition={
              scene.surveying && !reduced
                ? { duration: 22, repeat: Infinity, ease: "linear" }
                : { duration: 0.4 }
            }
          />
          <motion.span
            className="relative block h-9 w-9 overflow-hidden rounded-full border sm:h-11 sm:w-11"
            style={{
              borderColor: tint("cyan", awake ? 55 : 20),
              boxShadow: awake ? brandShadow("cyan", 26, 40) : undefined,
            }}
            initial={false}
            animate={{ opacity: awake ? 1 : 0.5, scale: awake ? 1 : 0.9 }}
            transition={reduced ? STILL : { duration: 0.5, ease: "easeOut" }}
          >
            {reduced ? (
              <Image
                src="/athena/athena_baseline.jpg"
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                ref={avatarRef}
                src="/athena/athena_idle_loop.mp4"
                poster="/athena/athena_baseline.jpg"
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </motion.span>
        </div>
      </div>
    </Travel>
  );
}
