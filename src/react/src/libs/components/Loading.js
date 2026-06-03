import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { $glVars } from '../../common/common';

export class Loading extends Component{
    static defaultProps = {
        webApi: null,
        children: null
    };

    constructor(props){
        super(props);

        this.onAbort = this.onAbort.bind(this);

        this.domRef = React.createRef();

        this.state = {timeout: 0, elapsedTime: 0};

        // Dedicated mount point so we can re-order it in <body> without touching
        // nodes React owns internally.
        this._mountPoint = document.createElement('div');
    }

    renderChildren() {        
        return React.Children.map(this.props.children, (child, index) => {
            if(child === null){ return (null); }

            return React.cloneElement(child, {
                className: "Img"
            });
        });
    }

    componentDidMount(){
        document.body.appendChild(this._mountPoint);

        if(this.props.webApi === null){ return; }

        this.props.webApi.domVisualFeedback = this.domRef.current;

        const that = this;
        let intervalId = 0;
        const observer = new MutationObserver(() => {
            // Loader became visible
            if (window.getComputedStyle(that.domRef.current).display !== 'none') {
                // Re-append moves the mount point to the end of <body>, placing it
                // above any Bootstrap modals that were added after initial mount.
                document.body.appendChild(that._mountPoint);

                let timeout = parseInt(that.domRef.current.dataset.timeout) || 0;

                if(timeout > 0){
                    that.setState({timeout: timeout, elapsedTime: timeout});
                }

                intervalId = window.setInterval(() => {
                    that.setState({elapsedTime: that.state.elapsedTime - 1});
                }, 1000);
            }
            else{
                window.clearTimeout(intervalId);
            }
        });

        observer.observe(this.domRef.current, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    componentWillUnmount(){
        if (document.body.contains(this._mountPoint)) {
            document.body.removeChild(this._mountPoint);
        }
    }

    render(){
        let main =
            <div ref={this.domRef} className="Loading">
                <div className='overlay'></div>
                <div className='content p-2 rounded'>
                    {this.renderChildren()}                    
                </div>
            </div>;

        /*<br/>
            <Button variant="link" className='text-white' style={{fontSize: '12px'}} onClick={this.onAbort}>Annuler la requête</Button>                            
        */

        return ReactDOM.createPortal(main, this._mountPoint);
    }

    onAbort(){
        $glVars.webApi.abort();
    }
}