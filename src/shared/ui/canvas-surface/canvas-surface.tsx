import { Box } from '@mui/material';
import { forwardRef } from 'react';

interface ICanvasSurfaceProps {
  width?: number;
  height?: number;
}

export const CanvasSurface = forwardRef<ICanvasSurfaceProps, HTMLCanvasElement>(
  ({ width, height }, ref) => {
    return <Box component="canvas" ref={ref} width={width} height={height} />;
  }
);

CanvasSurface.displayName = 'CanvasSurface';
