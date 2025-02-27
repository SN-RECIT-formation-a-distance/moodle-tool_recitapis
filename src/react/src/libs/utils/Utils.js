//////////////////////////////////////////////////
// Note: the "export *" will only export the classes marqued with "export" in their definition
//////////////////////////////////////////////////

export * from './WebApi';
export * from './Cookies';

export class JsNx{
    /**
     * Return the array item at the indicated index. If it not exists, then return the default value.
     * @param {number} index
     * @param {*} default value
     * @returns {*}
     */
    static at(arr, index, defaultValue){
        if(JsNx.exists(arr, index)){
            return arr[index];
        }
        else{
            return defaultValue;
        }
    };

    /**
     * Check if the index exists in the array.
     * @param {number} index
     * @returns {boolean}
     */
    static exists(arr, index){
        if(typeof arr[index] === "undefined"){
            return false;
        }
        else{
            return true;
        }
    };

    /**
     * Return the array item (an object) according to the property and value indicated. If it not exists, then return the default value.
     * @param {string} property
     * @param {*} property value
     * @param {*} default value
     * @returns {*}
     */
    static getItem(arr, prop, value, defaultValue){ 
        if(arr){
            for(let item of arr){
                if(JsNx.get(item, prop, null) === value){return item; }
            }  
        }

        return defaultValue;
    };

    /**
     * Remove an element from the array. If the element does not exists then do nothing.
     * @param {number} index
     * @returns {object}
     */
    static remove(arr, index){
        let result = [];
        
        if(JsNx.exists(arr, index)){
            result = arr.splice(index,1);
        }
        
        return (result.length > 0 ? result[0] : null);
    };

    /**
     * Remove an element from the array according to the property and value indicated.
     * @param {string} property
     * @param {*} property value
     * @returns {object}
     */
    static removeItem = function(arr, prop, value){
        let index = JsNx.getItemIndex(arr, prop, value, -1);
        return JsNx.remove(arr, index);
    };

    /**
     * Return the array item (an object) index according to the property and value indicated. 
     * @param {string} property
     * @param {*} property value
     * @returns {number}
     */
    static getItemIndex = function(arr, prop, value){
        for(let i = 0; i < arr.length; i++){
            let item = arr[i];
            
            if(JsNx.get(item, prop, null) === value){ return i }
        }
        return -1;
    };

    /**
    * Get the property value. If it not exists, then return the default value.
    * @param {string} prop
    * @param {*} defaultValue
    * @returns {*}
    */
    static get = function(obj, prop, defaultValue){  
        if(obj === null){ return defaultValue;}
        
        let props = prop.split('.');
        let result = (typeof defaultValue === "undefined" ? null : defaultValue);

        if(typeof obj[prop] === "function"){
            result = obj[prop]();
        }
        else if((props.length === 1) && (obj.hasOwnProperty(props[0]))){
            result = obj[props[0]];
        }
        else if((props.length === 2) && (obj[props[0]].hasOwnProperty(props[1]))){
            result = obj[props[0]][props[1]];
        }
    
        return result;
    };

    /*
    * @description Deep clone the object and return a new one
    * @returns {Object}
    */
    static clone = function(obj){
        if(obj instanceof Date){
            return new Date(obj.valueOf());
        }

        let result = Object.create(obj.__proto__);
        
        for(let prop in obj){
            if(Array.isArray(obj[prop])){
                switch(typeof JsNx.at(obj[prop], 0,null)){
                    case "object":
                        result[prop] = JsNx.copy(obj[prop], 2);
                        break;
                    default:
                        result[prop] = JsNx.copy(obj[prop]);
                }
            }
            else if((typeof obj[prop] === "object") && (obj[prop] !== null)){
                result[prop] = JsNx.clone(obj[prop]);
            }
            else{
                result[prop] = obj[prop];
            }
        }
        return result;   
    };

    static copy = function(arr, level){
        level = level || 0;
        
        switch(level){
            case 1:
                return JSON.parse(JSON.stringify(arr)); //  Array of literal-structures (array, object) ex: [[], {}];
            case 2:
                //return jQuery.extend(this); // Array of prototype-objects (function). The jQuery technique can be used to deep-copy all array-types. ex: [function () {}, function () {}];
                let result = [];
                for(let item of arr){
                    result.push((item !== null ? JsNx.clone(item) : null));
                }
                return result;
            default:
                return arr.slice(); // Array of literal-values (boolean, number, string) ex:  [true, 1, "true"]
        }
    };
}

export default class Utils{
    static version = 1.0;

    // this is necessary in order to handle with timezone
    static dateParse(strDate){
       // return Moment(strDate).toDate();
    }

    static formatMoney(value){
        return "$ " + parseFloat(value).toFixed(2);
    }

