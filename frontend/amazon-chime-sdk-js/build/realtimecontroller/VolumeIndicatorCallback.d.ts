/**
 * [[RealtimeVolumeIndicator]] functions that listen to changes in attendees volume.
 */
declare type VolumeIndicatorCallback = (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null, externalUserId?: string) => void;
export default VolumeIndicatorCallback;
