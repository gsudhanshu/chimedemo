/**
 * [[AudioVideoEventAttributes]] describes an audio-video event.
 */
export default interface AudioVideoEventAttributes {
    attendeePresenceDurationMs?: number;
    iceGatheringDurationMs?: number;
    maxVideoTileCount?: number;
    meetingDurationMs?: number;
    meetingErrorMessage?: string;
    meetingStartDurationMs?: number;
    meetingStatus?: string;
    poorConnectionCount?: number;
    retryCount?: number;
    signalingOpenDurationMs?: number;
}
