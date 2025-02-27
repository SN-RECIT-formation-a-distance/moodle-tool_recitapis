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
 * @package   tool_openai
 * @copyright 2024 RÉCIT 
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {WebApi, JsNx} from '../libs/utils/Utils';
import { $glVars } from './common';
import { Options } from './Options';

export class AppWebApi extends WebApi
{    
    constructor(){
        super(Options.getGateway());
                
        this.http.useCORS = true;
        this.sid = 0;
        this.observers = [];
        this.http.timeout = 30000; // 30 secs
    }

    addObserver(id, update, observables){
        this.observers.push({id:id, update:update, observables: observables});
    }

    removeObserver(id){
        JsNx.removeItem(this.observers, "id", id);
    }

    notifyObservers(observable){
        for(let o of this.observers){
            if(o.observables.includes(observable)){
                o.update();
            }
        }
    }
    
    getOneRosterUsers(onSuccess){
        let data = {service: "getOneRosterUsers"};
        this.post(this.gateway, data, onSuccess);
    }

    getOneRosterEnrollments(onSuccess){
        let data = {service: "getOneRosterEnrollments"};
        this.post(this.gateway, data, onSuccess);
    }

    getMyMoodleCoursesAndGroups(onSuccess){
        console.log('getMyMoodleCoursesAndGroups');
        let data = {service: "getMyMoodleCoursesAndGroups"};
        this.post(this.gateway, data, onSuccess);
    }

    getMoodleEnrollments(emailList, onSuccess){
        console.log('getMoodleEnrollments');
        let data = {emailList: emailList.join(","), service: "getMoodleEnrollments"};
        this.post(this.gateway, data, onSuccess);
    }

    enrollStudentList(userIdList, courseId, groupeId, onSuccess){
        let data = {userIdList: userIdList.join(","), courseId: courseId, groupeId: groupeId,  service: "enrollStudentList"};
        this.post(this.gateway, data, onSuccess);
    }

    getStudentEnrollmentGrics(studentId, level, onSuccess){
        console.log('getStudentEnrollmentGrics');

        let offlineDataYoung = [            
            {
              "annee": "2019",
              "ecole": {
                "id": "100",
                "nom": "bibizijeak"
              },
              "secteurEducatif": {
                "id": "1773444756668416",
                "description": "Wojwufaj locnut ga barjadipa cozvepube seze guwun basjuf poffi cejage mihke evenif wage dasvias."
              },
              "idFrequentation": 126,
              "dateDebut": "2019-02-15",
              "dateFin": "2019-02-15",
              "motifDepart": {
                "id": "5603118840545280",
                "description": "Ilce guaj ciepwar mij jaz icimal unozdap luca wi fobkacum vom tuces da ulnoduj ojitemdiw."
              },
              "effectif": {
                "id": "6288993784168448",
                "description": "Gefacati giutcaw nuc nikeda gag coseguco fod guhoj rulvubvuc ulupiwuk aziez pobonri comjezu nejnitle wojigok nigafpic."
              },
              "typeFormation": {
                "id": "5556839836024832",
                "description": "Tugpof belej jozmuzo norjepiz pofanij za pe gurzam bihvifiv pahih jutceg adu ta."
              },
              "batisse": "100",
              "classeSpeciale": {
                "id": "2030259671138304",
                "description": "Vunevja itafa iriwac kaktin dulatot lulo va wizosa zuluz nomtib hojvuovo tu rapulosi kivi iki ijjihde."
              },
              "regroupement": {
                "id": "131110897975296",
                "description": "Luutnet fukgerti bonedi tewki tusezun atepumte am cuhmah lijispu acvo teuz tanlug li av mobis udejor hitmalut."
              },
              "ordreEnseignement": {
                "id": "5496586605953024",
                "description": "Jamas uj rokasjen uvotok ugiurasi to owe sih fogoalu utfaces ronjazib nokibkej pot hu guc owumombaj."
              },
              "classe": {
                "id": "206580016480256",
                "description": "Fetocar saifjas kawec ta lezziv na gugniiko sihuhe huh goppep jinic doakbes."
              },
              "groupeRepere": "vuzrod",
              "tempsPlein": "tempsPlein",
              "nombreHeuresFrequentation": "900",
              "cycle": {
                "id": "58057264419155279872724735541367608013366865879083946064721369770399498807702039793428",
                "description": "Ah haglirzel janes daha wa wonaec kula rummec sesu ihu edu kubedfos daasgep sa moc imu."
              },
              "anneeCycle": {
                "id": "92030937472603556170575826003094795405533087975938588737645",
                "description": "Ji jupi lab jautazi ikiawok tu pipreppa umanataw mojefato rat hu wowtu ufzoj."
              },
              "motifFinFrequentationMELS": {
                "id": "4931561789063168",
                "description": "Ozige lepseoto muhretzok ragupnud wa uwawommu pego aj ric caan nomnot meubonu ajaugad anga sidnofal ru ceihi."
              },
              "typeParcours": {
                "id": "8549719886266368",
                "description": "Cemazota fuwahge kuiba nom utredtu asokep vomip boobusi uc pa ni fo loosru so."
              },
              "typeFrequentation": {
                "id": "7633987052765184",
                "description": "Vu mizduksu apoajuepa jusiwup efa ajoodauto dog bi vijlu de wesiogi no ejwi roni."
              },
              "clientele": "primaire",
              "formationGeneraleJeuneSecondaire": {
                "programme": {
                  "id": "578149584732160",
                  "description": "Lokvavi mos adalazed elwef ta to vor tavnisafe volboge lim erioc lirimla ognobfo."
                }
              }
            }
          ]
        let offlineDataAdult = [{"annee":2024,"centre":{"id":"482","nom":"CFP POZER"},"idFrequentation":1,"dateDebut":"2024-08-12","dateFinTOSCA":"2025-05-16","effectif":{"id":"2","description":"Adulte"},"filiere":{"id":"D","description":"Dipl\u00f4me Etudes professionnelles"},"programme":{"id":"5321","description":"Vente - conseil"},"batisse":"082","organisationHoraire":{"id":"22","description":"Vente et Repr\u00e9sentaiton JR (2011)"},"typeFormation":{"id":"C","description":"Temps plein"},"nombreMinutesSemaineContrat":1800,"principale":true,"typeParcours":{"id":"03","description":"Alternance Travail-\u00c9tudes"},"typeFrequentation":{"id":"FP","description":"Formation professionnelle"},"clientele":"formationProfessionnelle","formationProfessionnelle":{"equivalentTempsPlein":100.0}}];

        if(Options.isDevMode()){
            onSuccess({success: true, data: (level === 'adult' ? offlineDataAdult : offlineDataYoung)});
            return;
        }

        let mode = (Options.isDevMode() ? "dev" : "prod");
        let data = {studentId: studentId, mode: mode, level: level, service: "getStudentEnrollmentGrics"};
        this.post(this.gateway, data, onSuccess);
    }

