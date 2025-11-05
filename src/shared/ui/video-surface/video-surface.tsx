import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
}

export const VideoSurface = ({ stream }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play().catch(console.error);
      };
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  return (
    <Box component="video" ref={videoRef} width={640} height={360} autoPlay playsInline muted />
  );
};
