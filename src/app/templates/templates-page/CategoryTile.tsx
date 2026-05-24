import { motion } from "framer-motion";
import Image from "next/image";

import { fadeUp } from "@/lib/animations";
import type { Category } from "@/lib/templates";

import { CATEGORY_IMAGES, categoryAccent } from "./templatePageConfig";

export function CategoryTile({
  category,
  count,
  onSelect,
}: {
  category: Category;
  count: number;
  onSelect: () => void;
}) {
  const images = CATEGORY_IMAGES[category];

  return (
    <motion.button
      variants={fadeUp}
      onClick={onSelect}
      className={`group relative flex h-52 cursor-pointer items-end overflow-hidden rounded-2xl border border-l-2 text-left transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 sm:h-[260px] ${categoryAccent[category]} border-glass-hover`}
    >
      <div className="absolute inset-0 transition-opacity duration-500 opacity-60 group-hover:opacity-100">
        <Image
          src={images.dark}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          aria-hidden="true"
          className="hidden dark:block object-cover"
        />
        <Image
          src={images.light}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          aria-hidden="true"
          className="block dark:hidden object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full p-4 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-2xl">
            {category}
          </h3>
          <span className="rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-0.5 text-sm font-medium text-white">
            {count}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
