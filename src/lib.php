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
 *
 * @package   tool_recitapis
 * @copyright 2024 RÉCIT FAD
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace recitapis;

defined('MOODLE_INTERNAL') || die;

define('RECITAPIS_ENROLLMENT_CAPABILITY', 'tool/recitapis:enrollment');

/**
 * Initialise the js strings required for this module.
 */
function tool_recitapis_strings_for_js() {
    global $PAGE; 

    $PAGE->requires->strings_for_js(array(
        'pluginname', 'msgactioncompleted', 'nodata'),
         'tool_recitapis');
}

function tool_recitapis_extend_navigation_course(\navigation_node $navigation, \stdClass $course, \context $context) {
    return;
    if (!has_capability(RECITAPIS_ENROLLMENT_CAPABILITY, $context)) {
        // The user does not have the capability to view the course tools.
        return;
    }

    // Display in the navigation if the user has site:config ability, or if the site is registered.
    $enabled = has_capability('moodle/site:config', \context_system::instance());
    if (!$enabled) {
        return;
    }

    $url = new moodle_url('/tool/recitapis/view.php', ['courseid' => $course->id]);
    $navigation->add(
        get_string('pluginname', 'tool_recitapis'),
        $url,
        navigation_node::TYPE_SETTING,
        null,
        null,
        new pix_icon('fa-connectdevelop', '')
    );
}