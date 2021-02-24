import BrowserBehavior from '../browserbehavior/BrowserBehavior';
import Device from '../devicecontroller/Device';
import VideoTransformDevice from '../devicecontroller/VideoTransformDevice';
import Logger from '../logger/Logger';
import DefaultVideoTransformDeviceObserver from './DefaultVideoTransformDeviceObserver';
import VideoFrameProcessor from './VideoFrameProcessor';
import VideoFrameProcessorPipelineObserver from './VideoFrameProcessorPipelineObserver';
/**
 * [[DefaultVideoTransformDevice]] is an augmented [[VideoInputDevice]].
 * It transform the input {@link Device} with an array of {@link VideoFrameProcessor} to produce a `MediaStream`.
 */
export default class DefaultVideoTransformDevice implements VideoTransformDevice, VideoFrameProcessorPipelineObserver {
    private logger;
    private device;
    private processors;
    private browserBehavior;
    private pipe;
    private inputMediaStream;
    private observers;
    constructor(logger: Logger, device: Device, processors: VideoFrameProcessor[], browserBehavior?: BrowserBehavior);
    /**
     * getter for `outputMediaStream`.
     * `outputMediaStream` is returned by internal {@link VideoFrameProcessorPipeline}.
     * It is possible, but unlikely, that this accessor will throw.
     */
    get outputMediaStream(): MediaStream;
    /**
     * `chooseNewInnerDevice` preserves the inner pipeline and processing state and switches
     * the inner device. Since the pipeline and processors are shared with the new transform device
     * only one transform device can be used.
     */
    chooseNewInnerDevice(newDevice: Device): DefaultVideoTransformDevice;
    /**
     * Return the inner device as provided during construction.
     */
    getInnerDevice(): Device;
    intrinsicDevice(): Promise<Device>;
    /**
     * Create {@link VideoFrameProcessorPipeline} if there is not a existing one and start video processors.
     * Returns output `MediaStream` produced by {@link VideoFrameProcessorPipeline}.
     */
    transformStream(mediaStream?: MediaStream): Promise<MediaStream>;
    /**
     * onOutputStreamDisconnect is called when device controller wants to detach
     * the transform device. The default behavior is to stop the output
     * media stream and release the input the media stream. If the input media stream
     * is the provided device, it will not be released.
     */
    onOutputStreamDisconnect(): void;
    /**
     * Dispose of the inner workings of the transform device, including pipeline and processors.
     * `stop` can only be called when the transform device is not used by device controller anymore.
     * After `stop` is called, all transform devices which share the pipeline must be discarded.
     */
    stop(): Promise<void>;
    /**
     * Add an observer to receive notifications about lifecycle events.
     * See {@link DefaultVideoTransformDeviceObserver} for details.
     * If the observer has already been added, this method call has no effect.
     */
    addObserver(observer: DefaultVideoTransformDeviceObserver): void;
    /**
     * Remove an existing observer. If the observer has not been previously. this method call has no effect.
     */
    removeObserver(observer: DefaultVideoTransformDeviceObserver): void;
    processingDidStart(): void;
    processingLatencyTooHigh(latencyMs: number): void;
    processingDidFailToStart(): void;
    processingDidStop(): void;
    private forEachObserver;
}
