import { useEffect, useState } from 'react';
import { VideoSegment } from '../../shared/lib/ml/video-segment';

interface UseRvmInitOptions {
  modelUrl: string;
}

export const useRvmInit = ({ modelUrl }: UseRvmInitOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
  }, [modelUrl]);

  return { isLoading, error };
};
