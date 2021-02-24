"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasVideoFrameBuffer_1 = require("./CanvasVideoFrameBuffer");
const DEFAULT_FRAMERATE = 15;
/**
 * [[DefaultVideoFrameProcessorPipeline]] implements {@link VideoFrameProcessorPipeline}.
 * It constructs a buffer {@link CanvasVideoFrameBuffer} as source by default and invokes processor based on `framerate`.
 * The default output type is `MediaStream`.
 */
class DefaultVideoFrameProcessorPipeline {
    constructor(logger, stages) {
        this.logger = logger;
        this.stages = stages;
        this.fr = DEFAULT_FRAMERATE;
        // initialize with dummy inactive MediaStream to keep strict type
        this.outputMediaStream = new MediaStream();
        this.videoInput = document.createElement('video');
        this.canvasOutput = document.createElement('canvas');
        this.outputCtx = this.canvasOutput.getContext('2d');
        this.canvasInput = document.createElement('canvas');
        this.inputCtx = this.canvasInput.getContext('2d');
        this.inputVideoStream = null;
        this.sourceBuffers = [];
        this.destBuffers = [];
        this.observers = new Set();
        this.hasStarted = false;
        this.process = (_event) => __awaiter(this, void 0, void 0, function* () {
            if (!this.inputVideoStream) {
                return;
            }
            const processVideoStart = performance.now();
            // videoWidth is intrinsic video width
            if (this.videoInput.videoWidth) {
                if (this.canvasInput.width !== this.videoInput.videoWidth) {
                    this.canvasInput.width = this.videoInput.videoWidth;
                    this.canvasInput.height = this.videoInput.videoHeight;
                    this.sourceBuffers[0].height = this.canvasInput.height;
                    this.sourceBuffers[0].width = this.canvasInput.width;
                    this.sourceBuffers[0].framerate = this.framerate;
                }
                this.inputCtx.drawImage(this.videoInput, 0, 0);
            }
            // processes input buffers
            let buffers = [];
            buffers.push(this.sourceBuffers[0]);
            try {
                for (const proc of this.processors) {
                    buffers = yield proc.process(buffers);
                }
            }
            catch (_error) {
                this.forEachObserver(obs => {
                    if (obs.processingDidFailToStart) {
                        obs.processingDidFailToStart();
                    }
                });
                return;
            }
            this.destBuffers = buffers;
            let imageSource;
            try {
                imageSource = yield this.destBuffers[0].asCanvasImageSource();
            }
            catch (error) {
                if (this.inputVideoStream) {
                    this.logger.info('buffers are destroyed and pipeline could not start');
                    this.forEachObserver(obs => {
                        if (obs.processingDidFailToStart) {
                            obs.processingDidFailToStart();
                        }
                    });
                }
                return;
            }
            // finally draws the image
            const frameWidth = imageSource.width;
            const frameHeight = imageSource.height;
            if (frameWidth !== 0 && frameHeight !== 0) {
                if (this.canvasOutput.width !== frameWidth && this.canvasOutput.height !== frameHeight) {
                    this.canvasOutput.width = frameWidth;
                    this.canvasOutput.height = frameHeight;
                }
                this.outputCtx.drawImage(imageSource, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                if (!this.hasStarted) {
                    this.hasStarted = true;
                    this.forEachObserver(observer => {
                        if (observer.processingDidStart) {
                            observer.processingDidStart();
                        }
                    });
                }
            }
            // measures time
            const processVideoLatency = performance.now() - processVideoStart;
            const leave = (1000 * 2) / this.framerate - processVideoLatency; // half fps
            const nextFrameDelay = Math.max(0, 1000 / this.framerate - processVideoLatency);
            if (leave <= 0) {
                this.forEachObserver(obs => {
                    if (obs.processingLatencyTooHigh) {
                        obs.processingLatencyTooHigh(processVideoLatency);
                    }
                });
            }
            // TODO: use requestAnimationFrame which is more organic and allows browser to conserve resources by its choices.
            this.lastTimeOut = setTimeout(this.process, nextFrameDelay);
        });
    }
    destroy() {
        this.stop();
        if (this.stages) {
            for (const stage of this.stages) {
                stage.destroy();
            }
        }
    }
    get framerate() {
        return this.fr;
    }
    // A negative framerate will cause `captureStream` to throw `NotSupportedError`.
    // The setter prevents this by switching to the default framerate if less than 0.
    set framerate(value) {
        this.fr = value < 0 ? DEFAULT_FRAMERATE : value;
    }
    stop() {
        // empty stream, stop pipeline
        // null input media stream stops the pipeline.
        this.videoInput.removeEventListener('loadedmetadata', this.process);
        this.videoInput.srcObject = null;
        // clean input stream and buffers
        this.destroyInputMediaStreamAndBuffers();
        if (this.outputMediaStream) {
            for (const track of this.outputMediaStream.getVideoTracks()) {
                track.stop();
            }
        }
        // clear output stream
        this.outputMediaStream = new MediaStream();
        if (this.lastTimeOut) {
            clearTimeout(this.lastTimeOut);
            this.lastTimeOut = undefined;
        }
        if (this.hasStarted) {
            this.hasStarted = false;
            this.forEachObserver(observer => {
                if (observer.processingDidStop) {
                    observer.processingDidStop();
                }
            });
        }
    }
    addObserver(observer) {
        this.observers.add(observer);
    }
    removeObserver(observer) {
        this.observers.delete(observer);
    }
    getInputMediaStream() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.inputVideoStream;
        });
    }
    getActiveOutputMediaStream() {
        if (this.outputMediaStream && this.outputMediaStream.active) {
            return this.outputMediaStream;
        }
        return (this.outputMediaStream = this.canvasOutput.captureStream(this.framerate));
    }
    /**
     * `inputMediaStream` is by default used to construct one {@link CanvasVideoFrameBuffer}
     * The buffer will be fed into the first {@link VideoFrameProcessor}.
     */
    setInputMediaStream(inputMediaStream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!inputMediaStream) {
                this.stop();
                return;
            }
            if (inputMediaStream.getVideoTracks().length === 0) {
                this.logger.error('No video tracks in input media stream, ignoring');
                return;
            }
            this.inputVideoStream = inputMediaStream;
            const settings = this.inputVideoStream.getVideoTracks()[0].getSettings();
            this.logger.info(`processing pipeline input stream settings ${settings}`);
            this.canvasOutput.width = settings.width;
            this.canvasOutput.height = settings.height;
            this.videoInput.addEventListener('loadedmetadata', this.process);
            this.videoInput.srcObject = this.inputVideoStream;
            // avoid iOS safari full screen video
            this.videoInput.setAttribute('playsinline', 'true');
            // create sources
            const canvasBuffer = new CanvasVideoFrameBuffer_1.default(this.canvasInput);
            this.sourceBuffers.push(canvasBuffer);
            this.videoInput.load();
            yield this.videoInput.play();
        });
    }
    set processors(stages) {
        this.stages = stages;
    }
    get processors() {
        return this.stages;
    }
    forEachObserver(observerFunc) {
        for (const observer of this.observers) {
            setTimeout(() => {
                observerFunc(observer);
            }, 0);
        }
    }
    destroyInputMediaStreamAndBuffers() {
        if (this.inputVideoStream) {
            for (const track of this.inputVideoStream.getTracks()) {
                track.stop();
            }
        }
        this.inputVideoStream = null;
        for (const buffer of this.sourceBuffers) {
            buffer.destroy();
        }
        this.sourceBuffers = [];
    }
}
exports.default = DefaultVideoFrameProcessorPipeline;
//# sourceMappingURL=DefaultVideoFrameProcessorPipeline.js.map