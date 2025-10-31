import { useEffect } from 'react';
import { useRvmStore } from '../../stores/rvm/rvm.store';
import { VideoSegment } from '../../shared/lib/ml/video-segmenter/segmentation.ts';

interface UseRvmInitOptions {
  modelUrl: string;
}

export const useRvmInit = ({ modelUrl }: UseRvmInitOptions) => {
  const { setModel, setIsLoading, setError } = useRvmStore();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const videoSegmenter = VideoSegment.getInstance();
        await videoSegmenter.loadModel(modelUrl);
        if (!mounted) return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load RVM model';
        setError(msg);
        console.error('RVM load error', e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [modelUrl, setModel, setIsLoading, setError]);
};
