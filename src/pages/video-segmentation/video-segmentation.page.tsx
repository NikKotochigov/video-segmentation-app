import { Stack } from '@mui/material';
import { VideoInput } from '../../widgets/video-input/video-input';
import { VideoOutput } from '../../widgets/video-output/video-output';
import { RvmInitializer } from '../../features/rvm-init/rvm-initializer';
import { AppContainer } from '../../widgets/app-container/app-container.tsx';

const RVM_MODEL_URL = '/models/rvm_mobilenetv3_tfjs_int8/model.json'; // разместите файлы модели здесь

export const VideoSegmentationPage = () => {
  return (
    <AppContainer>
      <Stack>
        <RvmInitializer modelUrl={RVM_MODEL_URL} />
        <Stack direction="row" spacing={2} alignItems="center">
          <VideoInput />
          <VideoOutput />
        </Stack>
      </Stack>
    </AppContainer>
  );
};
