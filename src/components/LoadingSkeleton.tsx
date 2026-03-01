import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';
import { FadeIn } from './Animations';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'grid';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 3, 
  variant = 'card' 
}) => {
  if (variant === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <FadeIn key={index} delay={index * 80} duration={0.4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width={60} height={24} />
                </Box>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </>
    );
  }

  if (variant === 'list') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <FadeIn key={index} delay={index * 80} duration={0.4}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="100%" height={16} sx={{ mt: 1 }} />
              </Box>
            </Box>
          </FadeIn>
        ))}
      </>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <FadeIn key={index} delay={index * 80} duration={0.4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="70%" height={32} />
              <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;

