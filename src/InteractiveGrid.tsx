import React, { useRef, useEffect } from 'react';

const InteractiveGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots(); 
    };

    let mouse = { x: -1000, y: -1000 }; // قيمة ابتدائية خارج الشاشة
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    let dots: {x: number, y: number, radius: number}[] = [];
    const spacing = 35; 
    const baseRadius = 1; 
    const maxRadius = 3.5; 
    const interactionRadius = 120; 

    const initDots = () => {
      dots = [];
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          dots.push({ x, y, radius: baseRadius });
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = '#0a0a0a'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        let dx = mouse.x - dot.x;
        let dy = mouse.y - dot.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < interactionRadius) {
          const ratio = (interactionRadius - distance) / interactionRadius;
          dot.radius = baseRadius + (maxRadius - baseRadius) * ratio;
          ctx.fillStyle = `rgba(150, 150, 255, ${0.2 + ratio})`; 
        } else {
          dot.radius = Math.max(baseRadius, dot.radius - 0.1);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1, 
        pointerEvents: 'none' 
      }}
    />
  );
};

export default InteractiveGrid;

///كيف يمكنك تخصيص هذا الكود ليناسب ذوقك؟
///قم بتعديل المتغيرات التالية داخل الكود للحصول على الشكل الدقيق الذي تريده:

///spacing: لتحديد كثافة الشبكة (تكبير الرقم يقلل عدد النقاط، وتصغيره يزيدها).

///interactionRadius: لتحديد مدى بُعد النقاط التي تتأثر بالماوس (حجم دائرة التوهج).

///maxRadius: الحجم الأقصى الذي تصل إليه النقطة المضيئة.

///ctx.fillStyle: يمكنك تغيير ألوان النقطة المضيئة والنقطة الخافتة لتتناسب مع هوية موقعك البصرية.