    static getUrlVars(){
        var vars, uri;

        vars = {};
    
        uri = decodeURI(window.location.href);
    
        var parts = uri.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        
        return vars;
    }

    static async copyToClipboard(textToCopy) {
        // Navigator clipboard api needs a secure context (https)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Use the 'out of viewport hidden text area' trick
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
                
            // Move textarea out of the viewport so it's not visible
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
                
            document.body.prepend(textArea);
            textArea.select();
    
            try {
                document.execCommand('copy');
            } catch (error) {
                console.error(error);
            } finally {
                textArea.remove();
            }
        }
    }
}

export class UtilsMoodle
{
    static rolesL1 = ['ad', 'mg', 'cc', 'et'];
    static rolesL2 = ['ad', 'mg', 'cc', 'et', 'tc'];
    static rolesL3 = ['sd', 'gu', 'fp'];

    static checkRoles(roles, r1){
        let r2 = roles;
        let a = new Set(r1);
        let b = new Set(r2);
        let intersection = new Set([...a].filter(x => b.has(x)));
        return intersection.size > 0;
    }

    static wwwRoot(){
        return M.cfg.wwwroot;
    };
}

export class UtilsString
{
    static checkEmail(email) {
        email = email || "";

        if(email.length === 0){ return true;}

        //var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let filter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let emails = email.split(",");
        for(let e of emails){
            if(!filter.test(e.trim())){
                return false;
            }
        }
    
        return true;
    }

    static getRegExp(str){
        let strEscape = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        return new RegExp(strEscape, 'i');
    }
}

export class UtilsDateTime
{
    static getDate(obj){
        if(obj instanceof Date){
            return `${obj.getFullYear()}-${obj.getMonth()+1}-${obj.getDate()}`;
        }
        else if(typeof obj === 'string' || obj instanceof String){
            return obj.substring(0, 10);
        }
        else{
            return "";
        }
    }

    static formatDateTime(value, timeSeparator, defaultValue){
        timeSeparator = timeSeparator || " ";
        let result = defaultValue || "";

        if(Number.isInteger(value) && value > 0){
            let obj = new Date(value*1000);
            result = obj.getFullYear().toString();
            result += "-" + (obj.getMonth()+1).toString().padStart(2, '0');
            result += "-" + obj.getDate().toString().padStart(2, '0');
            result += timeSeparator + obj.getHours().toString().padStart(2, '0');
            result += ":" + obj.getMinutes().toString().padStart(2, '0');
        }

        return result;
    }

    static format(obj){
        let options = {year: "numeric", month: "numeric", day: "numeric",
           hour: "numeric", minute: "numeric", second: "numeric",
           hour12: false};

        return new Intl.DateTimeFormat('fr-fr', options).format(obj);
    }

    static toTimestamp (strDate) {  
        const dt = Date.parse(strDate);  
        return dt / 1000;  
    }

    static nbMinSinceSundayToDate(nbMinSinceSunday){
        nbMinSinceSunday = parseInt(nbMinSinceSunday,10);
        if(nbMinSinceSunday === 0){
            return null;
        }
        let hour = Math.trunc((nbMinSinceSunday % 1440) / 60);
        let minutes = nbMinSinceSunday % 60;
        return new Date(0,0,0, hour, minutes, 0);
    }
    
    static dateToNbMinSinceSunday(weekDay, date){
        if(date instanceof Date){
            return (date.getHours() * 60) + date.getMinutes() + (weekDay * 1440); // 1440 = minutes in a day
        }
        else{
            return 0;
        }
    }

    static toTimeString(timestamp){
        let d = new Date(parseInt(timestamp)*1000);
        return d.toLocaleString();
    }
    
    /**
    * Transform the shift minutes to the time string
    * @param {type} time 
    * @param {type} separator
    * @returns {ScheduleShift.minutesToTime.result}
    */
    static minutesToTime(time, separator) {
        separator = separator || ":";

        let hour, min, result, offsetDays;

        if((time >= 0) && (time <= 23)){
            hour = time;
            min = 0;
        }
        else{
            hour = Math.trunc(time / 60); // extract the hour
            offsetDays = Math.trunc(hour / 24);
            min = time - (hour * 60); // extract the minutes
            hour -= (offsetDays * 24);
        }

        result = hour.toString().nxLpad("0", 2) + separator + min.toString().nxLpad("0", 2);
        return result;
    };
    
    /**
     * Transform the time in string to minutes
     * @param {string} - hh:mm
     * @return {number} - The number of minutes 
     */
    static timeToMin = function (time) { 
        var hour, minutes;

        if (time.length !== 5) {
            return 0;
        }

        hour = parseInt(time.substring(0, 2),10);
        minutes = parseInt(time.substring(3, 5),10);

        return (hour * 60) + minutes;
    };

    static formatHours2Clocktime(hours){
        let obj = new Date(0,0);
        obj.setSeconds(+hours * 60 * 60);
        return obj.toTimeString().slice(0, 5);
    }
};

