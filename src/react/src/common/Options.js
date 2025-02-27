import packageJson from "../../package.json";

export class Options
{
    static appVersion(){ return packageJson.version; }
    
    static appTitle(){
        return i18n.get_string('pluginname') + " | v" + this.appVersion();
    }

    static getGateway(){
        return `${M.cfg.wwwroot}/admin/tool/recitapis/classes/WebApi.php`;
    }

    static getWorkPlanGateway(){
        return `${M.cfg.wwwroot}/local/recitworkplan/classes/WebApi.php`;
    }

    static isDevMode(){
        return (process.env.NODE_ENV === "development");
    }
}