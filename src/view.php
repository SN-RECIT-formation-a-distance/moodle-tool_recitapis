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
 * @copyright RÉCIT 2024
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace recitapis;

require('../../../config.php');
require_once dirname(__FILE__)."/lib.php";

defined('MOODLE_INTERNAL') || die();

use moodle_url;

require_login();

//$context = context_course::instance($course->id);
// require_capability('moodle/course:managegroups', $context);

// Globals.
$PAGE->set_url("/tool/recitapis/view.php"); 
$PAGE->requires->css(new moodle_url($CFG->wwwroot . '/admin/tool/recitapis/react/build/index.css'), true);
$PAGE->requires->js(new moodle_url($CFG->wwwroot . '/admin/tool/recitapis/react/build/index.js'), true);

// Set page context.
$PAGE->set_context(\context_system::instance());

// Set page layout.
$PAGE->set_pagelayout('standard');

$PAGE->set_title(get_string('pluginname', 'tool_recitapis'));
$PAGE->set_heading(get_string('pluginname', 'tool_recitapis'));

echo $OUTPUT->header();

$courses = enrol_get_users_courses($USER->id);
$hasCapability = false;
foreach ($courses as $c) {
    if (has_capability(RECITAPIS_ENROLLMENT_CAPABILITY, \context_course::instance($c->id))) {
        $hasCapability = true;
        break;
    }
}

if($hasCapability){
    tool_recitapis_strings_for_js();

    $gricsclientid = get_config('tool_recitapis', 'gricsfrontendclientid');
    $gricsredirecturi = get_config('tool_recitapis', 'gricsfrontendredirecturi');
    $gricsurlapi = get_config('tool_recitapis', 'gricsurlapi');
    $gricsurlauthorization = get_config('tool_recitapis', 'gricsurlauthorization');
    $gricsurltoken = get_config('tool_recitapis', 'gricsurltoken');
    $workPlanPluginFound = (is_dir("{$CFG->dirroot}/local/recitworkplan") ? 1 : 0);
    $userEmail = $USER->email;

    //$PAGE->requires->js_init_call('tool_recitapis_init_app', array(, ));

    $placeholder = "<div style='min-height: 70vh;' id='recit_apis' 
                data-grics-client-id='%s' data-grics-redirect-uri='%s'
                data-grics-url-api='%s' data-grics-url-authorization='%s'
                data-grics-url-token='%s' data-workplan-plugin-found='%s'
                data-user-email='%s'></div>";

    echo sprintf($placeholder, $gricsclientid, $gricsredirecturi, $gricsurlapi,
            $gricsurlauthorization, $gricsurltoken, $workPlanPluginFound, $userEmail);
}
else{
    echo "<div class='alert alert-danger'>";
    echo "<h4>". get_string('pluginname', 'tool_recitapis') ."</h4>";
    echo get_string('nopermissions', 'tool_recitapis');
    echo "</div>";
}

echo $OUTPUT->footer();
