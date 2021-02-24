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
class DefaultAudioMixController {
    constructor(logger) {
        this.logger = logger;
        this.audioDevice = null;
        this.audioElement = null;
        this.audioStream = null;
        this.browserBehavior = new DefaultBrowserBehavior_1.default();
    }
    bindAudioElement(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                throw new Error(`Cannot bind audio element: ${element}`);
            }
            this.audioElement = element;
            this.audioElement.autoplay = true;
            return this.bindAudioMix();
        });
    }
    unbindAudioElement() {
        if (!this.audioElement) {
            return;
        }
        this.audioElement.srcObject = null;
        this.audioElement = null;
    }
    bindAudioStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!stream) {
                return;
            }
            this.audioStream = stream;
            try {
                yield this.bindAudioMix();
            }
            catch (error) {
                /* istanbul ignore else */
                if (this.logger) {
                    this.logger.warn(`Failed to bind audio stream: ${error}`);
                }
            }
        });
    }
    bindAudioDevice(device) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Throw error if browser doesn't even support setSinkId
             * Read more: https://caniuse.com/?search=setSinkId
             */
            if (device && !this.browserBehavior.supportsSetSinkId()) {
                throw new Error('Cannot select audio output device. This browser does not support setSinkId.');
            }
            // Always set device -- we might be setting it back to `null` to reselect
            // the default, and even in that case we need to call `bindAudioMix` in
            // order to update the sink ID to the empty string.
            this.audioDevice = device;
            return this.bindAudioMix();
        });
    }
    bindAudioMix() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audioElement) {
                return;
            }
            if (this.audioStream) {
                this.audioElement.srcObject = this.audioStream;
            }
            // In usual operation, the output device is undefined, and so is the element
            // sink ID. In this case, don't throw an error -- we're being called as a side
            // effect of just binding the audio element, not choosing an output device.
            const shouldSetSinkId = ((_a = this.audioDevice) === null || _a === void 0 ? void 0 : _a.deviceId) !== this.audioElement.sinkId;
            if (shouldSetSinkId &&
                typeof this.audioElement.sinkId === 'undefined') {
                throw new Error('Cannot select audio output device. This browser does not support setSinkId.');
            }
            const newSinkId = this.audioDevice ? this.audioDevice.deviceId : '';
            const oldSinkId = this.audioElement.sinkId;
            if (newSinkId === oldSinkId) {
                return;
            }
            // Take the existing stream and temporarily unbind it while we change
            // the sink ID.
            const existingAudioElement = this
                .audioElement;
            const existingStream = this.audioStream;
            if (this.browserBehavior.hasChromiumWebRTC()) {
                existingAudioElement.srcObject = null;
            }
            if (shouldSetSinkId) {
                try {
                    yield existingAudioElement.setSinkId(newSinkId);
                }
                catch (error) {
                    (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error(`Failed to set sinkId for audio element: ${error}`);
                    throw error;
                }
            }
            if (this.browserBehavior.hasChromiumWebRTC()) {
                existingAudioElement.srcObject = existingStream;
            }
        });
    }
}
exports.default = DefaultAudioMixController;
//# sourceMappingURL=DefaultAudioMixController.js.map