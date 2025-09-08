# tool_recitapis

This plugin is designed to retrieve data from various APIs for use by other RECIT plugins.

To make the RÉCIT API accessible from the menu, add the following line to your custommenuitems configuration: <i>RECIT API|YOUR_SERVER/admin/tool/recitapis/view.php</i>

## GRICS API
<a href='https://espaceapi.grics.ca/'>Espace API - GRICS</a>

This function aims to obtain data from GRICS according to user rights in order to enroll students in courses or work plans.

Before this plugin can read the GRICS API, you need to create your GRICS application in the GRICS API espace.
Once you are logged into the GRICS espace, two applications must be created.

The first application will be used for reading data on the <b>client side</b>.

### Step 1
You will need to fill in the following fields:
<ul>
	<li>Application name</li> 
    <li>Authorization type: Native and browser-based (Authorization code + PKCE)</li> 
    <li>Scopes: apiclients (API Espace), openid (my user ID) and profile (my user profile: last name, first name, user name)</li>
    <li>URI addresses for redirection after login: YOUR_SERVER/admin/tool/recitapis/view.php</li>
    <li>Authentication options: Microsoft</li>
    <li>Link to terms of use (French)</li>
    <li>Link to privacy policy (French)</li>
</ul>

Keep the <b>client ID</b> and <b>secret</b> of your application in a safe place.
You will need to add them to the parameters of this plugin.

### Step 2
Subscribe to the following product(s): <b>Plateforme d'identité Mozaïk (5.1.10)</b>.

### Step 3
Once GRICS confirms that the subscriptions are complete, the final step is to give consent for your application.

Simply copy the consent URL and paste it into any web browser. If you have permission, you will be able to grant consent.

<hr/>

The second application will be used for reading data on the <b>server side</b>.

### Step 1
You will need to fill in the following fields:
<ul>
	<li>Application name</li> 
    <li>Authorization type: Machine/Robot (client credentials) and PKCE server (Authorization code + PKCE + secret client)</li> 
    <li>Scopes: apiclients (API Espace)</li>
    <li>URI addresses for redirection after login: YOUR_SERVER</li>
    <li>Link to terms of use (French)</li>
    <li>Link to privacy policy (French)</li>
</ul>

Keep the <b>client ID</b> and <b>secret</b> of your application in a safe place.
You will need to add them to the parameters of this plugin.

### Step 2
Subscribe to the following product(s): <b>Élève (5.5.5)</b>.

### Step 3
Grant the consent in the same way you did for the previous application.