export class UtilsTreeStruct
{
    /**
     * Apply a user supplied function to every node of the tree and return its result
     * @param {Array} - tree
     * @param {string} - proNodes The property name of the children nodes 
     * @param {function} - callback The callback function
     * @returns void
     */
    static treeWalk(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                callback(node);
                UtilsTreeStruct.treeWalk(node[propNodes], propNodes, callback);
            }
            else{
                callback(node);        
            }
        }
    }
    
    /**
     * Get the parent node 
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @param * - default value
     * @returns * - the parent node or the default value
     */
    static getParentNode(rootNode, propNodes, callback, defaultValue){
        let i, node;
        let result = defaultValue;

        // there is no parent node
        if(callback(rootNode)){ return result;} 

        let nodes = rootNode.nxGet(propNodes);

        for(i = 0; i < nodes.length; i++){
            node = nodes[i];

            if(node.nxGet(propNodes).length > 0){                
                if(callback(node)){return rootNode; }

                result = UtilsTreeStruct.getParentNode(node, propNodes, callback, defaultValue);
            }
            else if(callback(node)){return rootNode; }           
        }

        return result;
    }
    
    /**
     * Get a node from the tree
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @param * - default value
     * @returns * - the node or the default value
     */
    static getNode(tree, propNodes, callback, defaultValue){
        let i, node, result;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if(callback(node)){
                return node;
            }
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                result = UtilsTreeStruct.getNode(node[propNodes], propNodes, callback, defaultValue);
                if(result !== null){
                    return result;
                }
            }
            else if((typeof node[propNodes] === "function") && (node[propNodes]().length > 0)){
                result = UtilsTreeStruct.getNode(node[propNodes], propNodes, callback, defaultValue);
                if(result !== null){
                    return result;
                }
            }
        }
        return defaultValue;
    }
    
     /**
     * Remove a node from the tree
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @returns {boolean} - True if the node was found. False otherwise.
     */
    static removeNode(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if(callback(node)){
                tree.splice(i, 1);
                return true;
            }
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                if(UtilsTreeStruct.removeNode(node[propNodes], propNodes, callback)){
                    return true;
                }
            }
            else if((typeof node[propNodes] === "function") && (node[propNodes]().length > 0)){
                if(UtilsTreeStruct.removeNode(node[propNodes](), propNodes, callback)){
                    return true;
                }
            }
        }
        return false;
    }
    /*static removeNode(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                if(callback(node)){
                    tree.splice(i, 1);
                    return true;
                }
                
                return UtilsTreeStruct.removeNode(node[propNodes], propNodes, callback);
            }
            else{
                if(callback(node)){
                    tree.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }*/
}

export class UtilsCrypto{
    static dec2hex(dec) {
        return ("0" + dec.toString(16)).substr(-2);
      }
      
    static generateCodeVerifier() {
        let array = new Uint32Array(56 / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, UtilsCrypto.dec2hex).join("");
    }

    static async sha256(plain) {
        // returns promise ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest("SHA-256", data);
    }
      
    static base64urlencode(a) {
        let str = "";
        let bytes = new Uint8Array(a);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
      
    static async generateCodeChallengeFromVerifier(v) {
        let hashed = await UtilsCrypto.sha256(v);
        let base64encoded = UtilsCrypto.base64urlencode(hashed);
        return base64encoded;
    }

    static generateCryptoRandomState() {
        const randomValues = new Uint32Array(2);
        window.crypto.getRandomValues(randomValues);
    
        // Encode as UTF-8
        const utf8Encoder = new TextEncoder();
        const utf8Array = utf8Encoder.encode(
          String.fromCharCode.apply(null, randomValues)
        );
    
        // Base64 encode the UTF-8 data
        return btoa(String.fromCharCode.apply(null, utf8Array))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
    }

    static generateNonce() {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
        const result = [];
        window.crypto.getRandomValues(new Uint8Array(32)).forEach(c =>
            result.push(charset[c % charset.length]));
        return result.join('');
    }
}

export class UtilsOAuth2{
    constructor(params){
        this.params = {};
        this.params.urlAuthorize = params.urlAuthorize;
        this.params.urlToken = params.urlToken;
        this.params.clientId = params.clientId;
        this.params.redirectUri = params.redirectUri;
        this.params.scope = params.scope;

        this.observers = [];

        this.connection = {
            state: "",
            nonce: "",
            accessCode: "",
            codeChallenge: '',
            codeVerifier: '',
            token : {
                accessToken: "",
                expiresIn: 0,
                timestamp: null
            }
        }

        this.loadConnection();
    }

    addObserver(id, update){
        this.observers.push({id:id, update:update});
    }

    removeObserver(id){
        JsNx.removeItem(this.observers, "id", id);
    }