    getWorkPlanAssignments(templateId, onSuccess){
        console.log('getWorkPlanAssignments');
        let data = {templateId: templateId, service: "getWorkPlanAssignments"};
        this.post(this.gateway, data, onSuccess);
    }
    
    assignStudentToWorkPlan(userIdList, courseIdList, templateId, onSuccess){
        let data = {
            templateId: templateId, 
            userIdList: userIdList.join(","), 
            courseIdList: courseIdList.join(","), 
            service: "assignStudentToWorkPlan"
        };
        this.post(this.gateway, data, onSuccess);
    }
    
    async getMyWorkPlanList(){
        console.log('getMyWorkPlanList')

        try {
            let url = new URL(`${Options.getWorkPlanGateway()}`);
            //url.searchParams.append('sesskey',  M.cfg.sesskey);

            let body = {
                sesskey: M.cfg.sesskey,
                state: 'ongoing',
                service: 'getWorkPlanList',
                userId: 0,
                limit: 25,
                offset: 0,
                forStudent: false,
            }
            
            const response = await fetch(url, {
                method: "POST",
                mode: 'cors',
                body: JSON.stringify(body),
                headers: {
                  'accept': 'application/json',   
                },
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

    /*sendEmail(recipientList, subject, message, onSuccess){
        let data = {recipientList: recipientList.join(","), subject: subject, message: message,  service: "sendEmail"};
        this.post(this.gateway, data, onSuccess);
    }*/
};

export class GricsApi{
    constructor(oauth2){
        this.oauth2 = oauth2;
        this.domVisualFeedback = null;
    }

    showLoadingFeedback(){
        if(this.domVisualFeedback === null){ return; }
        this.domVisualFeedback.style.display = "block";
    }

    hideLoadingFeedback(){
        if(this.domVisualFeedback === null){ return; }
        this.domVisualFeedback.style.display = "none";
    }

    async fetchData(url, method){
        try {
            this.showLoadingFeedback();

            const response = await fetch(url, {
                method: method,
                mode: 'cors',
                headers: {
                  "Authorization": "Bearer " + this.oauth2.connection.token.accessToken,
                  "X-IBM-Client-Id": this.oauth2.params.clientId,
                  'accept': 'application/json',   
                },
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            let data = await response.json();

            this.hideLoadingFeedback();

            return data;
        } catch (error) {
            this.hideLoadingFeedback();
            throw new Error(error);
        }
    }

    async getMyProfile(){
        console.log('getMyProfile');

        let offlineData = {
            "courriel": "gustavo.bazzo@cssbe.gouv.qc.ca",
            "nom": "Bazzo",
            "prenom": "Gustavo",
            "sexe": "masculin",
            "idOrganisation": "7b03463a-6ac0-408c-8491-33d2ee5ab186",
            "employe": {
              "id": "731f7c82-d512-4d12-9f82-76eb6e86107e",
              "matricule": "000019542",
              "roles": {}
            }
        }

        if(Options.isDevMode()){           
            return offlineData;
        }

        let url = new URL(`${$glVars.appParams.grics.urlApi}/v3/utilisateurs/moi`);
        return await this.fetchData(url, "GET");
    }

    async getMyGroups(identityId){
        let offlineData = {
            "centres": [
              {
                "id": "00000000-0000-0000-0000-000000000001",
                "groupesAtelier": [
                  {
                    "id": "5802446613905408",
                    "atelier": "niwnuujukujo",
                    "groupe": "maprok"
                  },
                  {
                    "id": "6851551960236032",
                    "atelier": "zembejso",
                    "groupe": "tilropagimrezocm"
                  },
                  {
                    "id": "200790109061120",
                    "atelier": "dasub",
                    "groupe": "hucedpe"
                  }
                ],
                "groupesHoraire": [
                  {
                    "id": "4300949040398336",
                    "groupe": "emusagnufihbiji"
                  },
                  {
                    "id": "4841449231220736",
                    "groupe": "feloefbuzce"
                  },
                  {
                    "id": "762021150720000",
                    "groupe": "nofol"
                  }
                ]
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "groupesAtelier": [
                  {
                    "id": "5510585504497664",
                    "atelier": "vashuhcukevikicg",
                    "groupe": "asige"
                  },
                  {
                    "id": "4162985685680128",
                    "atelier": "calmolhohnifel",
                    "groupe": "sufezovabiwora"
                  },
                  {
                    "id": "1534485556363264",
                    "atelier": "pezuvfarkiltetpo",
                    "groupe": "heta"
                  }
                ],
                "groupesHoraire": [
                  {
                    "id": "6808024534482944",
                    "groupe": "fezjavu"
                  },
                  {
                    "id": "5418659033907200",
                    "groupe": "kacusvulibugi"
                  },
                  {
                    "id": "772008409300992",
                    "groupe": "najis"
                  }
                ]
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "groupesAtelier": [
                  {
                    "id": "2067915715117056",
                    "atelier": "feureko",
                    "groupe": "hipughuvlinol"
                  },
                  {
                    "id": "8943538035228672",
                    "atelier": "baniubuuftecpuo",
                    "groupe": "uvupocsoceracurs"
                  },
                  {
                    "id": "8684295042367488",
                    "atelier": "bofo",
                    "groupe": "korkaza"
                  }
                ],
                "groupesHoraire": [
                  {
                    "id": "6450819218014208",
                    "groupe": "vomunf"
                  },
                  {
                    "id": "4241202417238016",
                    "groupe": "ticek"
                  },
                  {
                    "id": "311459932274688",
                    "groupe": "remazuslibgukfe"
                  }
                ]
              }
            ],
            "ecoles": [
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "groupesRepere": [
                  {
                    "id": "8596427173265408",
                    "code": "baldos"
                  },
                  {
                    "id": "6487394922528768",
                    "code": "agagatokakaj"
                  },
                  {
                    "id": "2115664034660352",
                    "code": "fazmozkafa"
                  }
                ],
                "groupesMatiere": [
                  {
                    "id": "629070089945088",
                    "matiere": "isumikcane",
                    "groupe": "galep"
                  },
                  {
                    "id": "5375698204098560",
                    "matiere": "cegzeze",
                    "groupe": "mekorandewidase"
                  },
                  {
                    "id": "5670502446137344",
                    "matiere": "gajkirisikunn",
                    "groupe": "vuhv"
                  }
                ],
                "groupesCours": [
                  {
                    "id": "2375365968265216",
                    "cours": "segodvi",
                    "groupe": "jopat"
                  },
                  {
                    "id": "1691979566022656",
                    "cours": "vogkap",
                    "groupe": "wisojse"
                  },
                  {
                    "id": "20868180738048",
                    "cours": "dibiwopuna",
                    "groupe": "ezaluneagvukipof"
                  }
                ]
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "groupesRepere": [
                  {
                    "id": "482502217039872",
                    "code": "gidarmo"
                  },
                  {
                    "id": "7993103220736000",
                    "code": "udwuif"
                  },
                  {
                    "id": "6497199842131968",
                    "code": "lapwunaodcivu"
                  }
                ],
                "groupesMatiere": [
                  {
                    "id": "6624640350814208",
                    "matiere": "emveg",
                    "groupe": "juzadgepel"
                  },
                  {
                    "id": "6774185070166016",
                    "matiere": "ajeibekumveimi",
                    "groupe": "moropajtugo"
                  },
                  {
                    "id": "104454456082432",
                    "matiere": "hamewroj",
                    "groupe": "hosef"
                  }
                ],
                "groupesCours": [
                  {
                    "id": "8847543196712960",
                    "cours": "ewadihiwvamud",
                    "groupe": "ticihehugagemcin"
                  },
                  {
                    "id": "925424309764096",
                    "cours": "zacz",
                    "groupe": "ufpotuda"
                  },
                  {
                    "id": "3132605161537536",
                    "cours": "rahtasenb",
                    "groupe": "jehmo"
                  }
                ]
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "groupesRepere": [
                  {
                    "id": "5270502748717056",
                    "code": "zunos"
                  },
                  {
                    "id": "5735447380623360",
                    "code": "kooshuimdituikoz"
                  },
                  {
                    "id": "5482898163499008",
                    "code": "umeacofehguknogi"
                  }
                ],
                "groupesMatiere": [
                  {
                    "id": "4616582028328960",
                    "matiere": "vajalasg",
                    "groupe": "kicfuoptazs"
                  },
                  {
                    "id": "2229568240877568",
                    "matiere": "toptetowo",
                    "groupe": "socuribebetekfi"
                  },
                  {
                    "id": "3098096512794624",
                    "matiere": "cejorco",
                    "groupe": "popsow"
                  }
                ],
                "groupesCours": [
                  {
                    "id": "593605190221824",
                    "cours": "riksezwuzdelf",
                    "groupe": "zocmarm"
                  },
                  {
                    "id": "4227138748153856",
                    "cours": "decuzjotoromp",
                    "groupe": "cuhocsod"
                  },
                  {
                    "id": "2807869739106304",
                    "cours": "guavkisopr",
                    "groupe": "opefococtegnom"
                  }
                ]
              }
            ]
        }

        if(Options.isDevMode()){
            return offlineData;
        }

        let url = new URL(`${$glVars.appParams.grics.urlApi}/v3/identites/${identityId}/groupes`);
        return await this.fetchData(url, "GET");
    }

    async getGroupMembers(groupId){
        console.log('getGroupMembers')

        let result = {"eleves": [], "responsables": []};

        let offlineData = {
            "eleves": [
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "fiche": -39356053,
                "courriel": "a@a.com",
                "nom": "Lamontagne",
                "prenom": "David"
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "fiche": -33355715,
                "courriel": "b@b.com",
                "nom": "L'hebreux",
                "prenom": "Eleve"
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "fiche": -82183624,
                "courriel": "aaa@aaa.com",
                "nom": "tifohf",
                "prenom": "fokdebacwefabiw"
              }
            ],
            "responsables": [
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "matricule": "ruhisocizdis",
                "courriel": "zurovgur",
                "nom": "felujveomus",
                "prenom": "unorjugu"
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "matricule": "gedu",
                "courriel": "izuebfatoprun",
                "nom": "watkiriretrubma",
                "prenom": "ajolwogiflop"
              },
              {
                "id": "00000000-0000-0000-0000-000000000000",
                "matricule": "wedac",
                "courriel": "dajubsihlanresum",
                "nom": "gamet",
                "prenom": "gecawirusef"
              }
            ]
        }

        if(Options.isDevMode()){
            result = offlineData;
        }
        else{
            let url = new URL(`${$glVars.appParams.grics.urlApi}/v3/groupes/${groupId}/membres`);
            result = await this.fetchData(url, "GET");
        }

        result.eleves.sort((a, b) => {
            let str1 = `${a.nom} ${a.prenom}`;
            let str2 = `${b.nom} ${b.prenom}`;
            str1 = str1.toLowerCase().replace("'","");
            str2 = str2.toLowerCase().replace("'","");
            return str1.localeCompare(str2);
        });

        return result;
    }
}
