<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use AWS;

class APIController extends Controller
{

    /**
     * create a new meeting
     */
    public function createMeeting(Request $request) 
    {
        $chimeClient = AWS::createClient('chime');
        $mId = $request->query('meetingId');
        $result = null;

        if(empty($mId)) {

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

        } else {

            $result = $chimeClient->getMeeting([
                'MeetingId' => $mId, // REQUIRED
            ]);

        }

        $obj = $result->toArray();
        return response()->json($obj);
    }

    /**
     * create a new attendee for given meeting id
     */
    public function createAttendee(Request $request) {
        $chimeClient = AWS::createClient('chime');
        $mId = $request->query('meetingId');

        $attendeeResult = $chimeClient->createAttendee([
            'ExternalUserId' => 'User' . mt_rand(0,999), // REQUIRED
            'MeetingId' => $mId, // REQUIRED
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
