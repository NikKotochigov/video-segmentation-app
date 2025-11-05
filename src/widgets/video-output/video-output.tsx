import { Box, Stack, Chip } from '@mui/material';
import { useVideoStreamStore } from '../../stores/video-stream/video-stream.store';
import { RvmInfer } from '../../features/rvm-infer/rvm-infer';

export const VideoOutput = () => {
  const { segmentedStream } = useVideoStreamStore();

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Chip
          label={segmentedStream ? 'Обработка активна' : 'Ожидание обработки'}
          color={segmentedStream ? 'success' : 'default'}
        />
      </Box>
      <Box sx={{ flex: 1, minHeight: 240 }}>
        <RvmInfer />
      </Box>
    </Stack>
  );
};
