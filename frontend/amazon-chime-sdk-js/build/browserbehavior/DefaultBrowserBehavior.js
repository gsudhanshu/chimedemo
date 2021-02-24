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
const detect_browser_1 = require("detect-browser");
class DefaultBrowserBehavior {
    constructor({ enableUnifiedPlanForChromiumBasedBrowsers = false, } = {}) {
        this.browser = detect_browser_1.detect();
        this.browserSupport = {
            chrome: 78,
            'edge-chromium': 79,
            electron: 7,
            firefox: 60,
            ios: 12,
            safari: 12,
            opera: 66,
            samsung: 12,
            crios: 86,
            fxios: 23,
        };
        this.browserName = {
            chrome: 'Google Chrome',
            'edge-chromium': 'Microsoft Edge',
            electron: 'Electron',
            firefox: 'Mozilla Firefox',
            ios: 'Safari iOS',
            safari: 'Safari',
            opera: 'Opera',
            samsung: 'Samsung Internet',
            crios: 'Chrome iOS',
            fxios: 'Firefox iOS',
        };
        this.chromeLike = [
            'chrome',
            'edge-chromium',
            'chromium-webview',
            'opera',
            'samsung',
        ];
        this.webkitBrowsers = ['crios', 'fxios', 'safari', 'ios'];
        this.enableUnifiedPlanForChromiumBasedBrowsers = enableUnifiedPlanForChromiumBasedBrowsers;
    }
    version() {
        return this.browser.version;
    }
    majorVersion() {
        return parseInt(this.version().split('.')[0]);
    }
    name() {
        return this.browser.name;
    }
    hasChromiumWebRTC() {
        for (const browser of this.chromeLike) {
            if (browser === this.browser.name) {
                return true;
            }
        }
        return false;
    }
    hasWebKitWebRTC() {
        for (const browser of this.webkitBrowsers) {
            if (browser === this.browser.name) {
                return true;
            }
        }
        return false;
    }
    hasFirefoxWebRTC() {
        return this.isFirefox();
    }
    supportsCanvasCapturedStreamPlayback() {
        return !this.isIOSSafari() && !this.isIOSChrome() && !this.isIOSFirefox();
    }
    requiresUnifiedPlan() {
        let shouldEnable = this.isFirefox() || (this.hasWebKitWebRTC() && this.isUnifiedPlanSupported());
        if (this.enableUnifiedPlanForChromiumBasedBrowsers) {
            shouldEnable = shouldEnable || this.hasChromiumWebRTC();
        }
        return shouldEnable;
    }
    requiresResolutionAlignment(width, height) {
        if (this.isAndroid() && this.isPixel3()) {
            return [Math.ceil(width / 64) * 64, Math.ceil(height / 64) * 64];
        }
        return [width, height];
    }
    requiresCheckForSdpConnectionAttributes() {
        return !this.isIOSSafari() && !this.isIOSChrome() && !this.isIOSFirefox();
    }
    requiresIceCandidateGatheringTimeoutWorkaround() {
        return this.hasChromiumWebRTC();
    }
    requiresUnifiedPlanMunging() {
        let shouldRequire = this.hasWebKitWebRTC() && this.isUnifiedPlanSupported();
        if (this.enableUnifiedPlanForChromiumBasedBrowsers) {
            shouldRequire = shouldRequire || this.hasChromiumWebRTC();
        }
        return shouldRequire;
    }
    requiresSortCodecPreferencesForSdpAnswer() {
        return this.isFirefox() && this.majorVersion() <= 68;
    }
    requiresSimulcastMunging() {
        return this.isSafari();
    }
    requiresBundlePolicy() {
        return 'max-bundle';
    }
    requiresPromiseBasedWebRTCGetStats() {
        return !this.hasChromiumWebRTC();
    }
    requiresVideoElementWorkaround() {
        return this.isSafari();
    }
    requiresNoExactMediaStreamConstraints() {
        return (this.isSamsungInternet() ||
            (this.isIOSSafari() && (this.version() === '12.0.0' || this.version() === '12.1.0')));
    }
    requiresGroupIdMediaStreamConstraints() {
        return this.isSamsungInternet();
    }
    getDisplayMediaAudioCaptureSupport() {
        return this.isChrome() || this.isEdge();
    }
    // TODO: Deprecated, needs to be removed
    screenShareUnsupported() {
        console.warn('This function is no longer supported.');
        if (this.isSafari()) {
            return true;
        }
        return false;
    }
    isSupported() {
        if (!this.browserSupport[this.browser.name] ||
            this.majorVersion() < this.browserSupport[this.browser.name]) {
            return false;
        }
        if (this.browser.name === 'firefox' && this.isAndroid()) {
            return false;
        }
        return true;
    }
    supportString() {
        if (this.isAndroid()) {
            return `${this.browserName['chrome']} ${this.browserSupport['chrome']}+, ${this.browserName['samsung']} ${this.browserSupport['samsung']}+`;
        }
        const s = [];
        for (const k in this.browserSupport) {
            s.push(`${this.browserName[k]} ${this.browserSupport[k]}+`);
        }
        return s.join(', ');
    }
    supportedVideoCodecs() {
        return __awaiter(this, void 0, void 0, function* () {
            const pc = new RTCPeerConnection();
            pc.addTransceiver('video', { direction: 'inactive', streams: [] });
            return (yield pc.createOffer({ offerToReceiveVideo: true })).sdp
                .split('\r\n')
                .filter(x => {
                return x.includes('a=rtpmap:');
            })
                .map(x => {
                return x.replace(/.* /, '').replace(/\/.*/, '');
            })
                .filter((v, i, a) => {
                return a.indexOf(v) === i;
            })
                .filter(x => {
                return x !== 'rtx' && x !== 'red' && x !== 'ulpfec';
            });
        });
    }
    supportsSetSinkId() {
        return 'setSinkId' in HTMLAudioElement.prototype;
    }
    // These helpers should be kept private to encourage
    // feature detection instead of browser detection.
    isIOSSafari() {
        return this.browser.name === 'ios';
    }
    isSafari() {
        return this.browser.name === 'safari' || this.browser.name === 'ios';
    }
    isFirefox() {
        return this.browser.name === 'firefox';
    }
    isIOSFirefox() {
        return this.browser.name === 'fxios';
    }
    isIOSChrome() {
        return this.browser.name === 'crios';
    }
    isChrome() {
        return this.browser.name === 'chrome';
    }
    isEdge() {
        return this.browser.name === 'edge-chromium';
    }
    isSamsungInternet() {
        return this.browser.name === 'samsung';
    }
    isAndroid() {
        return /(android)/i.test(navigator.userAgent);
    }
    isPixel3() {
        return /( pixel 3)/i.test(navigator.userAgent);
    }
    isUnifiedPlanSupported() {
        return RTCRtpTransceiver.prototype.hasOwnProperty('currentDirection');
    }
}
exports.default = DefaultBrowserBehavior;
//# sourceMappingURL=DefaultBrowserBehavior.js.map