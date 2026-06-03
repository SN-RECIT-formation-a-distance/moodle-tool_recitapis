<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package   tool_recitapis
 * @copyright 2019 RÉCIT 
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace recitapis;

// Prevent Moodle's debugging() / email_to_user warnings from being written
// to the HTTP response body, which would corrupt the JSON output.
define('NO_DEBUG_DISPLAY', true);

require_once(dirname(__FILE__).'../../../../../config.php');
require_once dirname(__FILE__).'/recitcommon/WebApi.php';
require_once dirname(__FILE__).'/PersistCtrl.php';
require_once dirname(__FILE__).'/Options.php';
require_once dirname(__FILE__) . '/../lib.php';
require_once($CFG->dirroot . '/group/lib.php');

$workplan = $CFG->dirroot . '/local/recitworkplan/classes/PersistCtrl.php';
if(is_file($workplan)){
    require_once($CFG->dirroot . '/local/recitworkplan/classes/PersistCtrl.php');
}


use Exception;
use stdClass;
use recitworkplan\PersistCtrl as WorkPlanPersistCtrl;
use recitworkplan\Assignment as WorkPlanAssignment;

class WebApi extends MoodleApi
{
    protected $token = null;
    protected $ctrl = null;

    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        $this->ctrl = PersistCtrl::getInstance($DB, $USER);
    }
    
    public function getMyMoodleCoursesAndGroups($request){
        global $USER;

        try{            
            $result = $this->ctrl->getMyMoodleCoursesAndGroups($USER->id);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getMoodleEnrollments($request){
        try{
            $courses = get_user_capability_course(RECITAPIS_ENROLLMENT_CAPABILITY, $this->signedUser->id, true, '', '', 1);
            if (empty($courses)) {
                throw new Exception(get_string('nopermissions', 'tool_recitapis'));
            }

            $rawEmails = explode(",", clean_param($request['emailList'], PARAM_TEXT));
            $emailList = array_values(array_filter(array_map(
                function($e) { return clean_param(trim($e), PARAM_EMAIL); },
                $rawEmails
            )));

            $result = $this->ctrl->getMoodleEnrollments($emailList);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function enrollStudentList($request){
        global $DB;

        try{
            $userIdList = array_filter(array_map('intval',
                explode(",", clean_param($request['userIdList'], PARAM_TEXT))));
            $courseId = clean_param($request['courseId'], PARAM_INT);
            $groupeId = clean_param($request['groupeId'], PARAM_INT);

            $context = \context_course::instance($courseId);
            require_capability('enrol/manual:enrol', $context);

            if($groupeId > 0){
                require_capability('moodle/course:managegroups', $context);
                // Verify the group actually belongs to this course (IDOR guard).
                $group = $DB->get_record('groups', array('id' => $groupeId, 'courseid' => $courseId));
                if (!$group) {
                    throw new Exception(get_string('invalidgroupid', 'error'));
                }
            }

            $manplugin = enrol_get_plugin('manual');
            $maninstance = $DB->get_record('enrol', array('courseid' => $courseId, 'enrol' => 'manual'), '*', MUST_EXIST);
            $studentrole = $DB->get_record('role', array('shortname' => 'student'));

            foreach($userIdList as $userId){
                if($userId <= 0){ continue; }

                if(!is_enrolled($context, $userId)){
                    $manplugin->enrol_user($maninstance, $userId, $studentrole->id);
                }

                if(($groupeId > 0) && !(\groups_is_member($groupeId, $userId))){
                    \groups_add_member($groupeId, $userId);
                }
            }
            
            //$this->prepareJson($result);
            return new WebApiResult(true);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getWorkPlanAssignments($request){
        try{
            $courses = get_user_capability_course(RECITAPIS_ENROLLMENT_CAPABILITY, $this->signedUser->id, true, '', '', 1);
            if (empty($courses)) {
                throw new Exception(get_string('nopermissions', 'tool_recitapis'));
            }

            $templateId = clean_param($request['templateId'], PARAM_INT);

            $result = $this->ctrl->getWorkPlanAssignments($templateId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    protected function signInGrics($signedUser, $mode = 'dev'){
        try{
            $result = new stdClass();
            $result->accessToken = null;
            $result->refresh = false;
    
            $file = sys_get_temp_dir(). '/recitapis_grics_'. $signedUser->id;
    
            $token = null;
            if(file_exists($file)){
                $fileContent = file_get_contents($file);
                $token = json_decode($fileContent);
            }
    
            if($token != null){
                if(isset($token->error) && ($token->error != 'invalid_request')){
                    $errorMsg = $token->error;
                    if(isset($token->error_description)){
                        $errorMsg .= " - " . $token->error_description;
                    }

                    throw new Exception($errorMsg);
                }
    
                $notExpired = (time() - $token->timestamp <= $token->expires_in);
    
                if($notExpired){
                    $result->accessToken = $token->access_token;
                    return $result;
                }
            } 
            
            $params = array('grant_type' => 'client_credentials', 'scope' => 'apiclients');
    
            $authorizationHeader = "Basic ".base64_encode(Options::getGricsApiClientId().":".Options::getGricsApiSecret());
   
            $response = HTTPRequester::HTTPPost(Options::getGricsUrlToken($mode), $params, $authorizationHeader);
            $token = json_decode($response->response);
            if ($token === null) {
                throw new Exception('Invalid response from GRICS token endpoint');
            }
            $token->timestamp = time();
            file_put_contents($file, json_encode($token));
            @chmod($file, 0600);
    
            $result->accessToken = $token->access_token;
            $result->refresh = true;
            return $result;
        }
        catch(Exception $ex){
            throw $ex;
        }
    }

    public function getStudentEnrollmentGrics($request){
        global $USER;

        try{
            $courses = get_user_capability_course(RECITAPIS_ENROLLMENT_CAPABILITY, $this->signedUser->id, true, '', '', 1);
            if (empty($courses)) {
                throw new Exception(get_string('nopermissions', 'tool_recitapis'));
            }

            $debug = 0;
            if(isset($request['debug'])){
                $debug = clean_param($request['debug'], PARAM_INT);
            }

            $studentId = clean_param($request['studentId'], PARAM_INT);
            $level = clean_param($request['level'], PARAM_TEXT);
            $mode = clean_param($request['mode'], PARAM_TEXT);
            
            $token = $this->signInGrics($USER, $mode);

            $headers = array("Authorization: Bearer {$token->accessToken}", "X-IBM-Client-Id: " . Options::getGricsApiClientId(), "accept", "application/json");
            $params = array(); //array('annee' =>  date("Y"));

            $level = ($level == 'adult' ? 'elevesAdultes' : 'elevesJeunes');
            $url = sprintf("%s/v1/%s/%s/%s/frequentations", Options::getGricsUrlApi($mode), Options::getGricsOrganizationNumber(), $level, $studentId);
            $result = HTTPRequester::HTTPGet($url, $params, $headers);
            
            $result = ($debug == 1 ? $result : $result->response);
            $result = json_decode($result);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function assignStudentToWorkPlan($request){
        global $DB, $USER;

        try{
            $userIdList = array_filter(array_map('intval',
                explode(",", clean_param($request['userIdList'], PARAM_TEXT))));
            $courseIdList = array_filter(array_map('intval',
                explode(",", clean_param($request['courseIdList'], PARAM_TEXT))));
            $templateId = clean_param($request['templateId'], PARAM_INT);

            $manplugin = enrol_get_plugin('manual');
            $studentrole = $DB->get_record('role', array('shortname' => 'student'));

            $workPlanPersistCtrl = WorkPlanPersistCtrl::getInstance($DB, $USER);

            foreach($courseIdList as $courseId){
                $context = \context_course::instance($courseId);
                require_capability('enrol/manual:enrol', $context);
                $maninstance = $DB->get_record('enrol', array('courseid' => $courseId, 'enrol' => 'manual'), '*', MUST_EXIST);

                foreach($userIdList as $userId){
                    if($userId <= 0){ continue; }

                    if(!is_enrolled($context, $userId)){
                        $manplugin->enrol_user($maninstance, $userId, $studentrole->id);
                    }
                }
            }

            foreach($userIdList as $userId){
                if($userId <= 0){ continue; }
                $newAssignment = new WorkPlanAssignment();
                $newAssignment->id = 0;
                $newAssignment->templateId = $templateId;
                $newAssignment->user = new stdClass();
                $newAssignment->user->id = $userId;
                $newAssignment->startDate = time();
                $workPlanPersistCtrl->saveAssignment($newAssignment);
            } 
            
            //$this->prepareJson($result);
            return new WebApiResult(true);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    /*public function getActivitiesScheduleAdults($request){
        global $USER;

        try{
            $debug = 0;
            if(isset($request['debug'])){
                $debug = clean_param($request['debug'], PARAM_INT);
            }

            $studentId = clean_param($request['studentId'], PARAM_TEXT);
            $centerId = clean_param($request['centerId'], PARAM_TEXT);
            $startDate = clean_param($request['startDate'], PARAM_TEXT);
            $endDate = clean_param($request['endDate'], PARAM_TEXT);
            
            $token = $this->signInGrics($USER);

            $headers = array("Authorization: Bearer {$token->accessToken}", "X-IBM-Client-Id: " . Options::getGricsApiClientId(), "accept", "application/json");
            $params = array('idCentre' => $centerId, 'dateDebut' => $startDate, 'dateFin' => $endDate, 'pageSize' => 100);

            $url = sprintf("%s/v2/%s/elevesAdultes/%s/activitesHoraires", Options::getGricsUrlApi(), Options::ORGANISM_NUMBER, $studentId);
            $result = HTTPRequester::HTTPGet($url, $params, $headers);
            
            $result = ($debug == 1 ? $result : $result->response);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, false, $ex->GetMessage());
        }
    }*/

   /* public function getSchoolScheduleAdults($request){
        global $USER;

        try{
            $debug = 0;
            if(isset($request['debug'])){
                $debug = clean_param($request['debug'], PARAM_INT);
            }

            $studentId = clean_param($request['studentId'], PARAM_TEXT);
            
            $token = $this->signInGrics($USER);

            $headers = array("Authorization: Bearer {$token->accessToken}", "X-IBM-Client-Id: " . Options::getGricsApiClientId(), "accept", "application/json");
            $params = array();

            $url = sprintf("%s/v2/%s/elevesAdultes/%s/calendrierScolaire", Options::getGricsUrlApi(), Options::ORGANISM_NUMBER, $studentId);
            $result = HTTPRequester::HTTPGet($url, $params, $headers);
            
            $result = ($debug == 1 ? $result : $result->response);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, false, $ex->GetMessage());
        }
    }*/

   /* public function getAttendanceAdultStudent($request){
        global $USER;

        try{
            $debug = 0;
            if(isset($request['debug'])){
                $debug = clean_param($request['debug'], PARAM_INT);
            }

            $studentId = clean_param($request['studentId'], PARAM_TEXT);
            
            $token = $this->signInGrics($USER);

            $headers = array("Authorization: Bearer {$token->accessToken}", "X-IBM-Client-Id: " . Options::getGricsApiClientId(), "accept", "application/json");
            $params = array();

            $url = sprintf("%s/v2/%s/elevesAdultes/%s/presences", Options::getGricsUrlApi(), Options::ORGANISM_NUMBER, $studentId);
            $result = HTTPRequester::HTTPGet($url, $params, $headers);
            
            $result = ($debug == 1 ? $result : $result->response);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, false, $ex->GetMessage());
        }
    }*/

    /*public function getAdultStudents($request){
        global $USER;

        try{
            $debug = 0;
            if(isset($request['debug'])){
                $debug = clean_param($request['debug'], PARAM_INT);
            }
            
            $token = $this->signInGrics($USER);

            $headers = array("Authorization: Bearer {$token->accessToken}", "X-IBM-Client-Id: " . Options::getGricsApiClientId(), "accept", "application/json");

            $url = sprintf("%s/v3/%s/elevesAdultes", Options::getGricsUrlApi(), Options::ORGANISM_NUMBER);
            $result = HTTPRequester::HTTPGet($url, array(), $headers);
            
            $result = ($debug == 1 ? $result : $result->response);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, false, $ex->GetMessage());
        }
    }*/

   /* public function sendEmail($request){
        global $USER;

        try{                       
            $recipientList = explode(",", clean_param($request['recipientList'], PARAM_TEXT));
            $subject = clean_param($request['subject'], PARAM_INT);
            $messagehtml = clean_param($request['message'], PARAM_INT);

            
            throw new Exception();

            $mail = get_mailer();
            $mail->SMTPDebug = \SMTP::DEBUG_CONNECTION;
            $mail->From     = $USER->email;
            $mail->FromName = $USER->firstname .' ' . $USER->lastname;
            $mail->Subject = $subject;
            $mail->isHTML(true);
            $mail->Body    =  $messagehtml;

            foreach ($recipientList as $email) {
                if (validate_email($email)) {
                    $mail->addAddress($email);    
                }
            }

            if ($mail->send()) {
                return new WebApiResult(true);
            } 
            else{
                throw new Exception($mail->ErrorInfo);
            }
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, false, $ex->GetMessage());
        }
    }*/
    
}

class HTTPRequester {
    /**
     * @description Make HTTP-GET call
     * @param       $url
     * @param       array $params
     * @return      HTTP-Response body or an empty string if the request fails or is empty
     */
    public static function HTTPGet($url, array $params, array $httpHeaders = null) {
        $result = new stdClass();
        $debug = false;

        $query = http_build_query($params); 

        $ch    = curl_init($url.'?'.$query);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_ENCODING, "");
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLINFO_HEADER_OUT, $debug);

        if($httpHeaders != null){
            curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders); 
        }
        
        $result->response = curl_exec($ch);
        $result->info = curl_getinfo($ch);

        curl_close($ch);

        return $result;
    }
    /**
     * @description Make HTTP-POST call
     * @param       $url
     * @param       array $params
     * @return      HTTP-Response body or an empty string if the request fails or is empty
     */
    public static function HTTPPost($url, array $postData, $authorizationHeader = null) {
        $result = new stdClass();
        $debug = false;

        $postData = http_build_query($postData);

        $headers = ['Content-Type: application/x-www-form-urlencoded'];

        if(isset($authorizationHeader)){
            $headers[] = "Authorization: $authorizationHeader";
        }

        $headers[] = 'Connection: keep-alive';
        
        $ch    = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
       // curl_setopt($ch, CURLOPT_HEADER, $debug);
        curl_setopt($ch, CURLOPT_URL, $url); 
        //curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
       // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
       // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLINFO_HEADER_OUT, $debug);
        curl_setopt($ch,CURLOPT_VERBOSE, $debug);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result->response = curl_exec($ch);
        curl_close($ch);

        $result->info = curl_getinfo($ch);

        return $result;
    }
    /**
     * @description Make HTTP-PUT call
     * @param       $url
     * @param       array $params
     * @return      HTTP-Response body or an empty string if the request fails or is empty
     */
    public static function HTTPPut($url, array $params) {
        $query = \http_build_query($params);
        $ch    = \curl_init();
        \curl_setopt($ch, \CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($ch, \CURLOPT_HEADER, false);
        \curl_setopt($ch, \CURLOPT_URL, $url);
        \curl_setopt($ch, \CURLOPT_CUSTOMREQUEST, 'PUT');
        \curl_setopt($ch, \CURLOPT_POSTFIELDS, $query);
        $response = \curl_exec($ch);
        \curl_close($ch);
        return $response;
    }
    /**
     * @category Make HTTP-DELETE call
     * @param    $url
     * @param    array $params
     * @return   HTTP-Response body or an empty string if the request fails or is empty
     */
    public static function HTTPDelete($url, array $params) {
        $query = \http_build_query($params);
        $ch    = \curl_init();
        \curl_setopt($ch, \CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($ch, \CURLOPT_HEADER, false);
        \curl_setopt($ch, \CURLOPT_URL, $url);
        \curl_setopt($ch, \CURLOPT_CUSTOMREQUEST, 'DELETE');
        \curl_setopt($ch, \CURLOPT_POSTFIELDS, $query);
        $response = \curl_exec($ch);
        \curl_close($ch);
        return $response;
    }
}
///////////////////////////////////////////////////////////////////////////////////
require_login();

$PAGE->set_context(\context_system::instance());
$webapi = new WebApi($DB, $COURSE, $USER);
$webapi->getRequest($_REQUEST);
$webapi->processRequest();
$webapi->replyClient(); 