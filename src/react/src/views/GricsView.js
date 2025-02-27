import React, { Component } from 'react';
import { $glVars, Assets, Options, StepButton } from '../common/common';
import { Card} from 'react-bootstrap';
import {  UtilsOAuth2 } from '../libs/utils/Utils';
import { ComboBoxPlus } from '../libs/components/ComboBoxPlus';
import { GricsApi } from '../common/AppWebApi';
import {  faIdCard,  faUsers } from '@fortawesome/free-solid-svg-icons';
import { FeedbackCtrl } from '../libs/components/Feedback';
import { i18n } from '../common/i18n';

export class GricsCard extends Component{ 
    static defaultProps = {
        onDataChange: null,
        className: ''
    };

    constructor(props){
      super(props);

        this.getMyProfile = this.getMyProfile.bind(this);
        this.getMyGroups = this.getMyGroups.bind(this);
        this.getGroupMembers = this.getGroupMembers.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);
        
        let oauth2Params = {
            urlAuthorize: $glVars.appParams.grics.urlAuthorization,
            urlToken: $glVars.appParams.grics.urlToken,
            clientId: $glVars.appParams.grics.clientId, // api test grics = 621021ba9c48e1ed86ba08da56d69626
            redirectUri: $glVars.appParams.grics.redirectUri,
            scope:  'apiclients openid profile'
        }

        this.oauth2 = new UtilsOAuth2(oauth2Params);
        $glVars.gricsApi = new GricsApi(this.oauth2);       

