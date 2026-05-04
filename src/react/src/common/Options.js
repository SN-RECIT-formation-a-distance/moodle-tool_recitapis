import packageJson from "../../package.json";

export class Options
{
    static appVersion(){ return packageJson.version; }
     
    static appTitle(){
        return i18n.get_string('pluginname') + " | v" + this.appVersion();
    }

    static getWwwRoot(){
        const root = (typeof M !== 'undefined' && typeof M.cfg?.wwwroot === 'string') ? M.cfg.wwwroot : '';
        if (!root){ 
            alert('[recitapis] M.cfg.wwwroot non disponible ou invalide');
        }
        return root; 
    }

    static getGateway(){
        
        return `${Options.getWwwRoot()}/admin/tool/recitapis/classes/WebApi.php`;
    }

    static getWorkPlanGateway(){
        return `${Options.getWwwRoot()}/local/recitworkplan/classes/WebApi.php`;
    }

    static isDevMode(){
        return (process.env.NODE_ENV === "development");
    }
}