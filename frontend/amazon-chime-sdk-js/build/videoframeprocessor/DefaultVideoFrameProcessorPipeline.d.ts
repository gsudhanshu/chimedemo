import Logger from '../logger/Logger';
import VideoFrameProcessor from './VideoFrameProcessor';
import VideoFrameProcessorPipeline from './VideoFrameProcessorPipeline';
import VideoFrameProcessorPipelineObserver from './VideoFrameProcessorPipelineObserver';
/**
 * [[DefaultVideoFrameProcessorPipeline]] implements {@link VideoFrameProcessorPipeline}.
 * It constructs a buffer {@link CanvasVideoFrameBuffer} as source by default and invokes processor based on `framerate`.
 * The default output type is `MediaStream`.
 */
export default class DefaultVideoFrameProcessorPipeline implements VideoFrameProcessorPipeline {
    private logger;
    private stages;
    private fr;
    outputMediaStream: MediaStream;
    private videoInput;
    private canvasOutput;
    private outputCtx;
    private canvasInput;
    private inputCtx;
    private inputVideoStream;
    private sourceBuffers;
    private destBuffers;
    private observers;
    private hasStarted;
    private lastTimeOut;
    constructor(logger: Logger, stages: VideoFrameProcessor[]);
    destroy(): void;
    get framerate(): number;
    set framerate(value: number);
    stop(): void;
    addObserver(observer: VideoFrameProcessorPipelineObserver): void;
    removeObserver(observer: VideoFrameProcessorPipelineObserver): void;
    getInputMediaStream(): Promise<MediaStream | null>;
    getActiveOutputMediaStream(): MediaStream;
    /**
     * `inputMediaStream` is by default used to construct one {@link CanvasVideoFrameBuffer}
     * The buffer will be fed into the first {@link VideoFrameProcessor}.
     */
    setInputMediaStream(inputMediaStream: MediaStream | null): Promise<void>;
    set processors(stages: VideoFrameProcessor[]);
    get processors(): VideoFrameProcessor[];
    process: (_event: Event) => Promise<void>;
    private forEachObserver;
    private destroyInputMediaStreamAndBuffers;
}
