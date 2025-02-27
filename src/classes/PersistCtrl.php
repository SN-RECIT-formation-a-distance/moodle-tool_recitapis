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
 * @copyright 2024 RÉCIT 
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace recitapis;

require_once __DIR__ . '/recitcommon/PersistCtrl.php';

use DateTime;
use Exception;
use stdClass;

/**
 * Singleton class
 */
class PersistCtrl extends MoodlePersistCtrl
{
    protected static $instance = null;
    
    /**
     * @param MySQL Resource
     * @return PersistCtrl
     */
    public static function getInstance($mysqlConn = null, $signedUser = null)
    {
        if(!isset(self::$instance)) {
            self::$instance = new self($mysqlConn, $signedUser);
        }
        return self::$instance;
    }
    
    protected function __construct($mysqlConn, $signedUser){
        parent::__construct($mysqlConn, $signedUser);
    }

    /*public function saveUsers($data){
        $query = "CREATE TABLE IF NOT EXISTS mdl_tool_recitapis_users (
            userid int(11) NOT NULL auto_increment,   
            userrole VARCHAR(50) NOT NULL,
            email VARCHAR(250) NOT NULL,
            givenname VARCHAR(250) NOT NULL,
            familyname VARCHAR(250) NOT NULL,
            PRIMARY KEY  (`userId`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $this->execSQL($query);

        $query = "truncate table mdl_tool_recitapis_users";
        $this->execSQL($query);

        $query = "insert into mdl_tool_recitapis_users (userid, userrole, email, givenname, familyname) values ";

        $values = array();
        try{
            foreach($data as $i => $row){

                if($i == 0){ continue;} // ignore header
                if(count($row) != 14){ continue; }
                /*
                //unset($row[0]); // sourcedId
                unset($row[1]); // status
                unset($row[2]); // dateLastModified
                unset($row[3]); // orgSourcedIds
                //unset($row[4]); // role 
                //unset($row[5]); // username
                unset($row[6]); // userId
                //unset($row[7]); // givenName
                //unset($row[8]); // familyName
                unset($row[9]); // identifier
                unset($row[10]); // email
                unset($row[11]); // sms
                unset($row[12]); // phone
                unset($row[13]); // agents
                $result->response[$i] = array_values($row);*/
                /*$values[] = sprintf('(%s, "%s", "%s", "%s", "%s")', $row[0], $row[4], $row[5], $row[7], $row[8]);
            }
    
            $query .= implode(",", $values);

            $this->execSQL($query);
        }
        catch(Exception $ex){
            throw $ex;
        }
    }*/

    /*public function saveEnrollments($data){
        $query = "CREATE TABLE IF NOT EXISTS mdl_tool_recitapis_enrolls (
            enrollid VARCHAR(50) NOT NULL, 
            classid VARCHAR(50) NOT NULL,
            schoolid VARCHAR(50) NOT NULL,
            userid int(11) NOT NULL,
            userrole VARCHAR(50) NOT NULL,
            userstatus VARCHAR(50) NOT NULL,
            PRIMARY KEY  (`enrollid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $this->execSQL($query);

        $query = "truncate table mdl_tool_recitapis_enrolls";
        $this->execSQL($query);

        $query = "insert into mdl_tool_recitapis_enrolls (enrollid, classid, schoolid, userid, userrole, userstatus) values ";

        $values = array();
        try{
            foreach($data as $i => $row){

                if($i == 0){ continue;} // ignore header
                if(count($row) != 8){ continue; }

                $values[] = sprintf('("%s", "%s", "%s", %s, "%s", "%s")', $row[0], $row[1], $row[2], $row[3], $row[4], $row[5]);
            }
    
            $query .= implode(",", $values);

            $this->execSQL($query);
        }
        catch(Exception $ex){
            throw $ex;
        }
    }*/

