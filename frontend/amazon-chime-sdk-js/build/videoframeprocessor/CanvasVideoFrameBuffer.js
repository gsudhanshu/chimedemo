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
/**
 * [[CanvasVideoFrameBuffer]] implements [[VideoFrameBuffer]]. It internally holds an `HTMLCanvasElement`.
 */
class CanvasVideoFrameBuffer {
    constructor(canvas) {
        this.canvas = canvas;
        this.destroyed = false;
    }
    destroy() {
        this.canvas = null;
        this.destroyed = true;
    }
    asCanvasImageSource() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed) {
                return Promise.reject('canvas buffer is destroyed');
            }
            return Promise.resolve(this.canvas);
        });
    }
    asCanvasElement() {
        return this.canvas;
    }
}
exports.default = CanvasVideoFrameBuffer;
//# sourceMappingURL=CanvasVideoFrameBuffer.js.map