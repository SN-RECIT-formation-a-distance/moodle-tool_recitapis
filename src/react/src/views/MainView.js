import React, { Component } from 'react';
import { i18n } from '../common/i18n';
import {  $glVars, Options } from '../common/common';
import { GricsCard } from './GricsView';
import { CourseEnrollmentView } from './CourseEnrollmentView';
import { WorkPlanView } from './WorkPlanView';
import { Tab, Tabs } from 'react-bootstrap';
import { JsNx } from '../libs/utils/Utils';

export class MainView extends Component {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.getMoodleEnrollments = this.getMoodleEnrollments.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
                
        this.state = {
            gricsData: {
                myProfile: null, 
                selectedGroup: {
                    label: '', 
                    value: null, 
                    data: {}
                },
            },
            enrollmentList: [],
            tab: '0'
        }
    }

    render(){     
        let main =
            <div>
                <div className='mb-3'>
                    <h1>{i18n.get_string('pluginname')}</h1>
                    <h4>Mode: {Options.isDevMode() ?  'Dev' : 'Prod'}</h4>
                </div>
                                
                <GricsCard className='mb-5' onDataChange={this.onDataChange}/>

                {this.state.gricsData.selectedGroup.value !== null &&
                    <div className='mt-3'>
                        <Tabs id="tabOptions" activeKey={this.state.tab} onSelect={(tab) => this.setState({tab: tab})}>
                            <Tab eventKey="0" title="Inscription Moodle">
                                <CourseEnrollmentView groupId={this.state.gricsData.selectedGroup.value} gricsData={this.state.gricsData} enrollmentList={this.state.enrollmentList} refresh={this.getMoodleEnrollments}/>
                            </Tab>
                            {$glVars.appParams.workplanPluginFound &&
                                <Tab eventKey="1" title="Plan de travail">
                                    <WorkPlanView groupId={this.state.gricsData.selectedGroup.value} gricsData={this.state.gricsData} enrollmentList={this.state.enrollmentList} refresh={this.getMoodleEnrollments}/>
                                </Tab> 
                            }
                        </Tabs>
                    </div> 
                }
            </div>;

        return main;
    }

    onDataChange(data){
        this.setState({gricsData: data}, this.getMoodleEnrollments);
    }

    getMoodleEnrollments(){
        let emaiList = [];
        let dataProvider = [...this.state.gricsData.myGroupMemberList];

        for(let item of dataProvider){
            emaiList.push(item.courriel);
        }

        if(emaiList.length === 0){
            return;
        }

        let that = this;
        $glVars.webApi.getMoodleEnrollments(emaiList, (result) => {    
            for(let item of dataProvider){
                item.moodleData = JsNx.getItem(result.data, 'email', item.courriel, {userid: 0, courseids: [], groupeids: [], hasAccount: 0});
                item.moodleData.courseids = item.moodleData.courseids.split(",");
                item.moodleData.groupids = item.moodleData.groupids.split(",");
            }

            that.setState({enrollmentList: dataProvider});
        });
    }
}