    public function getMyMoodleCoursesAndGroups($userId){
        $query = "select uuid() uniqueid, t3.id courseid, t3.fullname coursename, t4.id groupid, t4.name groupname, t3.groupmode, 
                if(t5.id is null, 0, 1) groupmember
                    from {enrol} as t1
                    inner join {user_enrolments} as t2 on t1.id = t2.enrolid
                    inner join {course} as t3 on t1.courseid = t3.id
                    inner join {groups} as t4 on t3.id = t4.courseid
                    left join {groups_members} as t5 on t4.id = t5.groupid and t5.userid = ?
                    where t2.userid = ? 
                    order by coursename, groupname";

        $recordSet = $this->getRecordsSQL($query, [$userId, $userId]);

        $result = array();
        foreach($recordSet as $item){
            $context = \context_course::instance($item->courseid); 
            $roles = get_user_roles($context, $userId);

            foreach($roles as $role){
                if(in_array($role->shortname, array('editingteacher', 'manager'))){
                    $result[] = $item;
                }
                else if(in_array($role->shortname, array('teacher'))){
                    // if groupmode is "separate groups" then teacher must belong to the group
                    if(($item->groupmode == 1) && ($item->groupmember == 1)){
                        $result[] = $item;
                    }
                    else if(in_array($item->groupmode, [0,2])){
                        $result[] = $item;
                    }
                }
            }
        }

        return $result;
    }

    public function getMoodleEnrollments(array $emailList){
        $emailListStr = "'" . implode("','", $emailList) . "'";

        $query = "select t1.id as userid, t1.firstname, t1.lastname, t1.email, 
                coalesce(group_concat(distinct join1.courseid), '') as courseids, 
                coalesce(group_concat(distinct join2.id), '') as groupids
            from {user} as t1
            left join (select t3.courseid, t2.userid from {user_enrolments} as t2 inner join {enrol} as t3 on t2.enrolid = t3.id) as join1 on t1.id = join1.userid
            left join (select t4.courseid, t4.id, t5.userid from {groups} as t4 inner join {groups_members} as t5 on t4.id = t5.groupid) as join2 on join1.courseid = join2.courseid and  t1.id = join2.userid
            where t1.email in ($emailListStr)
            group by t1.id"; 

        $recordSet = $this->getRecordsSQL($query);

        $result = array(); 
        foreach($emailList as $email){
            $result[$email] = new stdClass();
            $result[$email]->userid = 0;
            $result[$email]->email = $email;
            $result[$email]->courseids = "";
            $result[$email]->groupids = "";
            $result[$email]->hasAccount = 0;
        }

        foreach($recordSet as $item){
            $item->userid = intval($item->userid);
            $result[$item->email] = $item;
            $result[$item->email]->hasAccount = 1;
        }

        return array_values($result);
       /* $result = array();
        foreach($recordSet as $item){
            $context = \context_course::instance($item->courseid); 
            $roles = get_user_roles($context, $userId);

            foreach($roles as $role){
                if(in_array($role->shortname, array('student'))){
                    $result[] = $item;
                }
            }
        }

        return $result;*/
    }

    public function getWorkPlanAssignments($templateId){
        $query = "SELECT t1.id as templateid, t1.name, 
        group_concat(distinct concat(t4.id, ':', t4.shortname) order by t4.shortname) as courselist, 
        group_concat(distinct t5.userid) as assignmentlist
        FROM {recit_wp_tpl} as t1
        left join {recit_wp_tpl_act} as t2 on t2.templateid = t1.id
        left join {course_modules} as t3 on t2.cmid = t3.id
        left join {course} as t4 on t3.course = t4.id
        left join {recit_wp_tpl_assign} t5 on t5.templateid = t1.id
        where t1.id = $templateId 
        group by t1.id"; 

        $recordSet = $this->getRecordsSQL($query);
      
        $result = array_pop($recordSet);
        $result->courselist = ($result->courselist == null ? array() : explode(',', $result->courselist));
        foreach($result->courselist as &$course){
            $course = explode(':', $course);
            $course = (object)array("courseId" => $course[0], "shortName" => $course[1]);
        }
            
        $result->assignmentlist = ($result->assignmentlist == null ? array() : explode(',', $result->assignmentlist));
        
        return $result;
    }
}

