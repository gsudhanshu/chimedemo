import { Component } from '@angular/core';
import { MeetingsService } from './meetings.service';

import {
  AudioVideoObserver,
  VideoTileState,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from '../../amazon-chime-sdk-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MeetingsService]
})
export class AppComponent implements AudioVideoObserver {
  title = 'Demo';
  meetingId : string;
  meetingResponse : any;
  attendeeResponse : any;
  audioInputDevices : any;
  audioOutputDevices : any;
  videoInputDevices : any;
  configuration : any;
  meetingSession : any;

  async audioVideoDidStart () : Promise<void> {
    console.log("Sudhanshu: inside audioVideoDidStart");
    this.meetingSession.audioVideo
      .stopVideoPreviewForVideoInput(this.domElement("session-local-video"));
    
    await this.meetingSession.audioVideo
      .chooseVideoInputDevice((<HTMLSelectElement>document.getElementById("webcam")).value);    
    this.meetingSession.audioVideo.startLocalVideoTile();
  }

  videoTileDidUpdate(tileState: VideoTileState) {
    console.log("Sudhanshu: inside videoTileDidUpdate");
    console.log(tileState)
    // Ignore a tile without attendee ID and a content/screen share.
    if (!tileState.boundAttendeeId || tileState.isContent) {
      return;
    }

    // Choose the right video element in your web application
    var videoElement = tileState.localTile? 'session-local-video' : 'session-remote-video';
    
    console.log(videoElement);
    // Bind the given tile state to the target video element
    this.meetingSession.audioVideo
      .bindVideoElement(tileState.tileId, this.domElement(videoElement));
    console.log("Sudhanshu: video element bind called "+videoElement);
    this.domShow(<HTMLElement>this.domElement(videoElement));
  }

  constructor(private meeting: MeetingsService) {
    this.meetingId = "";
    this.audioInputDevices = [{"deviceId":"0", "label": "Select devices on availability"}];
    this.audioOutputDevices = [{"deviceId":"0", "label": "Select devices on availability"}];
    this.videoInputDevices = [{"deviceId":"0", "label": "Select devices on availability"}];

  }
  public async onMicChange(event : any) {
    var ele = (<HTMLInputElement>event.target).value;
    if(ele == null) {
      return;
    }
    await this.meetingSession.audioVideo.chooseAudioInputDevice(ele);
  }

  public async onSpeakerChange(event : any) {
    var ele = (<HTMLInputElement>event.target).value;
    if(ele == null) {
      return;
    }
    await this.meetingSession.audioVideo.chooseAudioOutputDevice(ele);
  }

  public async onCamChange(event : any) {
    var ele = (<HTMLInputElement>event.target).value;
    if(ele == null) {
      return;
    }
    await this.meetingSession.audioVideo.chooseVideoInputDevice(ele);
    this.meetingSession.audioVideo
      .startVideoPreviewForVideoInput(this.domElement("session-local-video"));
  }

  private domElement(className : string) {
    return document.getElementsByClassName(className)[0];
  }

  private domShow(ele : HTMLElement) {
    //var element = this.domElement(className);
    ele.style.display = 'block';
    ele.setAttribute('show', 'true');
  }

  public call() {
    
    //this.meetingSession.audioVideo.addObserver(this.observer);
    this.meetingSession.audioVideo.addObserver(this);
    this.meetingSession.audioVideo.bindAudioElement(this.domElement('session-audio'));
    this.meetingSession.audioVideo
      .bindVideoElement(0, this.domElement("session-local-video"));
    //this.meetingSession.audioVideo.startLocalVideoTile();
    this.meetingSession.audioVideo.start();
  }

  public joinExisting() {
    var meetingId = (<HTMLInputElement>document.getElementById("meetingId")).value;
    if(meetingId == null) {
      return;
    } else {
      this.join(meetingId);
    }

  }

  public join(meetingId : string) {
    const logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);
    
    // You need responses from server-side Chime API. See below for details.
    this.meeting.getMeeting(meetingId)
      .subscribe((data: any) => {
        this.meetingResponse = data;

        this.meeting.getAttendee(this.meetingResponse.Meeting.MeetingId)
          .subscribe(async (data: any) => {
            this.attendeeResponse = data;
            console.log("Sudhanshu");
            console.log(this.meetingResponse);
            console.log(this.attendeeResponse);

            this.configuration = new MeetingSessionConfiguration(
              this.meetingResponse, 
              this.attendeeResponse);

            console.log(this.configuration);

            this.meetingSession = new DefaultMeetingSession(
              this.configuration,
              logger,
              deviceController
            );
            console.log(this.meetingSession);

            this.audioInputDevices = await this.meetingSession.audioVideo.listAudioInputDevices();
            this.audioOutputDevices = await this.meetingSession.audioVideo.listAudioOutputDevices();
            this.videoInputDevices = await this.meetingSession.audioVideo.listVideoInputDevices();
            
          });
      });
  }
}
