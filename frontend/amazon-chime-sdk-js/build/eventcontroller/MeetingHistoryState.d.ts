import EventName from './EventName';
/**
 * [[MeetingHistoryState]] describes user actions and events, including all event names
 * in [[EventName]].
 */
declare type MeetingHistoryState = EventName | 'meetingReconnected' | 'signalingDropped' | 'receivingAudioDropped';
export default MeetingHistoryState;
