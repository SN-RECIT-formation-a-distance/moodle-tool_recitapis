
import React, { Component } from 'react';
import { i18n } from '../common/i18n';
import { $glVars, CheckBoxControl, CheckItem } from '../common/common';
import { Button, ButtonGroup, Table, Row, Col, Alert, ButtonToolbar } from 'react-bootstrap';
import Utils, { JsNx } from '../libs/utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCopy, faEnvelope, faUserGraduate, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../libs/components/Modal';
import { FeedbackCtrl } from '../libs/components/Feedback';
import { ComboBoxPlus } from '../libs/components/ComboBoxPlus';

export class CourseEnrollmentView extends Component{ 
    static defaultProps = {
        gricsData: null,
        enrollmentList: [],
        refresh: null
    };

    constructor(props){
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onCloseEnrollStudents = this.onCloseEnrollStudents.bind(this);
        this.onSendEmail = this.onSendEmail.bind(this);
        this.getMyMoodleCoursesAndGroups = this.getMyMoodleCoursesAndGroups.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onCreateGroup = this.onCreateGroup.bind(this);
        this.onCopyEmailList = this.onCopyEmailList.bind(this);

        this.state = {
            moodleData: {
                filter:{
                    course: {label: "", value: 0}, 
                    group: {label: "", value: 0}
                },
                groupList: [], 
                myCourseList: [],
                fetchStudentList: false
            }, 
            selectionList: new Set(), 
            selectAll: false,
            showEnrollStudents: false
        }
    }
    
    componentDidMount(){
        this.getMyMoodleCoursesAndGroups();
    }

    getMyMoodleCoursesAndGroups(){
        let that = this;

        $glVars.webApi.getMyMoodleCoursesAndGroups((result) => {    
            let data = that.state.moodleData;
            data.myCourseList = [];
            data.groupList = []; 

            for(let item of result.data){
                item.courseid = parseInt(item.courseid);
                item.groupid = parseInt(item.groupid);

                let index = JsNx.getItemIndex(data.myCourseList, 'value', item.courseid);
                if(index === -1){
                    data.myCourseList.push({label: item.coursename, value: item.courseid})
                }

                index = JsNx.getItemIndex(data.groupList, 'value', item.groupid);
                if(index === -1){
                    data.groupList.push({label: item.groupname, value: item.groupid, data: {courseId: item.courseid}});
                }
            }

            that.setState({moodleData: data});
        });
    }

