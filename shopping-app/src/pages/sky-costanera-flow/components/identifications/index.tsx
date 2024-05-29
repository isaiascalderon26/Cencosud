import React, { Fragment } from 'react';
import {
  IonButton, IonContent, IonFooter,
} from '@ionic/react';
// index
import './index.less';
//assets
import ShapeUser from '../../../../assets/media/shape.png';
import ShapeUserWhite from '../../../../assets/media/shape-white.png';
import DniFormatter from '../../../../lib/formatters/DniFormatter';
import SeparationLine from '../separation-line';

interface IProps {
    quantity_adults: number;
    goSend: () => void;
    global_flag_validation?: boolean; //disabled validation for endpoint
    document_number?: string; // of the logged in user
    users_add:(data:any) => void;
}

interface IForm {
    form: {
        submitted: boolean,
        fields: {
          [key: string]: {
            value: string;
            has_error: boolean,
            type: string;
            has_type_error: boolean;
            has_format_error:boolean;
          }
        }
    }
}

interface IState {
    form_dinamic?: IForm;  
    style_mode_dark: boolean;
    show_separator_line: boolean;
}

export default class Identifications extends React.Component<IProps, IState> {
    state: IState = {
        form_dinamic: undefined,
        style_mode_dark: false,
        show_separator_line: true
    }

    clearRut = (value?:string) => {
        return value?.split('-').join('').split('.').join('');
    };

    validateFormat = (type_value:string, value:string) => {
        if(type_value === 'document_number') {
            const isValid = DniFormatter.isRutValid(value);
            const equals = this.clearRut(this.props.document_number) === this.clearRut(value);
            
            return isValid && !equals ? false : true;
        }
        if(type_value === 'passport') {
            return value.length > 3 ? false : true;
        }
    }

    componentDidMount() {
        
        let myform = {
            form: {
                submitted: false,
                fields: {}
            }
        }

        for (let i = 0; i < this.props.quantity_adults; i++) {
            myform = {
                ...myform, 
                form: {
                ...myform.form,
                    fields: {
                        ...myform.form.fields, 
                        [`adulto${i+2}`]: {
                            value: '', 
                            has_error: !this.props.global_flag_validation ? false : true,
                            type: '',
                            has_type_error: !this.props.global_flag_validation ? false : true,
                            has_format_error: !this.props.global_flag_validation ? false : true
                        }
                    }
                }
            };  
        }

        const formStruct = myform as IForm;
        this.setState({ form_dinamic: formStruct });
    }

    onInputChangeHandler = async (position: number, value: string) => {
        const { form_dinamic } = this.state;
        const form  = form_dinamic?.form;

        let newForm = {
            ...form, 
            ...{ submitted : false },
            fields: {
                ...form?.fields,
                [`adulto${position}`]: {
                    value: value, 
                    has_error: false,
                    type: form?.fields[`adulto${position}`]?.type || '',
                    has_type_error: form?.fields[`adulto${position}`]?.has_type_error || false,
                    has_format_error: this.validateFormat(form?.fields[`adulto${position}`]?.type || '', value) ? true : false
                }
            }
        }

        this.setState({ form_dinamic: { form: newForm } });
    }

    onInputRadioChangeHandler = async (position: number, value: string) => {
        const { form_dinamic } = this.state;
        const form  = form_dinamic?.form;

        let newForm = {
            ...form, 
            ...{ submitted : false },
            fields: {
                ...form?.fields,
                [`adulto${position}`]: {
                    value: form?.fields[`adulto${position}`]?.value || '', 
                    has_error: form?.fields[`adulto${position}`]?.has_error || false,
                    type: value,
                    has_type_error: false,
                    has_format_error: this.validateFormat(value, form?.fields[`adulto${position}`]?.value || '') ? true : false

                }
            }
        }

        this.setState({ form_dinamic: { form: newForm } });
    }

