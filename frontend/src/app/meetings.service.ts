import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {

  constructor(private http: HttpClient) { }

  /** GET meeting from the server */
  getMeeting(meetingId: string): any {
    return this.http.get("http://localhost:8000/api/createMeeting?meetingId="+meetingId).
      pipe(
        map((data : any) => {
          console.log("createMeeting");
          console.log(data);
          return data;
        }), catchError( error => {
          return throwError( 'Something went wrong in create meeting!' );
        })
      )
  }

  /** GET create attendee from the server */
  getAttendee(meetingId: string): any {
    return this.http.get("http://localhost:8000/api/createAttendee?meetingId="+meetingId).
      pipe(
        map((data : any) => {
          console.log("createAttendee");
          console.log(data);
          return data;
        }), catchError( error => {
          return throwError( 'Something went wrong in create attendee!' );
        })
      )
  }

}
