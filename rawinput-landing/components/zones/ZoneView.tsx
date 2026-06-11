"use client";
import { motion } from "framer-motion";

interface ZoneViewProps {
  zoneId: string;
  zoneName: string;
  zoneIcon: string;
  zoneColor: string;
  onExit: () => void;
  children: React.ReactNode;
}

export default function ZoneView({ zoneId, zoneName, zoneIcon, zoneColor, onExit, children }: ZoneViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-[#0a0a1a]"
    >
      {/* Zone header */}
      <div
        className="border-b px-4 py-3"
        style={{ borderColor: zoneColor + "40", background: `linear-gradient(90deg, ${zoneColor}15, transparent)` }}
      >
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-[#8B8B8B] hover:text-white text-sm font-mono flex items-center gap-2 transition-colors"
            >
              ← BACK TO MAP
            </button>
            <div className="w-px h-6 bg-[#333]" />
            <span className="text-2xl">{zoneIcon}</span>
            <div>
              <h2 className="font-heading text-lg font-bold" style={{ color: zoneColor }}>
                {zoneName}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Zone content */}
      <div className="container-wide py-4">
        {children}
      </div>
    </motion.div>
  );
}