    send = () => {
        const { form_dinamic } = this.state;
        const form  = form_dinamic?.form;
        
        let FormData = {
            ...form,
            ...{ submitted : true },
            fields: {
                ...form?.fields,
            }
        }

        this.setState({ form_dinamic: { form: FormData } });

        let validate = true;
        for(let key in FormData.fields) {
            if(FormData.fields[key].has_error || FormData.fields[key].has_type_error || FormData.fields[key].has_format_error) {
               validate = false;
            }
        }

        if(validate) {
            const data = form?.fields;
            let newArray = [];
            for(let key in data) {
                newArray.push({ document_number: this.clearRut(data[key].value), document_type: data[key].type});
            }
            this.props.users_add(newArray);

            setTimeout(() => {
                this.props.goSend();
              }, 1000);
            
        }

    }
    render() {
        const { form_dinamic } = this.state;
        const form  = form_dinamic?.form;
        const text_placeholder_dni = '19803889-k';
        const text_placeholder_passport = 'PB8038890';
        const error_message_empty = 'Este campo es obligatorio';
        const error_message_dni = 'Rut inválido o ya registrado en la cuenta';
        const error_message_passport = 'El pasaporte debe tener más de 3 caracteres';
        const style_mode_dark = this.state.style_mode_dark;
        return (
            <Fragment>
                <IonContent>
                    <div className="header-identifications">
                        <h2>Antes de finalizar, ingresa el documento de identificación de tus acompañantes.</h2>
                        <p>Por protocolos de seguridad es necesario registrar a los acompañantes adultos.</p>
                    </div>
                    <div className="identification-component">
                        {[...Array(this.props.quantity_adults)].map((item:any, i:number) => {
                            const index = i+2;
                            return (
                                <Fragment>
                                    <div className="checkboxes" key={`check-${index}`}>
                                        <div className="box-checkbox">
                                            <input 
                                                type='radio' 
                                                id={`rut-${index}`} 
                                                name={`identification-type-${index}`}  
                                                value="document_number" 
                                                onChange={e => this.onInputRadioChangeHandler(index, e.currentTarget.value)} 
                                                className={form?.fields[`adulto${index}`]?.has_type_error && form?.submitted  ? 'error' : 'normal'}
                                            />
                                            <label htmlFor={`rut-${index}`}>RUT</label>
                                        </div>
                                        <div className="box-checkbox">
                                            <input 
                                                type='radio' 
                                                id={`pasaporte-${index}`} 
                                                name={`identification-type-${index}`}
                                                value="passport"
                                                onChange={e => this.onInputRadioChangeHandler(index, e.currentTarget.value)}
                                                className={form?.fields[`adulto${index}`]?.has_type_error && form?.submitted  ? 'error' : 'normal'}
                                            />
                                            <label htmlFor={`pasaporte-${index}`}>Pasaporte</label>
                                        </div>
                                    </div>
                                    <div className="input-container" key={`input-${index}`} style={{ border: (form?.fields[`adulto${index}`]?.has_error || form?.fields[`adulto${index}`]?.has_format_error )  && form?.submitted ? '1px solid red' : '1px solid #ccc' }}>
                                        { style_mode_dark ? <img src={ShapeUserWhite} /> :<img src={ShapeUser} /> }
                                        <input 
                                            key={`input-${index}`}
                                            type="text"
                                            placeholder={
                                                form?.fields[`adulto${index}`]?.type === "document_number" ? text_placeholder_dni : 
                                                form?.fields[`adulto${index}`]?.type === "passport" ? text_placeholder_passport : `Identificador Adulto ${index}`
                                            } 
                                            onChange={e => this.onInputChangeHandler(index, e.currentTarget.value)}

                                            onFocus={()=>{this.setState({show_separator_line: false})}}

                                            onBlur={()=>{this.setState({show_separator_line: true})}}
                                        />
                                    </div>
                                    <div className="error-message">
                                        {form?.fields[`adulto${index}`]?.has_error && form_dinamic?.form.submitted ? error_message_empty : 
                                        (form?.fields[`adulto${index}`]?.type === "document_number" && form?.fields[`adulto${index}`].has_format_error && form_dinamic?.form.submitted ) ? error_message_dni :
                                        (form?.fields[`adulto${index}`]?.type === "passport" && form?.fields[`adulto${index}`].has_format_error && form_dinamic?.form.submitted) ? error_message_passport : null}
                                    </div>
                                </Fragment>
                            )
                        })}
                    </div>
                </IonContent>
                <IonFooter>
                    {this.state.show_separator_line && <SeparationLine marginTop="68px" marginBottom="33px" darkBackground="#000000" background="#FFFFFF" height="8px"/>}
                    <div className='pad-buttons'>
                        <IonButton className='white-centered' onClick={this.send}>
                            Continuar
                        </IonButton>
                    </div>
                </IonFooter>
            </Fragment>
        )
    }
}