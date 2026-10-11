import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('glass-card-interactive') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#00e5ff',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)`,
          transition: 'width 0.15s ease, height 0.15s ease, background-color 0.15s ease',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.8)'
        }}
      />

      {/* Outer Ring */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovered ? '44px' : '28px',
          height: isHovered ? '44px' : '28px',
          borderRadius: '50%',
          border: isHovered ? '1.5px solid rgba(255, 109, 0, 0.8)' : '1px solid rgba(0, 229, 255, 0.4)',
          backgroundColor: isHovered ? 'rgba(255, 109, 0, 0.08)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: `translate3d(${pos.x - (isHovered ? 22 : 14)}px, ${pos.y - (isHovered ? 22 : 14)}px, 0)`,
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.08s linear, border-color 0.2s ease, background-color 0.2s ease'
        }}
      />
    </>
  );
}
