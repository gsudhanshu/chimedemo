<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use AWS;

class APIController extends Controller
{

    /**
     * create a new meeting
     */
    public function createMeeting() 
    {
        $chimeClient = AWS::createClient('chime');

        $result = $chimeClient->createMeeting([
            'ClientRequestToken' => 'Meeting1', // REQUIRED
            'ExternalMeetingId' => 'Meeting1',
            'MediaRegion' => 'ap-southeast-1',
            'Tags' => [
                [
                    'Key' => 'type', // REQUIRED
                    'Value' => 'test', // REQUIRED
                ],
            ],
        ]);
        $obj = $result->toArray();
        return response()->json($obj);
    }

    /**
     * create a new attendee for given meeting id
     */
    public function createAttendee($meetingId) {
        $chimeClient = AWS::createClient('chime');

        $attendeeResult = $chimeClient->createAttendee([
            'ExternalUserId' => 'User0', // REQUIRED
            'MeetingId' => $meetingId, // REQUIRED
            'Tags' => [
                [
                    'Key' => 'type', // REQUIRED
                    'Value' => 'test', // REQUIRED
                ],
            ],
        ]);
        $obj = $attendeeResult->toArray();
        
        return response()->json($obj);
    }

    /**
     * Delete meeting
     */
    public function deleteMeeting($meetingId) {
        $chimeClient = AWS::createClient('chime');

        $result = $chimeClient->deleteMeeting([
            'MeetingId' => $meetingId, // REQUIRED
        ]);
        
        $obj = $result->toArray();
        return response()->json($obj);
    }

}
