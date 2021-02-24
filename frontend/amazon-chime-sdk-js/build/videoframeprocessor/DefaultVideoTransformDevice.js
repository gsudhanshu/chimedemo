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
const DefaultBrowserBehavior_1 = require("../browserbehavior/DefaultBrowserBehavior");
const DefaultVideoFrameProcessorPipeline_1 = require("./DefaultVideoFrameProcessorPipeline");
/**
 * [[DefaultVideoTransformDevice]] is an augmented [[VideoInputDevice]].
 * It transform the input {@link Device} with an array of {@link VideoFrameProcessor} to produce a `MediaStream`.
 */
class DefaultVideoTransformDevice {
    constructor(logger, device, processors, browserBehavior = new DefaultBrowserBehavior_1.default()) {
        this.logger = logger;
        this.device = device;
        this.processors = processors;
        this.browserBehavior = browserBehavior;
        this.observers = new Set();
        this.pipe = new DefaultVideoFrameProcessorPipeline_1.default(this.logger, this.processors);
        this.pipe.addObserver(this);
    }
    /**
     * getter for `outputMediaStream`.
     * `outputMediaStream` is returned by internal {@link VideoFrameProcessorPipeline}.
     * It is possible, but unlikely, that this accessor will throw.
     */
    get outputMediaStream() {
        return this.pipe.outputMediaStream;
    }
    /**
     * `chooseNewInnerDevice` preserves the inner pipeline and processing state and switches
     * the inner device. Since the pipeline and processors are shared with the new transform device
     * only one transform device can be used.
     */
    chooseNewInnerDevice(newDevice) {
        const newTransformDevice = new DefaultVideoTransformDevice(this.logger, newDevice, this.processors, this.browserBehavior);
        newTransformDevice.pipe = this.pipe;
        return newTransformDevice;
    }
    /**
     * Return the inner device as provided during construction.
     */
    getInnerDevice() {
        return this.device;
    }
    intrinsicDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            const trackConstraints = {};
            // Empty string and null.
            if (!this.device) {
                return trackConstraints;
            }
            // Device ID.
            if (typeof this.device === 'string') {
                if (this.browserBehavior.requiresNoExactMediaStreamConstraints()) {
                    trackConstraints.deviceId = this.device;
                }
                else {
                    trackConstraints.deviceId = { exact: this.device };
                }
                return trackConstraints;
            }
            if (this.device.id) {
                // Nothing we can do.
                return this.device;
            }
            // It's constraints.
            return Object.assign(Object.assign({}, this.device), trackConstraints);
        });
    }
    /**
     * Create {@link VideoFrameProcessorPipeline} if there is not a existing one and start video processors.
     * Returns output `MediaStream` produced by {@link VideoFrameProcessorPipeline}.
     */
    transformStream(mediaStream) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pipe.setInputMediaStream(mediaStream);
            this.inputMediaStream = mediaStream;
            return this.pipe.getActiveOutputMediaStream();
        });
    }
    /**
     * onOutputStreamDisconnect is called when device controller wants to detach
     * the transform device. The default behavior is to stop the output
     * media stream and release the input the media stream. If the input media stream
     * is the provided device, it will not be released.
     */
    onOutputStreamDisconnect() {
        this.logger.info('DefaultVideoTransformDevice: detach stopping input media stream');
        const deviceIsMediaStream = this.device && this.device.id;
        // Stop processing but keep the pipe and processors
        this.pipe.stop();
        // Turn off the camera, unless device is a MediaStream
        if (!deviceIsMediaStream) {
            if (this.inputMediaStream) {
                for (const track of this.inputMediaStream.getVideoTracks()) {
                    track.stop();
                }
            }
        }
    }
    /**
     * Dispose of the inner workings of the transform device, including pipeline and processors.
     * `stop` can only be called when the transform device is not used by device controller anymore.
     * After `stop` is called, all transform devices which share the pipeline must be discarded.
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inputMediaStream) {
                for (const track of this.inputMediaStream.getVideoTracks()) {
                    track.stop();
                }
            }
            this.pipe.destroy();
            this.inputMediaStream = null;
        });
    }
    /**
     * Add an observer to receive notifications about lifecycle events.
     * See {@link DefaultVideoTransformDeviceObserver} for details.
     * If the observer has already been added, this method call has no effect.
     */
    addObserver(observer) {
        this.observers.add(observer);
    }
    /**
     * Remove an existing observer. If the observer has not been previously. this method call has no effect.
     */
    removeObserver(observer) {
        this.observers.add(observer);
    }
    processingDidStart() {
        this.logger.info('video transform device processing started');
        this.forEachObserver(observer => {
            if (observer.processingDidStart) {
                observer.processingDidStart();
            }
        });
    }
    processingLatencyTooHigh(latencyMs) {
        this.forEachObserver(observer => {
            if (observer.processingLatencyTooHigh) {
                observer.processingLatencyTooHigh(latencyMs);
            }
        });
    }
    processingDidFailToStart() {
        this.logger.info('video transform device processing failed to start');
        this.forEachObserver(observer => {
            if (observer.processingDidFailToStart) {
                observer.processingDidFailToStart();
            }
        });
    }
    processingDidStop() {
        this.logger.info('video transform device processing stopped');
        this.forEachObserver(observer => {
            if (observer.processingDidStop) {
                observer.processingDidStop();
            }
        });
    }
    forEachObserver(observerFunc) {
        for (const observer of this.observers) {
            setTimeout(() => {
                observerFunc(observer);
            }, 0);
        }
    }
}
exports.default = DefaultVideoTransformDevice;
//# sourceMappingURL=DefaultVideoTransformDevice.js.map