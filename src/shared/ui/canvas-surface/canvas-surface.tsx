import { Box, Paper, Stack } from '@mui/material';
import { forwardRef, ReactNode } from 'react';

interface Props {
  title: ReactNode;
}

export const CanvasSurface = forwardRef<HTMLCanvasElement, Props>(({ title }, ref) => {
  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>{title}</Box>
      <Paper
        elevation={0}
        sx={{ flex: 1, position: 'relative', bgcolor: 'black', overflow: 'hidden' }}
      >
        <Box component="canvas" ref={ref} sx={{ width: '100%', height: '100%' }} />
      </Paper>
    </Stack>
  );
});

CanvasSurface.displayName = 'CanvasSurface';
