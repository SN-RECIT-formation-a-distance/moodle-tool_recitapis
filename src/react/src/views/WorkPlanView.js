
import React, { Component } from 'react';
import { i18n } from '../common/i18n';
import { $glVars, CheckBoxControl, CheckItem } from '../common/common';
import { Button, ButtonGroup, Table, Row, Col, Alert, ButtonToolbar } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../libs/components/Modal';
import { FeedbackCtrl } from '../libs/components/Feedback';
import { ComboBoxPlus } from '../libs/components/ComboBoxPlus';

export class WorkPlanView extends Component{ 
    static defaultProps = {
        gricsData: null,
        enrollmentList: [],
        refresh: null,
        groupId: ''
    };

    constructor(props){
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.getWorkPlanAssignments = this.getWorkPlanAssignments.bind(this);
        this.getStudentEnrollmentGrics = this.getStudentEnrollmentGrics.bind(this);
        this.getMyWorkPlanList = this.getMyWorkPlanList.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onCloseStudentDetails = this.onCloseStudentDetails.bind(this);
        this.onCloseAssignWorkPlan = this.onCloseAssignWorkPlan.bind(this);

        this.state = {
            selectionList: new Set(), 
            selectAll: false,
            showAssignWorkPlan: false,
            studentDetails: {
                show: false,
                data: null,
                dataProvider: new Map()
            },
            workPlanData: {
                workPlanList: [],
                courseList: [],
                assignmentList: [],
                filter: {
                    workPlan: {label: "", value: 0}
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.groupId.toString() !== this.props.groupId.toString()){
            let data = this.state;
            data.selectionList.clear();
            data.selectAll = false;
            this.setState(data);
        }
    }

    componentDidMount(){
        this.getMyWorkPlanList();
    }    

    render(){
        let that = this;
        let main = 
            <div className='mb-4'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th className='text-center' style={{borderBottom: "5px solid #0073cf"}} colSpan="7">Information GRICS</th>
                            <th  style={{borderBottom: "5px solid #ffa500", minWidth: 250}} colSpan={this.state.workPlanData.courseList.length + 3}>
                                <ComboBoxPlus className={"w-100"} placeholder={"Sélectionnez un plan de travail"} name="workPlan" value={this.state.workPlanData.filter.workPlan.value} options={this.state.workPlanData.workPlanList} onChange={this.onFilterChange}></ComboBoxPlus>    
                            </th>
                        </tr>
                        <tr>
                            <th className='text-center' style={{width: 40}} >
                                <CheckBoxControl onClick={() => this.onSelect(this.props.enrollmentList, !this.state.selectAll, !this.state.selectAll)} checked={this.state.selectAll} />
                            </th>
                            <th>#</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Fiche</th>
                            <th>Courriel</th>                            
                            <th style={{width: 70}}>Détails</th>
                            {this.state.workPlanData.courseList.length > 0 && <th >Compte Moodle</th> }
                            {this.state.workPlanData.courseList.map(function(item, index){
                                return <th key={index}>{item.shortName}</th>;
                            })}
                            {this.state.workPlanData.courseList.length > 0 && <th>Attribué</th>}
                        </tr>
                    </thead>
                    <tbody>
                {this.props.enrollmentList.map(function(item, index){
                    let isSelected = that.state.selectionList.has(item);

                    let hasMoodleAccount = (item.moodleData.hasAccount.toString() === "1");
                    let hasWorkPlanAssignment = that.state.workPlanData.assignmentList.includes(item.moodleData.userid.toString());
                    
                    let result = 
                        <tr key={index} style={(isSelected ? {backgroundColor: '#f0ad4e61'} : null)}>
                            <td className='text-center'>
                                {!hasWorkPlanAssignment && <CheckBoxControl onClick={() => that.onSelect([item], !isSelected)} checked={isSelected} />}
                            </td>
                            <td>{index + 1}</td>
                            <td>{item.nom}</td>
                            <td>{item.prenom}</td> 
                            <td>{item.fiche}</td>
                            <td>{item.courriel}</td>                            
                            <td className='text-center'>
                                <Button variant="outline-primary" size='sm' onClick={() => that.getStudentEnrollmentGrics(item)} title="Obtenir les fréquentations d'un élève adulte ou jeune.">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                </Button>
                            </td>
                            {that.state.workPlanData.courseList.length > 0 && 
                                <td className='text-center '>
                                    <CheckItem checked={hasMoodleAccount}/>
                                </td>
                            }
                            {that.state.workPlanData.courseList.map(function(item2, index2){
                                let result =
                                    <td className='text-center' key={index2}>
                                        <CheckItem checked={(item.moodleData.courseids.includes(item2.courseId.toString()))}/>
                                    </td>
                                return result;
                            })}
                            {that.state.workPlanData.courseList.length > 0 && 
                                <td className='text-center'>
                                    <CheckItem checked={hasWorkPlanAssignment}/>
                                </td>
                            } 
                        </tr>
                    return result;
                })}
                    </tbody>
                </Table>
                <hr/>
                <ButtonToolbar className='d-flex justify-content-end'>                    
                    <ButtonGroup>
                        <Button onClick={() => this.setState({showAssignWorkPlan: true})} 
                            disabled={(this.state.selectionList.size === 0) || (this.state.workPlanData.filter.workPlan.value.toString() === "0")}>
                                <FontAwesomeIcon icon={faUserGraduate} />{` Attribuer le plan de travail`}
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar> 
                 
                {this.state.showAssignWorkPlan && 
                    <ModalAssignWorkPlan workPlanData={this.state.workPlanData} studentList={Array.from(this.state.selectionList)} onClose={this.onCloseAssignWorkPlan}/>
                }

                {this.state.studentDetails.show && <ModalStudentEnrollmentGrics onClose={this.onCloseStudentDetails} gricsData={this.state.studentDetails.data}/>}
            </div>;
    
        return main;
    }

    onSelect(listToSelect, state, selectAll){
        selectAll = (typeof selectAll === "undefined" ? this.state.selectAll : selectAll);

        let selectionList = this.state.selectionList;         
        
            
        for(let item of listToSelect){
            if(state){
                let hasWorkPlanAssignment = this.state.workPlanData.assignmentList.includes(item.moodleData.userid.toString());
                if(!hasWorkPlanAssignment){
                    selectionList.add(item);
                }
            }
            else{
                selectionList.delete(item);
            }
            
        }
        
        this.setState({selectionList: selectionList, selectAll: selectAll});
    }

    async getMyWorkPlanList(){
        let result = await $glVars.webApi.getMyWorkPlanList();

        if(result.success){
            let workPlanData = this.state.workPlanData;
            workPlanData.workPlanList = [];

            for(let item of result.data.items){
                workPlanData.workPlanList.push({label: item.template.name, value: item.template.id});
            }

            this.setState({workPlanData: workPlanData});
        }
        else{
            FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
        }
    }

    async getStudentEnrollmentGrics(data){
        let studentDetails = this.state.studentDetails;

        if(studentDetails.dataProvider.has(data.fiche.toString())){
            studentDetails.data = studentDetails.dataProvider.get(data.fiche.toString());
            studentDetails.show = true;
            this.setState({studentDetails: studentDetails});
            return;
        } 

        let level = (this.props.gricsData.selectedGroup.data.institution === 'centres' ? 'adult' : 'young');
        let that = this;

        $glVars.webApi.getStudentEnrollmentGrics(data.fiche, level, (result) => {
            if(result.success){
                studentDetails.data = (result.data.length > 0 ? result.data.pop() : null);
                studentDetails.dataProvider.set(data.fiche.toString(), studentDetails.data);
                studentDetails.show = true;
                that.setState({studentDetails: studentDetails});
            } 
            else{  
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
        });
    }

    getWorkPlanAssignments(){
        if(this.state.workPlanData.filter.workPlan.value.toString() === '0'){
            return;
        }
          
        let that = this;
        $glVars.webApi.getWorkPlanAssignments(this.state.workPlanData.filter.workPlan.value, (result) => {    
            if(result.success){
                let workPlanData = that.state.workPlanData;
                workPlanData.courseList = result.data.courselist;
                workPlanData.assignmentList = result.data.assignmentlist;
                that.setState({workPlanData: workPlanData});
            }
            else{
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
        });
    }

    onFilterChange(event){
        let workPlanData = this.state.workPlanData;
        
        if(event.target.value === null){
            workPlanData.filter[event.target.name] = {label: "", value: 0};
            workPlanData.courseList = [];
            workPlanData.assignmentList = [];
        }
        else{
            workPlanData.filter[event.target.name] = event.target;
        }
        

        this.setState({workPlanData: workPlanData},  this.getWorkPlanAssignments);
    }

    onCloseAssignWorkPlan(refresh){
        if((typeof refresh === "boolean") && (refresh)){
            this.props.refresh();
            this.getWorkPlanAssignments();
        }

        this.setState({showAssignWorkPlan: false});
    }

    onCloseStudentDetails(){
        let data = this.state.studentDetails;
        data.show = false;
        this.setState({studentDetails: data});
    }
}

class ModalStudentEnrollmentGrics extends Component{
    static defaultProps = {        
        gricsData: null,
        onClose: null
    };

    render(){
        let gricsData = this.props.gricsData;

        let modalBody = null;

        if(gricsData === null){ 
            modalBody = <Alert variant='warning'>{i18n.get_string('nodata')}</Alert>; 
        }
        else{
            modalBody = 
            <div>
                <Row className='mb-3'>
                    {gricsData.centre && 
                        <Col>
                            <div>Centre</div>
                            <div className='bg-light p-1'><b>{gricsData.centre.nom}</b></div>
                        </Col>
                    }
                    {gricsData.ecole && 
                        <Col>
                            <div>École</div>
                            <div className='bg-light p-1'><b>{gricsData.ecole.nom}</b></div>
                        </Col>
                    }   
                    <Col>
                        <div>Année</div>
                        <div className='bg-light p-1'><b>{gricsData.annee}</b></div>
                    </Col>                 
                </Row>
                <Row className='mb-3'>
                    <Col>
                        <div>Date début</div>
                        <div className='bg-light p-1'><b>{gricsData.dateDebut}</b></div>
                    </Col>
                    <Col>
                        <div>Date fin TOSCA</div>
                        <div className='bg-light p-1'><b>{gricsData.dateFinTOSCA}</b></div>
                    </Col>
                </Row>
                <Row className='mb-3'>
                    <Col>
                        <div>Type frequentation</div>
                        <div className='bg-light p-1'><b>{gricsData.typeFrequentation.description}</b></div>
                    </Col>
                    {gricsData.typeFormation &&
                        <Col>
                            <div>Type formation</div>
                            <div className='bg-light p-1'><b>{gricsData.typeFormation.description}</b></div>
                        </Col>
                    }
                    <Col>
                        <div>Effectif</div>
                        <div className='bg-light p-1'><b>{gricsData.effectif.description}</b></div>
                    </Col>                    
                </Row>
                <Row className='mb-3'> 
                    <Col>
                        <div>Nombre minutes semaine contrat</div>
                        <div className='bg-light p-1'><b>{gricsData.nombreMinutesSemaineContrat}</b></div>
                    </Col>
                    {gricsData.filiere &&
                        <Col>
                            <div>Filière</div>
                            <div className='bg-light p-1'><b>{gricsData.filiere.description}</b></div>
                        </Col>
                    }
                </Row>
            </div>;
        }

        return <Modal title="Fréquentations d'un élève" style={{maxWidth: 700, width:'auto'}} body={modalBody} onClose={this.props.onClose}/>
    }
}

class ModalAssignWorkPlan extends Component{
    static defaultProps = {        
        studentList: [],
        workPlanData: null,
        onClose: null
    };

    constructor(props){
        super(props);

        this.onApply = this.onApply.bind(this);

        this.state = {confirmed: false};
    }

    render(){
        let studentList = this.props.studentList;

        studentList = studentList.filter((item) => {
            return (item.moodleData.hasAccount.toString() === "1")
        })

        let that = this;
        let modalBody = 
            <div>
                <Row className='mb-3'>
                    <Col>
                        <div>Plan de travail</div>
                        <div className='bg-light p-1'><b>{this.props.workPlanData.filter.workPlan.label}</b></div>
                    </Col>                
                </Row>
                <Row>
                    <Col>
                        <div>Cours</div>
                        <div className='bg-light p-1'>
                            {this.props.workPlanData.courseList.map(function(item, index){
                                let comma = (that.props.workPlanData.courseList.length > (index + 1) ? ", " : "");
                                return <b key={index}>{item.shortName}{comma}</b>;
                            })}
                        </div>
                    </Col>
                </Row>
                
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Prénom</th>
                            <th>Nom</th>
                            <th>Fiche</th>
                            <th>Courriel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentList.map(function(item, index){
                            let result = 
                                <tr key={index} >
                                    <td>{index + 1}</td>
                                    <td>{item.prenom}</td> 
                                    <td>{item.nom}</td>
                                    <td>{item.fiche}</td>
                                    <td>{item.courriel}</td>
                                </tr>
                            return result;
                        })}
                    </tbody>
                </Table>
                <Alert className="mt-2 d-flex align-items-center p-1" variant="warning">
                    <CheckBoxControl onClick={() => this.setState({confirmed: !this.state.confirmed})} checked={this.state.confirmed} />
                    <span className='ml-2'>Je confirme l'attribution de ce plan de travail à ces étudiants.</span>
                </Alert>
            </div>;

        let footer = 
            <ButtonGroup className='d-flex justify-content-end'>
                <Button style={{flex: 0}} variant='secondary'  onClick={this.props.onClose}>Annuler</Button>
                <Button disabled={!this.state.confirmed || (studentList.length === 0)} style={{flex: 0}} variant='success' onClick={this.onApply}>Appliquer</Button>
            </ButtonGroup>;

        return <Modal title="Attribution des étudiants au plan de travail" style={{maxWidth: 850, width:'auto'}} body={modalBody} onClose={this.props.onClose} footer={footer}/>
    }

    onApply(){
        let that = this;

        let userIdList = [];
        for(let item of this.props.studentList){
            userIdList.push(item.moodleData.userid);
        }

        let templateId = this.props.workPlanData.filter.workPlan.value;
        let courseIdList = [];
        for(let item of this.props.workPlanData.courseList){
            courseIdList.push(item.courseId);
        }

        $glVars.webApi.assignStudentToWorkPlan(userIdList, courseIdList, templateId, (result) => {    
            if(!result.success){
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
            else{
                FeedbackCtrl.instance.showInfo(i18n.get_string('pluginname'), i18n.get_string('msgactioncompleted'), 3);
            }

            that.props.onClose(true);
        });
    }
}