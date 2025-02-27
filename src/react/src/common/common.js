import React, { Children, Component } from "react";
import {FeedbackCtrl} from "../libs/components/Feedback";
import {AppWebApi} from "./AppWebApi";
import { Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckCircle, faCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

export * from "./Options";

export const $glVars = {
    signedUser: {userId: 0, roles: []},
    feedback: new FeedbackCtrl(),
    webApi: new AppWebApi(),
    gricsApi: null,
    urlParams: {},
    appParams: {
        grics:{
            clientId: '',
            redirectUri: '',
            urlApi: '',
            urlAuthorization: '',
            urlToken: ''
        },
        workplanPluginFound: false,
        userEmail: ''
    }
}


export class Assets
{
   static mozaikBrand = require('../assets/mozaik.png');
}

export class StepButton extends Component{
    static defaultProps = { 
        checked: false,
        onClick: null,
        disabled: false,
        label: "",
        icon: null,
        img: null,
        done: false,
        children: null
    };

    render(){
        let main =  
            <ButtonGroup>
                <Button variant={(this.props.done ? 'success' : 'primary')} disabled={this.props.disabled} onClick={this.props.onClick}
                    className="">
                    {this.props.icon !== null && <FontAwesomeIcon icon={this.props.icon} />}
                    {this.props.img !== null && <img src={this.props.img} style={{maxWidth: 20}} />}
                    {this.props.label}
                </Button>
                {this.props.done && <Button disabled={this.props.disabled} variant='success'><FontAwesomeIcon icon={faCheckCircle} /></Button>}
            </ButtonGroup>
        
        return main;
    }
}

export class CheckBoxControl extends Component{
    static defaultProps = { 
        checked: false,
        onClick: null
    };

    render(){
        let main =  
            <Button style={{padding: '.5rem', borderRadius: '50%', borderWidth: '2px', width: "15px", height: "15px"}} className='m-0 d-flex justify-content-center align-items-center' 
                onClick={this.props.onClick} variant={this.props.checked ? 'link' : 'outline-secondary'}>
                {this.props.checked && <FontAwesomeIcon className="text-success" icon={faCheckCircle} />}
            </Button>
        
        return main;
    }
}

export class CheckItem extends Component{
    static defaultProps = {
        checked: false
    };

    render(){
        let main = 
            (this.props.checked ? 
            <FontAwesomeIcon className='text-success' icon={faCheck} /> 
            : 
            <FontAwesomeIcon className='text-danger' icon={faTimes} />);
        

        return main;
    }
}