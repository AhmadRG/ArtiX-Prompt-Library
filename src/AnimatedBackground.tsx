import React from 'react';
import { motion } from 'motion/react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030303]">
      {/* الدائرة المضيئة 1 (اللون الرئيسي) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 150, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[140px]"
      />
      
      {/* الدائرة المضيئة 2 (اللون الثانوي) */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -150, 0],
          y: [0, 150, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-secondary/20 blur-[160px]"
      />

      {/* الدائرة المضيئة 3 (لون بنفسجي لإضافة عمق) */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.4, 0.1],
          x: [0, 100, -100, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-purple-500/20 blur-[120px]"
      />
      
      {/* طبقة Noise خفيفة لإعطاء ملمس سينمائي (اختياري، باستخدام svg) */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* غطاء داكن لدمج الألوان برفق مع الخلفية وتخفيف حدتها */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[80px]" />
    </div>
  );
};

export default AnimatedBackground;
