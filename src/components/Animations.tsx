import React, { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const popIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  60% {
    opacity: 1;
    transform: scale(1.02) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

export const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.35);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(46, 125, 50, 0);
  }
`;

export const pulseSoft = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.95;
  }
`;

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box
      sx={{
        animation: visible ? `${fadeIn} ${duration}s ease-out` : 'none',
        opacity: visible ? 1 : 0
      }}
    >
      {children}
    </Box>
  );
};

export const ScaleIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.4 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box
      sx={{
        animation: visible ? `${scaleIn} ${duration}s ease-out` : 'none',
        opacity: visible ? 1 : 0
      }}
    >
      {children}
    </Box>
  );
};

export const SlideIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box
      sx={{
        animation: visible ? `${slideIn} ${duration}s ease-out` : 'none',
        opacity: visible ? 1 : 0
      }}
    >
      {children}
    </Box>
  );
};

export const BounceIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box
      sx={{
        animation: visible ? `${bounceIn} ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55)` : 'none',
        opacity: visible ? 1 : 0
      }}
    >
      {children}
    </Box>
  );
};

export const PopIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.35 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box
      sx={{
        animation: visible ? `${popIn} ${duration}s ease-out` : 'none',
        opacity: visible ? 1 : 0
      }}
    >
      {children}
    </Box>
  );
};

interface StaggerChildrenProps {
  children: React.ReactNode;
  baseDelay?: number;
  staggerMs?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'pop' | 'bounce';
  duration?: number;
}

const animMap = {
  fade: fadeIn,
  scale: scaleIn,
  slide: slideIn,
  pop: popIn,
  bounce: bounceIn
};

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  baseDelay = 0,
  staggerMs = 60,
  animation = 'fade',
  duration = 0.4
}) => {
  const items = React.Children.toArray(children);
  const keyframesAnim = animMap[animation];

  return (
    <>
      {items.map((child, index) => (
        <Box
          key={index}
          sx={{
            animation: `${keyframesAnim} ${duration}s ease-out`,
            animationDelay: `${(baseDelay + index * staggerMs) / 1000}s`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </Box>
      ))}
    </>
  );
};