    render(){
        let moodleGroupList = [];

        if(this.state.moodleData.filter.course.value > 0){
            moodleGroupList = this.state.moodleData.groupList.filter(item => {
                return (item.data.courseId === this.state.moodleData.filter.course.value);
            });
        }

        let that = this;
        let main = 
            <div className='mb-4'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th className='text-center' style={{borderBottom: "5px solid #0073cf"}} colSpan="6">Information GRICS</th>
                            <th className='text-center' style={{borderBottom: "5px solid #ffa500"}} colSpan="3"><span>Inscription Moodle</span></th>
                        </tr>
                        <tr>
                            <th className='text-center' style={{width: 40}}>
                                <CheckBoxControl onClick={() => this.onSelect(this.props.enrollmentList, !this.state.selectAll, !this.state.selectAll)} checked={this.state.selectAll} />
                            </th>
                            <th>#</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Fiche</th>
                            <th>Courriel</th>
                            <th >Compte Moodle</th> 
                            <td style={{minWidth: 250}}>
                                <ComboBoxPlus className={"w-100"} placeholder={"Sélectionnez un cours"} name="course" value={this.state.moodleData.filter.course.value} options={this.state.moodleData.myCourseList} onChange={this.onFilterChange}></ComboBoxPlus>
                            </td> 
                            <td style={{minWidth: 285}} className='d-flex justify-content-around'>
                                <ComboBoxPlus className={"w-100"}  placeholder={"Sélectionnez un groupe"} name="group" value={this.state.moodleData.filter.group.value} options={moodleGroupList} onChange={this.onFilterChange}></ComboBoxPlus>    
                                <Button className='ml-2' variant='outline-primary' size='sm' disabled={this.state.moodleData.filter.course.value.toString() === "0"} onClick={this.onCreateGroup} title={`Créer un groupe Moodle`}>
                                    <FontAwesomeIcon icon={faUsers} /> 
                                </Button>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                {this.props.enrollmentList.map(function(item, index){
                    let isSelected = that.state.selectionList.has(item);

                    let result = 
                        <tr key={index} style={(isSelected ? {backgroundColor: '#f0ad4e61'} : null)}>
                            <td className='text-center'>
                                <CheckBoxControl onClick={() => that.onSelect([item], !isSelected)} checked={isSelected} />
                            </td>
                            <td>{index + 1}</td>
                            <td>{item.nom}</td>
                            <td>{item.prenom}</td> 
                            <td>{item.fiche}</td>
                            <td>{item.courriel}</td>
                            <td className='text-center '>
                                <CheckItem checked={(item.moodleData.hasAccount.toString() === "1")}/>
                            </td>
                            <td className='text-center '>
                                <CheckItem checked={(item.moodleData.courseids.includes(that.state.moodleData.filter.course.value.toString()))}/>
                            </td>
                            <td className='text-center'>
                                <CheckItem checked={(item.moodleData.groupids.includes(that.state.moodleData.filter.group.value.toString()))}/>
                            </td>
                        </tr>
                    return result;
                })}
                    </tbody>
                </Table>
                {this.props.enrollmentList.length === 0 &&
                    <Alert variant='warning'>{i18n.get_string('nodata')}</Alert>
                }
                <hr/>
                <ButtonToolbar className='d-flex justify-content-between'>                    
                    <ButtonGroup>
                        <Button disabled={(this.state.selectionList.size === 0)} 
                            onClick={this.onCopyEmailList}>
                                <FontAwesomeIcon icon={faCopy} />{` Copier la liste de courriel`}
                        </Button>
                        <Button disabled={(this.state.selectionList.size === 0)} 
                            onClick={this.onSendEmail}>
                                <FontAwesomeIcon icon={faEnvelope} />{` Envoyer un courriel`}
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button onClick={() => this.setState({showEnrollStudents: true})} 
                            disabled={(this.state.selectionList.size === 0) || (this.state.moodleData.filter.course.value.toString() === "0")}>
                                <FontAwesomeIcon icon={faUserGraduate} />{` Inscrire les élèves`}
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar>
                
                {this.state.showEnrollStudents && 
                    <ModalEnrollStudents moodleData={this.state.moodleData} studentList={Array.from(this.state.selectionList)} onClose={this.onCloseEnrollStudents}/>
                }

            </div>    
    
        return main;
    }

    onSelect(listToSelect, state, selectAll){
        selectAll = (typeof selectAll === "undefined" ? this.state.selectAll : selectAll);

        let selectionList = this.state.selectionList;         
        
            
        for(let item of listToSelect){
            if(state){
                selectionList.add(item);
            }
            else{
                selectionList.delete(item);
            }
            
        }
        
        this.setState({selectionList: selectionList, selectAll: selectAll});
    }

    onCloseEnrollStudents(refresh){
        if((typeof refresh === "boolean") && (refresh)){
            this.props.refresh();
        }

        this.setState({showEnrollStudents: false});
    }

    onFilterChange(event){
        let moodleData = this.state.moodleData;
        
        moodleData.filter[event.target.name] = (event.target.value !== null ? event.target : {label: "", value: 0});

        if(event.target.name === 'courseId'){
            moodleData.filter.group =  {label: "", value: 0};
        } 

        this.setState({moodleData: moodleData});
    }

    onSendEmail(){
        let emailList = [];
        this.state.selectionList.forEach((value1, value2, set) => {
            emailList.push(value1.courriel)
        })

        window.location.href = `mailto:${this.props.gricsData.myProfile.courriel}?bcc=${emailList.join(",")}`;
    }

    onCreateGroup(){
        let url = `${M.cfg.wwwroot}/group/group.php?courseid=${this.state.moodleData.filter.course.value}`;
        window.open(url, '_blank').focus();
    }

    onCopyEmailList(){
        let emailList = [];
        this.state.selectionList.forEach((value1, value2, set) => {
            emailList.push(value1.courriel)
        })

        Utils.copyToClipboard(emailList.join(","))
        $glVars.feedback.showInfo(i18n.get_string('pluginname'), i18n.get_string('msgactioncompleted'), 3);
    }
}