    notifyObservers(){
        for(let o of this.observers){
             o.update();
        }
    }

    async loadConnection(){
        let storedConnection = this.getConnection();
              
        if(storedConnection === null){
            await this.generateCryptoCodes();
        }
        else{
            await this.reloadConnection(storedConnection);

            this.authorizeCallback();
        }

        this.saveConnection();
    }

    /**
     * Step 1
     */
    async generateCryptoCodes(){
        if(window.location.protocol === "https:"){
            this.connection.codeVerifier = UtilsCrypto.generateCodeVerifier();
            this.connection.codeChallenge = await UtilsCrypto.generateCodeChallengeFromVerifier(this.connection.codeVerifier);
        }
        else{
            this.connection.codeVerifier = 'PFRf4LVT6XgU9UhPnJJTuVkkQUJvAIWqiBC7mXmR7bY';
            this.connection.codeChallenge = 'TI-vq7W-LNikUGJ7Eac1kyfmJ4ukvmuCL0F4QJSxZts';
        }
        
        this.connection.state = UtilsCrypto.generateCryptoRandomState();
        this.connection.nonce = UtilsCrypto.generateNonce();
        this.connection.accessCode = "";
        this.connection.token.accessToken = "";
        this.connection.token.expiresIn = 0;
        this.connection.token.timestamp = null;
    }

    /**
     * Step 2
     */
    async reloadConnection(storedConnection){        
        this.connection.codeVerifier = storedConnection.codeVerifier;
        this.connection.codeChallenge = storedConnection.codeChallenge;
        this.connection.state = storedConnection.state;
        this.connection.nonce = storedConnection.nonce;
        this.connection.accessCode = storedConnection.accessCode;
        this.connection.token.accessToken = storedConnection.token.accessToken;
        this.connection.token.expiresIn = storedConnection.token.expiresIn;
        this.connection.token.timestamp = (storedConnection.token.timestamp === null ? null : new Date(storedConnection.token.timestamp));
        
        // token expired
        if(this.isTokenExpired()){
            await this.generateCryptoCodes();
        }
    }

    /**
     * Step 3
     */
    async authorizeCallback(){
        let urlVars = Utils.getUrlVars();

        if((this.connection.state === urlVars['state']) && (this.connection.token.accessToken.length === 0)){
            this.connection.accessCode = urlVars['code'];
            this.saveConnection();

            let result = await this.getAccessToken();
            this.connection.token.accessToken = result.access_token;
            this.connection.token.expiresIn = result.expires_in;
            this.connection.token.timestamp = new Date();
            this.saveConnection();
            this.notifyObservers();
        }
    }

    isTokenStillValid(){
        if(this.connection.token.accessToken.length > 0){
            return !this.isTokenExpired();
        }

        return false;
    }

    isTokenExpired(){
        if(this.connection.token.accessToken.length > 0){
            if((new Date().getTime()/1000) - (this.connection.token.timestamp.getTime()/1000) > this.connection.token.expiresIn){
                return true;
            }
        }

        return false;
    }

    authorize(){
        console.log("call authorize");

        // Create <form> element to submit parameters to OAuth 2.0 endpoint.
        let form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', this.params.urlAuthorize);

        // Parameters to pass to OAuth 2.0 endpoint.
        let params = {'client_id': this.params.clientId,
                      'redirect_uri': this.params.redirectUri,
                      'response_type': 'code',
                      'scope': this.params.scope,
                      'state': this.connection.state,
                      'nonce': this.connection.nonce,
                      'code_challenge': this.connection.codeChallenge,
                      'code_challenge_method': 'S256'
                    };
                      
        // Add form parameters as hidden input values.
        for (var p in params) {
          var input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', p);
          input.setAttribute('value', params[p]);
          form.appendChild(input);
        }
      
        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();
    }

    async getAccessToken(){
        let that = this;
        console.log("call getAccessToken");
                  
        try {
            let url = new URL(that.params.urlToken);
        
            let body = {'client_id': that.params.clientId,
                'redirect_uri': that.params.redirectUri,
                'grant_type': 'authorization_code',
                'scope': that.params.scope,
                'code': that.connection.accessCode,
                    'code_verifier': that.connection.codeVerifier
            };

            const response = await fetch(url, {
                method: "POST",
                mode: 'cors',
                headers: {
                    "X-IBM-Client-Id": that.params.clientId,
                    'Content-Type': 'application/x-www-form-urlencoded',   
                },
                body: new URLSearchParams(Object.entries(body)).toString(),
            });
            
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            let data = await response.json();
            return data;
        } catch (error) {
            console.error(error.message);
        }
    }

    saveConnection(){
        localStorage.setItem('oauth2-params', JSON.stringify(this.connection) );
    }

    getConnection(){
        return JSON.parse(localStorage.getItem('oauth2-params'));
    }
}