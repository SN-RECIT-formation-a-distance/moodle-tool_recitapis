import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
/**************************************************************************************
 *  il ne faut pas charger le bootstrap de base car il est déjà chargé dans le thème
 * //import 'bootstrap/dist/css/bootstrap.min.css';  
 **************************************************************************************/ 
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {VisualFeedback, Loading} from "./libs/components/Components";
import Utils from "./libs/utils/Utils";
import {$glVars, Options} from "./common/common";
import "./css/style.scss";
import './css/mozaik.css';
import { MainView } from './views/MainView';

class App extends Component {
    static defaultProps = {
    };

    constructor(props) {
        super(props);

        this.onFeedback = this.onFeedback.bind(this);

        $glVars.urlParams = Utils.getUrlVars();
    }

    componentDidMount(){
        $glVars.feedback.addObserver("App", this.onFeedback);
        window.document.title = window.document.title + ' - v' + Options.appVersion();
        console.log(window.document.title);

        $glVars.gricsApi.domVisualFeedback = $glVars.webApi.domVisualFeedback;
    }

    componentWillUnmount(){
        $glVars.feedback.removeObserver("App");        
    }

    render() {
        let minHeight = '800px';
       
        let main =
            <div style={{minHeight: minHeight}}>
                <MainView/>

                {$glVars.feedback.msg.map((item, index) => {  
                    return (<VisualFeedback key={index} id={index} msg={item.msg} type={item.type} title={item.title} timeout={item.timeout}/>);                                    
                })}

                <Loading webApi={$glVars.webApi}><FontAwesomeIcon icon={faSpinner} spin/></Loading>
            </div>

        return (main);
    }

    onFeedback(){
        this.forceUpdate();
    }
}

document.addEventListener('DOMContentLoaded', function(e){     
    let domContainer = document.getElementById('recit_apis');
    if (domContainer && domContainer.childNodes.length === 0){
        const root = createRoot(domContainer);

        $glVars.appParams.grics.clientId = domContainer.getAttribute('data-grics-client-id');
        $glVars.appParams.grics.redirectUri = domContainer.getAttribute('data-grics-redirect-uri');
        $glVars.appParams.grics.urlApi = domContainer.getAttribute('data-grics-url-api');
        $glVars.appParams.grics.urlAuthorization = domContainer.getAttribute('data-grics-url-authorization');
        $glVars.appParams.grics.urlToken = domContainer.getAttribute('data-grics-url-token');
        $glVars.appParams.workplanPluginFound = (domContainer.getAttribute('data-workplan-plugin-found').toString() === "1");
        $glVars.appParams.userEmail = domContainer.getAttribute('data-user-email');
        root.render(<App />);
    }
}, false);

/*export function tool_recitapis_init_app(_, settings){
    
    console.log(_, settings);
}*/
