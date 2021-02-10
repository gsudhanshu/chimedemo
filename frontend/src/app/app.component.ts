import { Component } from '@angular/core';
import { MeetingsService } from './meetings.service';

import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MeetingsService]
})
export class AppComponent {
  title = 'Demo';
  meetingId : string;
  meetingResponse : any;
  attendeeResponse : any;

  constructor(private meeting: MeetingsService) {
    this.meetingId = "";
  }

  public join() {
    const logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);
    
    // You need responses from server-side Chime API. See below for details.
    this.meeting.getMeeting()
      .subscribe((data: any) => {
        this.meetingResponse = data;

        this.meeting.getAttendee(this.meetingResponse.Meeting.MeetingId)
          .subscribe((data: any) => {
            this.attendeeResponse = data;
            console.log("Sudhanshu");
            console.log(this.meetingResponse);
            console.log(this.attendeeResponse);
            const configuration = new MeetingSessionConfiguration(this.meetingResponse, this.attendeeResponse);
            console.log(configuration);
            const meetingSession = new DefaultMeetingSession(
              configuration,
              logger,
              deviceController
            );
            console.log(meetingSession);
          });
      });
  }
}
