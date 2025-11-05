import { Box } from '@mui/material';
import { forwardRef } from 'react';

export const CanvasSurface = forwardRef<HTMLCanvasElement>(({}, ref) => {
  return <Box component="canvas" ref={ref} width={640} height={360} />;
});

CanvasSurface.displayName = 'CanvasSurface';
