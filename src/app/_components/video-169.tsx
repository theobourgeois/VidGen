import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

interface VideoPlayer916Props {
  src: string;
  poster?: string;
}

export interface VideoPlayer916Ref {
  download: () => void;
}

const VideoPlayer916 = forwardRef<VideoPlayer916Ref, VideoPlayer916Props>(
  ({ src, poster }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      download: () => {
        if (videoRef.current) {
          const a = document.createElement("a");
          a.href = videoRef.current.src;
          a.download = "video.mp4";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
    }));

    return (
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-black shadow-lg">
        <div className="aspect-[9/16]">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-cover"
            controls
          />
        </div>
      </div>
    );
  },
);

VideoPlayer916.displayName = "VideoPlayer916";

export default VideoPlayer916;
