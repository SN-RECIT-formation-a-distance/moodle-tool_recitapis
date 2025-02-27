<?php
// This file is part of Ranking block for Moodle - http://moodle.org/
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
 * @package    tool_recitapis
 * @copyright  2024 RECIT
 * @license    {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

// This line protects the file from being accessed by a URL directly.
defined('MOODLE_INTERNAL') || die();

// This is used for performance, we don't need to know about these settings on every page in Moodle, only when
// we are looking at the admin settings pages.
if ($hassiteconfig) {
    
    $settings = new admin_settingpage('tool_recitapis', new lang_string('pluginname', 'tool_recitapis'));
    $ADMIN->add('tools', $settings);

    if ($ADMIN->fulltree) {
        $name = 'tool_recitapis/gricsurlauthorization';
        $title = get_string('gricsurlauthorization', 'tool_recitapis');
        $description = get_string('gricsurlauthorizationdesc', 'tool_recitapis');
        $default = 'https://mozaikacces.ca/connect/authorize'; // https://testclient.mozaikacces.ca/connect/authorize
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);

        $name = 'tool_recitapis/gricsurltoken';
        $title = get_string('gricsurltoken', 'tool_recitapis');
        $description = get_string('gricsurltokendesc', 'tool_recitapis');
        $default = 'https://mozaikacces.ca/connect/token'; 
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);

        $name = 'tool_recitapis/gricsurlapi';
        $title = get_string('gricsurlapi', 'tool_recitapis');
        $description = get_string('gricsurlapidesc', 'tool_recitapis');
        $default = 'https://gateway.api.grics.ca'; // https://testclientgateway.api.grics.ca
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);
        
        $name = 'tool_recitapis/gricsfrontendclientid';
        $title = get_string('gricsfrontendclientid', 'tool_recitapis');
        $description = get_string('gricsfrontendclientiddesc', 'tool_recitapis');
        $default = '';
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);

        $name = 'tool_recitapis/gricsfrontendredirecturi';
        $title = get_string('gricsfrontendredirecturi', 'tool_recitapis');
        $description = get_string('gricsfrontendredirecturidesc', 'tool_recitapis');
        $default = '';
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);

        $name = 'tool_recitapis/gricsbackendclientid';
        $title = get_string('gricsbackendclientid', 'tool_recitapis');
        $description = get_string('gricsbackendclientiddesc', 'tool_recitapis');
        $default = '';
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);

        $name = 'tool_recitapis/gricsbackendsecret';
        $title = get_string('gricsbackendsecret', 'tool_recitapis');
        $description = get_string('gricsbackendsecretdesc', 'tool_recitapis');
        $default = '';
        $setting = new admin_setting_encryptedpassword($name, $title, $description);
        $settings->add($setting);   

        $name = 'tool_recitapis/gricsorganizationnumber';
        $title = get_string('gricsorganizationnumber', 'tool_recitapis');
        $description = get_string('gricsorganizationnumberdesc', 'tool_recitapis');
        $default = '';
        $setting = new admin_setting_configtext($name, $title, $description, $default);
        $settings->add($setting);
    }
}