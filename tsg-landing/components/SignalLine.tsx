"use client";
import { motion } from "framer-motion";

export default function SignalLine() {
  return <motion.div className="absolute left-0 right-0 top-1/2 h-px bg-signal/70" initial={{ opacity: 0.2 }} animate={{ opacity: [0.2, 1, 0.3] }} transition={{ duration: 2 }} />;
}