class ModalEnrollStudents extends Component{
    static defaultProps = {        
        studentList: [],
        moodleData: null,
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

        let modalBody = 
            <div>
                <Row className='mb-3'>
                    <Col>
                        <div>Cours</div>
                        <div className='bg-light p-1'><b>{this.props.moodleData.filter.course.label}</b></div>
                    </Col>
                    {this.props.moodleData.filter.group.value.toString() !== "0" && 
                        <Col>
                            <div>Groupe</div>
                            <div className='bg-light p-1'><b>{this.props.moodleData.filter.group.label}</b></div>
                        </Col>
                    }
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
                    <span className='ml-2'>Je confirme l’inscription des étudiants à ce cours dans Moodle.</span>
                </Alert>
            </div>;

        let footer = 
            <ButtonGroup className='d-flex justify-content-end'>
                <Button style={{flex: 0}} variant='secondary'  onClick={this.props.onClose}>Annuler</Button>
                <Button disabled={!this.state.confirmed} style={{flex: 0}} variant='success' onClick={this.onApply}>Appliquer</Button>
            </ButtonGroup>;

        return <Modal title="Inscription des étudiants" style={{maxWidth: 850, width:'auto'}} body={modalBody} onClose={this.props.onClose} footer={footer}/>
    }

    onApply(){
        let that = this;

        let userIdList = [];
        for(let item of this.props.studentList){
            userIdList.push(item.moodleData.userid);
        }

        let courseId = this.props.moodleData.filter.course.value;
        let groupId = (this.props.moodleData.filter.group === null ? 0 : this.props.moodleData.filter.group.value);

        $glVars.webApi.enrollStudentList(userIdList, courseId, groupId, (result) => {    
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

/*class ModalSendMessage extends Component{
    static defaultProps = {        
        studentList: [],
        onClose: null,
    };

    constructor(props){
        super(props);

        this.onSend = this.onSend.bind(this);
        this.onDataChange = this.onDataChange.bind(this);

        this.state = {
            data: {
                subject: "",
                message: ""
            }
        };
    }

    render(){
        let studentList = this.props.studentList;

        let modalBody = 
            <div>
                <div className='mb-3'>
                    <div className='font-weight-bold'>Destinataires</div>
                    <div>
                        {studentList.map(function(item, index){
                            let result=
                                <span key={index}>
                                    <span >{item.courriel}</span>
                                    {(studentList.length > index + 1) &&  <span>{`, `}</span>}
                                </span>;

                            return result;
                        })}
                    </div>
                </div>

                <div className='mb-3'>
                    <div  className='font-weight-bold'>Sujet</div>
                    <Form.Control type='text' value={this.state.data.subject} name='subject' onChange={this.onDataChange} />
                </div>
                
                <div  className='mb-3'>
                    <div className='font-weight-bold'>Message</div>
                    <ReactQuill style={{height:'250px', marginBottom: '3rem'}} className='w-100' theme="snow" 
                                value={this.state.data.message} 
                                onChange={(value) => this.onDataChange({target: {value: value, name: 'message'}})} />
                </div>
            </div>;

        let footer = 
            <ButtonGroup className='d-flex justify-content-end'>
                <Button style={{flex: 0}} variant='secondary'  onClick={this.props.onClose}>Annuler</Button>
                <Button style={{flex: 0}} variant='success' onClick={this.onSend}>Envoyer</Button>
            </ButtonGroup>;

        return <Modal title="Inscription des étudiants" style={{maxWidth: 850, width:'auto'}} body={modalBody} onClose={this.props.onClose} footer={footer}/>
    }

    onDataChange(event){ 
        let data = this.state.data;
        data[event.target.name] = event.target.value;
        this.setState({data: data});
    }

    onSend(){
        let that = this;

        let recipientList = [];
        for(let item of this.props.studentList){
            recipientList.push(item.courriel);
        }

        $glVars.webApi.sendEmail(recipientList, this.state.data.subject, this.state.data.message, (result) => {    
            if(!result.success){
                FeedbackCtrl.instance.showError(i18n.get_string('pluginname'), result.msg);
            }
            else{
                FeedbackCtrl.instance.showInfo(i18n.get_string('pluginname'), i18n.get_string('msgactioncompleted'), 3);
            }

            that.props.onClose();
        });
    }
}*/