        this.state = {
            data: {
                myProfile: null, 
                selectedGroup: {
                    label: '', 
                    value: null, 
                    data: {}
                },
                myGroupMemberList: []
            },
            myGroups:[]
        }
    }

    componentDidMount(){
        this.oauth2.addObserver("GricsCard", this.forceUpdate.bind(this));
    }    

    render(){
        let main = 
            <Card  className={this.props.className}>
                <Card.Header>Connexion GRICS</Card.Header>
                <Card.Body>
                    <div  className='d-flex justify-content-around'>
                        <StepButton disabled={this.isTokenStillValid()} onClick={() => this.oauth2.authorize()}
                                    label={` Étape 1: Se connecter avec Mozaïk`} done={this.isTokenStillValid()}
                                    img={Assets.mozaikBrand}>
                        </StepButton>

                        <StepButton disabled={(!this.isTokenStillValid()) || (this.state.data.myProfile !== null)} onClick={this.getMyProfile}
                                    label={` Étape 2: obtenir mon profil`} icon={faIdCard} done={(this.state.data.myProfile !== null)}/>
                        
                        <StepButton disabled={(this.state.data.myProfile === null) || (this.state.myGroups.length > 0)} onClick={this.getMyGroups}
                                    label={` Étape 3: obtenir mes groupes`} icon={faUsers} done={(this.state.myGroups.length > 0)}/>
                    </div>
                    
                    {this.state.data.myProfile &&
                        <>
                            <hr/>
                            <div>
                                <h4>Mon profil</h4>
                                <div><b>{`${this.state.data.myProfile.prenom} ${this.state.data.myProfile.nom}`}</b> {` (${this.state.data.myProfile.courriel})`}</div>
                            </div>
                        </>
                    }
                    {this.state.myGroups.length > 0 &&
                        <div className='mt-4'>
                            <h4 className='mb-1'>Mes groupes GRICS</h4>
                            <ComboBoxPlus placeholder={"Sélectionnez un groupe"} name="groupId" value={this.state.data.selectedGroup.value} options={this.state.myGroups} onChange={this.onSelectGroup}></ComboBoxPlus>
                        </div>
                    }
                </Card.Body>
            </Card>;

        return main;
    }

    isTokenStillValid(){
        if(Options.isDevMode()){
            return true;
        }

        return this.oauth2.isTokenStillValid()
    }

    onSelectGroup(event){
        let that = this;

        let data = {};
        Object.assign(data, this.state.data);
        data.selectedGroup = event.target;
        this.setState({data: data}, () => {
            that.getGroupMembers();
        });
    }

    async getMyProfile(){
        let that = this;
        let data = {};
        Object.assign(data, this.state.data);

        data.myProfile = await $glVars.gricsApi.getMyProfile();

        if($glVars.appParams.userEmail !== data.myProfile.courriel){
            if(Options.isDevMode()){
                FeedbackCtrl.instance.showWarning(i18n.get_string('pluginname'), 
                `Votre couriel Moodle (${$glVars.appParams.userEmail}) ne correspond pas au courriel GRICS (${data.myProfile.courriel}).`,3);
            }
            else{
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), 
                `Votre couriel Moodle (${$glVars.appParams.userEmail}) ne correspond pas au courriel GRICS (${data.myProfile.courriel}).`);
                
                return;
            }
        }

        this.setState({data: data}, () => {
            if(that.props.onDataChange){
                that.props.onDataChange(that.state.data);
            }
        });
    }

    async getMyGroups(){
        let result = await $glVars.gricsApi.getMyGroups(this.state.data.myProfile.employe.id);

        if((result.centres.length === 0) && (result.ecoles.length === 0)){
            FeedbackCtrl.instance.showWarning(i18n.get_string('pluginname'), 
            i18n.get_string('nodata'), 3);
            return;
        }

        let dataProvider = [];
        for(let institution in result){
            let groupLocation = result[institution];
          
            if(!Array.isArray(groupLocation)){ continue; }

            for(let groupType of groupLocation){
                for(let prop2 in groupType){
                    let groupList = groupType[prop2];
        
                    if(!Array.isArray(groupList)){ continue; }

                    for(let group of groupList){
                        let item = {
                            label: '',
                            value: group.id,
                            data: {
                                institution: institution,
                                institutionId: groupType.id, 
                                type: prop2,
                                typeDesc: ''
                            }
                        };

                        switch(prop2){
                            case 'groupesAtelier':
                                item.data.typeDesc = group.atelier;
                                item.label = `${group.atelier}-${group.groupe}`;
                                break;
                            case 'groupesHoraire':
                                item.label = group.groupe;
                                break;
                            case 'groupesRepere':
                                item.label = group.code;
                                break;
                            case 'groupesMatiere':
                                item.data.typeDesc = group.matiere;
                                item.label = `${group.matiere}-${group.groupe}`;
                                break;
                            case 'groupesCours':
                                item.data.typeDesc = group.cours;
                                item.label = `${group.cours}-${group.groupe}`;
                                break;
                        }

                        dataProvider.push(item);
                    }
                }
            }
        }

        dataProvider.sort((a, b) => a.label.localeCompare(b.label));

        this.setState({myGroups: dataProvider});
    }

    async getGroupMembers(){
        let result = await $glVars.gricsApi.getGroupMembers(this.state.data.selectedGroup.value);

        if(result.hasOwnProperty('eleves')){
            result = result.eleves;
        }
        else{
            result = [];
        }

        let that = this;
        let data = this.state.data;
        data.myGroupMemberList = result;
        this.setState({data: data},  () => {
            if(that.props.onDataChange){
                that.props.onDataChange(that.state.data);
            }
        });
    }

    /*getOneRosterUsers(){
        $glVars.webApi.getOneRosterUsers((result) => {
            if(!result.success){
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
            else{
                FeedbackCtrl.instance.showInfo(i18n.get_string('pluginname'), $glVars.i18n.get_string('msgactioncompleted'), 3);
            }
        });
    }*/

    /*getOneRosterEnrollments(){
        $glVars.webApi.getOneRosterEnrollments((result) => {
            if(!result.success){
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
            else{
                FeedbackCtrl.instance.showInfo(i18n.get_string('pluginname'), $glVars.i18n.get_string('msgactioncompleted'), 3);
            }
        });
    }*/
}
