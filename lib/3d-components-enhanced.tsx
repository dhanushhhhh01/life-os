'use client';

import React, { useRef, useState, useEffect } from 'react';

// ============================================================================
// ENHANCED CARD COMPONENT - Advanced 3D Tilt with Shadows & Lighting
// ============================================================================

interface EnhancedCardProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
  glowIntensity?: number;
}

export const EnhancedCard = React.forwardRef(
  (
    { children, intensity = 12, className = '', glowIntensity = 0.6 }: EnhancedCardProps,
    ref: React.Ref
  ) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [glowColor, setGlowColor] = useState('rgba(70, 240, 210, 0)');

    const handleMouseMove = (e: React.MouseEvent) => {
      const card = cardRef.current as HTMLElement;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Calculate tilt
      const x = -((clientY - centerY) / (centerY)) * intensity;
      const y = ((clientX - centerX) / (centerX)) * intensity;

      setTilt({ x, y });

      // Calculate shadow offset based on mouse position (opposite direction)
      const shadowX = ((clientX - centerX) / centerX) * 15;
      const shadowY = ((clientY - centerY) / centerY) * 15;
      setShadowOffset({ x: shadowX, y: shadowY });

      // Calculate glow color intensity based on position
      const distance = Math.sqrt(
        Math.pow((clientX - centerX) / centerX, 2) +
          Math.pow((clientY - centerY) / centerY, 2)
      );
      const glowAlpha = Math.max(0, (1 - distance) * glowIntensity);
      setGlowColor(`rgba(70, 240, 210, ${glowAlpha})`);
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
      setShadowOffset({ x: 0, y: 0 });
      setGlowColor('rgba(70, 240, 210, 0)');
      setIsHovering(false);
    };

    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovering(true)}
        style={{
          perspective: '600px',
          transformStyle: 'preserve-3d',
        }}
        className={`relative ${className}`}
      >
        <div
          style={{
            transform: `
              perspective(600px)
              rotateX(${tilt.x}deg)
              rotateY(${tilt.y}deg)
              ${isHovering ? 'scale(1.02) translateZ(10px)' : 'scale(1) translateZ(0px)'}
            `,
            transition: isHovering
              ? 'transform 70ms ease-out'
              : 'transform 500ms cubic-bezier(0.23, 1, 0.320, 1)',
            transformStyle: 'preserve-3d',
            boxShadow: `
              ${shadowOffset.x}px ${shadowOffset.y}px 40px rgba(0, 0, 0, 0.3),
              0 0 60px ${glowColor},
              inset 0 0 30px rgba(70, 240, 210, 0.1)
            `,
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(70, 240, 210, ${0.2 + (isHovering ? 0.2 : 0)})`,
          }}
          className="relative rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-900/20 p-6"
        >
          {/* Animated background light */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(
                circle at ${50 + (tilt.y / 2)}% ${50 + (tilt.x / 2)}%,
                rgba(70, 240, 210, 0.1) 0%,
                transparent 70%
              )`,
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
        </div>
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// ============================================================================
// SCROLL TRIGGER HOOK - Detect when elements enter viewport
// ============================================================================

export const useScrollTrigger = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

// ============================================================================
// SCROLL TRIGGER WRAPPER - Animate elements on scroll
// ============================================================================

interface ScrollTriggerWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ScrollTriggerWrapper = ({
  children,
  className = '',
  delay = 0,
}: ScrollTriggerWrapperProps) => {
  const { ref, isVisible } = useScrollTrigger();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `all 800ms cubic-bezier(0.23, 1, 0.320, 1) ${delay}ms`,
      }}
      className={className}
    >
      {children}
    </div>
  );
};

// ============================================================================
// ENHANCED PARTICLES - Mouse Responsive Network
// ============================================================================

interface EnhancedParticlesProps {
  particleCount?: number;
  connectionDistance?: number;
  mouseResponsive?: boolean;
}

export const EnhancedParticles = ({
  particleCount = 80,
  connectionDistance = 130,
  mouseResponsive = true,
}: EnhancedParticlesProps) => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (mouseResponsive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 25, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Keep in bounds
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Mouse interaction
        if (mouseResponsive) {
          const dx = p.x - mousePos.x;
          const dy = p.y - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const force = (200 - distance) / 200;
            p.vx += (dx / distance) * force * 0.15;
            p.vy += (dy / distance) * force * 0.15;
            p.opacity = Math.min(1, p.opacity + 0.1);
          } else {
            p.opacity = Math.max(0.3, p.opacity - 0.02);
          }
        }

        // Draw particle with glow
        ctx.fillStyle = `rgba(70, 240, 210, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.fillStyle = `rgba(70, 240, 210, ${p.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections with gradient
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity =
              ((connectionDistance - distance) / connectionDistance) *
              Math.min(particles[i].opacity, particles[j].opacity);

            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );
            gradient.addColorStop(0, `rgba(70, 240, 210, ${opacity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(251, 226, 180, ${opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(70, 240, 210, ${opacity * 0.6})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (mouseResponsive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [particleCount, connectionDistance, mouseResponsive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.4,
        zIndex: 1,
      }}
    />
  );
};

// ============================================================================
// ENHANCED AMBIENT ORBS - More Dynamic Floating Elements
// ============================================================================

export const EnhancedAmbientOrbs = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Orb 1 - Top Left */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(70, 240, 210, 0.15) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          animation: 'floatA 8s ease-in-out infinite',
          filter: 'blur(60px)',
        }}
      />

      {/* Orb 2 - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 226, 180, 0.12) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-100px',
          animation: 'floatB 10s ease-in-out infinite',
          filter: 'blur(70px)',
        }}
      />

      {/* Orb 3 - Center Top */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147, 112, 219, 0.1) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'floatA 12s ease-in-out infinite reverse',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
};

// ============================================================================
// STAGGERED CONTAINER - For Multiple Animated Children
// ============================================================================

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  className = '',
  staggerDelay = 100,
}: StaggerContainerProps) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <ScrollTriggerWrapper key={index} delay={index * staggerDelay}>
          {child}
        </ScrollTriggerWrapper>
      ))}
    </div>
  );
};
