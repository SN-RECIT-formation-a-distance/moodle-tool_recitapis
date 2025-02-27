import React, { Component } from 'react';
import Select from 'react-select'

export class ComboBoxPlus extends Component {
    static defaultProps = {        
        onChange: null,    
        value: "",
        name: "",
        disabled: false,
        isMulti: false,
        required: false,
        data: {},
        size: 1,
        placeholder: "",
        options: [],
        className: '',
        selectedIndex: -1
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
    }
    
    render() { 
        //  spread attributes <div {...this.props}>    
        let spreadAttr = {
            required: this.props.required, 
            size: this.props.size, 
            options: this.props.options,
            isMulti: this.props.isMulti,
            isClearable: true,
            isSearchable: true
        };

        let options = this.props.options;

        let val = null;
        let propValue = this.props.value || "";
        for (let o of options){
            if (o.value.toString() === propValue.toString()){
                val = o;
            }
        }

        let main = 
            <Select className={this.props.className} isDisabled={this.props.disabled} {...spreadAttr} onChange={this.onChange} value={val} placeholder={this.props.placeholder}>
            </Select>;            
        return (main);
    }   
    
    onChange(event){
        // clear combo box
        if(event === null){
            this.props.onChange({target:{name: this.props.name, value: null, label: "", data: null}});
            return;
        }
        
        let value = event.value || "";
        
        if (this.props.multiple){
            value = event;
        }

        this.props.onChange({target:{name: this.props.name, value: value, label: event.label, data: event.data || {}}});
    }   
}
 