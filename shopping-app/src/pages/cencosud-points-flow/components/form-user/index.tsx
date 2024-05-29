import React, { Fragment, useEffect, useState } from 'react';
import moment from 'moment';
import { useIonPicker } from '@ionic/react';
// index
import './index.less';
/**
 * Assets
 */
import shapeUserImg from '../../../../assets/media/shape.png';
import rutUserImg from '../../../../assets/media/cencosud-points/form-rut.png';
import mailUserImg from '../../../../assets/media/cencosud-points/form-mail.png';
import phoneUserImg from '../../../../assets/media/cencosud-points/form-phone.png';
import calendarUserImg from '../../../../assets/media/cencosud-points/form-calendar.png';
/**
* Components
*/
import Page, { DefaultFooter, DefaultHeader } from '../../../../components/page';
import InputText from '../../../../components/input-text';
/**
 * Libs
 */
import DniFormatter from '../../../../lib/formatters/DniFormatter';
import EurekaConsole from '../../../../lib/EurekaConsole';
/**
 * Models
 * */
import { IUser } from '../../../../models/users/IUser';

type IValidation = "required" | "email" | "document" | "phone" | "min_length";

interface IProps {
    user?: IUser;
    onBack: () => void;
    onContinue: () => void;
    onData: (data: Record<string,any>) => void;
}

interface IForm {
    form: {
        submitted: boolean,
        fields: {
          [key: string]: {
            value: string;
            has_error: boolean,
            message_error: string;
          }
        }
    }
}

interface IOptions {
    text: string;
    value: string;
}

const eureka = EurekaConsole({ label: "coupons-flow" });

const FormUser: React.FC<IProps> = (props) => {

    const phoneNumberMinLength = 9;
    const validPhoneNumberFormat = /^(\+\d{2})*\d{9}$/;

    const [form, setForm] = useState<IForm>({
        form: {
            submitted: false,
            fields: {}
        }
    });

    const [present] = useIonPicker();

    useEffect(() => {
        let arrayInputs:Record<string,any> = [];
        const inputs = [
            {
                key:'firstname',
                value: props.user?.full_name.split(' ')[0] || '',
            }, 
            {
                key:'lastname',
                value: props.user?.meta_data?.lastname || '',
            }, 
            {
                key:'document_number',
                value: onFormatRutDefault(props.user?.document_number!) || '',
            }, 
            {
                key: 'email',
                value: props.user?.email || '',
            },
            { 
                key: 'phone',
                value: props.user?.phone || '',
            },
            {
                key: 'year',
                value: props.user?.meta_data?.year || '',
            },
            {
                key: 'month',
                value: props.user?.meta_data?.month || '',
            },
            {
                key: 'day',
                value: props.user?.meta_data?.day || '',
            }
            
        ];

        inputs.map((element) => {
            arrayInputs[element.key] = {
                value: element.value,
                has_error: element.value === '' || element.value === undefined ? true : false,
                message_error: ''
            }
        });

        setForm({
            form: {
                submitted: false,
                fields: {
                    ...arrayInputs
                }
            }
        });
    }, []);

    const sendForm = (): void => {

        const formUser = form?.form;
        
        let FormData = {
            ...formUser,
            ...{ submitted : true },
            fields: {
                ...formUser?.fields
            }
        };

        setForm({ form: FormData });

        let validate:boolean = false;
        for(let key in FormData.fields) {
            if(FormData.fields[key].has_error) {
               validate = true;
            }
        }
       
        if (!validate) {
            eureka.info("Success");
            props.onData(form.form.fields);
            props.onContinue();
        }
    
    }

    const validateFormat = (value: string, validation: Array<IValidation>) => {
        if(validation.includes('required') && value === '') {
            return {
                has_error: true,
                message_error: 'Campo requerido'
            };
        }

        if(validation.includes('document') && value !== '') {
            const validate = DniFormatter.isRutValid(value);

            if(!validate) {
                return {
                    has_error: true,
                    message_error: 'Rut inválido, debes ingresarlo sin puntos y con guión'
                };
            }
        }

        if(validation.includes('email') && value !== '') {
            const regex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
            if(!regex.test(value)) {
                return {
                    has_error: true,
                    message_error: 'Formato de email inválido'
                };
            }
        }

        if(validation.includes('phone') && value !== '') {
            if(value?.length < phoneNumberMinLength || !validPhoneNumberFormat.test(value)) {
                return {
                    has_error: true,
                    message_error: 'Formato de teléfono inválido (9 dígitos)'
                };
            }
        }

        if(validation.includes('min_length') && value !== '') {
            if(value?.length < 2) {
                return {
                    has_error: true,
                    message_error: 'debe tener al menos 2 caracteres'
                };
            }
        }
    }

    const onInputChangeHandler = (name: string, value: string): void => {

        let typeValidation: Array<IValidation>;

        switch(name) {
            case 'firstname':
                typeValidation = ['required', 'min_length'];
                break;
            case 'lastname':
                typeValidation = ['required', 'min_length'];
                break;
            case 'document_number':
                typeValidation = ['required', 'document'];
                break;
            case 'email':
                typeValidation = ['required', 'email'];
                break;
            case 'phone':
                typeValidation = ['required', 'phone'];
                break;
            case 'year':
                typeValidation = ['required'];
                break;
            case 'month':
                typeValidation = ['required'];
                break;
            case 'day':
                typeValidation = ['required'];
            break;
        }

        setForm({
            form: {
                submitted: false,
                fields: {
                    ...form.form.fields,
                    [name]: {
                        value,
                        has_error: validateFormat(value, typeValidation!)?.has_error || false,
                        message_error: validateFormat(value, typeValidation!)?.message_error || ''
                    }
                }
            }
        });
    }

    const onGenerateYears = ():IOptions[] => {
        const currentYear = new Date().getFullYear() - 18;
        const startYeart = currentYear - 100;
    
        let listYears = [];

        for (let i = startYeart; i <= currentYear; i++) {
            let item = {
                text:i.toString(),
                value:i.toString()
            }
            listYears.push(item);
        }

        //order by listYears desc 
        listYears.sort((a, b) => {
            return parseInt(b.value) - parseInt(a.value);
        });

        return listYears;
    }

    const onGenerateDays = (year: string, month:string):IOptions[] => {
        let listDays = [];
        if(year && month) {
            const days = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();
            for(let i = 1; i <= days; i++) {
                let item = {
                    text: i.toString(),
                    value:i.toString()
                }
                listDays.push(item);
            }
        }
        return listDays;
    }

    const isAppleRelay = (email?:string):boolean => {
        const domain = "@privaterelay.appleid.com";
        return email!.includes(domain);
    }

    const onFormatRutDefault = (rut:string):string => {
        let clean =  rut.replace(/\.|-/g, '');
        const length_string = clean.length;
        const first = clean.substring(0, length_string - 1);
        const end = clean.substring(length_string - 1, length_string);
        return `${first}-${end}`;
    }

    return (
        <Page 
            header={<DefaultHeader onBack={() => props.onBack() } />}
            content={
                <Fragment>
                    <div className="component-form-user">
                        <div className="form-user-title">
                            <h1>Necesitamos que completes tus datos</h1>
                        </div>
                        <div className="form-user-subtitle">
                            <h3>Completa los datos requeridos para poder finalizar el registro.</h3>
                        </div>
                        <div className="form-user-content">
                            <div className="input-field">
                                <InputText
                                    name="firstname"
                                    placeholder='Nombre'
                                    icon={shapeUserImg}
                                    onValueChange={(value:string) => {
                                        onInputChangeHandler('firstname', value)
                                    }}
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.firstname?.value, ["required", "min_length"])?.has_error && form.form.submitted 
                                        ? validateFormat(form.form.fields.firstname?.value, ["required", "min_length"])?.message_error 
                                        : ''
                                    }
                                    defaultValue={props.user?.full_name.split(' ')[0]}
                                />
                            </div>
                            <div className="input-field">
                                <InputText
                                    name="lastname"
                                    placeholder='Apellido'
                                    icon={shapeUserImg}
                                    onValueChange={(value:string) => {
                                        onInputChangeHandler('lastname', value)
                                    }}
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.lastname?.value, ["required", "min_length"])?.has_error && form.form.submitted 
                                        ? validateFormat(form.form.fields.lastname?.value, ["required", "min_length"])?.message_error 
                                        : ''
                                    }
                                    defaultValue={props.user?.meta_data?.lastname || ''}
                                />
                            </div>
                            <div className="input-field">
                                <InputText
                                    name="document_number"
                                    placeholder='Rut'
                                    icon={rutUserImg}
                                    onValueChange={(value:string) => {
                                        onInputChangeHandler('document_number', value)
                                    }}
                                    disabled={props.user?.document_number ? true : false}
                                    error={
                                        validateFormat(form.form.fields.document_number?.value, ["required", "document"])?.has_error && form.form.submitted 
                                        ? validateFormat(form.form.fields.document_number?.value, ["required", "document"])?.message_error 
                                        : ''
                                    }
                                    defaultValue={onFormatRutDefault(props.user?.document_number!)}
                                />
                            </div>
                            <div className="input-field">
                                <InputText
                                    name="email"
                                    placeholder='Email'
                                    icon={mailUserImg}
                                    onValueChange={(value:string) => {
                                        onInputChangeHandler('email', value)
                                    }}
                                    disabled={isAppleRelay(props.user?.email) ? false : true}
                                    error={
                                        validateFormat(form.form.fields.email?.value, ["required", "email"])?.has_error && form.form.submitted 
                                        ? validateFormat(form.form.fields.email?.value, ["required", "email"])?.message_error 
                                        : ''
                                    }
                                    defaultValue={isAppleRelay(props.user?.email) ? '' : props.user?.email}
                                />
                            </div>
                            <div className="input-field">
                                <InputText
                                    type='number'
                                    name="phone"
                                    placeholder='Teléfono (912345678)'
                                    icon={phoneUserImg}
                                    onValueChange={(value:string) => {
                                        onInputChangeHandler('phone', value)
                                    }}
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.phone?.value, ["required", "phone"])?.has_error && form.form.submitted
                                        ? validateFormat(form.form.fields.phone?.value, ["required", "phone"])?.message_error
                                        : ''
                                    }
                                    defaultValue={props.user?.phone || form.form.fields.phone?.value}
                                />
                            </div>
                            <div className="input-field calendar">
                                <InputText
                                    name="year"
                                    placeholder='Año'
                                    icon={calendarUserImg}
                                    disabled={false}
                                    cssClass="year-calendar"
                                    error={
                                        validateFormat(form.form.fields.year?.value, ["required"])?.has_error && form.form.submitted
                                        ? 'Año'
                                        : ''
                                    }
                                    onClick={() => {
                                        present({
                                            cssClass: 'calendar-modal',
                                            buttons: [
                                              {
                                                text: 'Confirmar',
                                                handler: (selected) => {
                                                    const year = selected.year.value;
                                                    setForm({
                                                        form: {
                                                            submitted: false,
                                                            fields: {
                                                                ...form.form.fields,
                                                                year: {
                                                                    value: year,
                                                                    has_error: false,
                                                                    message_error: ''
                                                                    }
                                                            }
                                                        }
                                                    })
                                                },
                                              },
                                            ],
                                            columns: [
                                              {
                                                name: 'year',
                                                options: onGenerateYears()
                                              },
                                            ],
                                          });
                                    }}
                                    defaultValue={form.form.fields.year?.value}
                                />
                                <InputText
                                    name="month"
                                    placeholder='Mes'
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.month?.value, ["required"])?.has_error && form.form.submitted
                                        ? 'Mes'
                                        : ''
                                    }
                                    onClick={() => {
                                        present({
                                            cssClass: 'calendar-modal',
                                            buttons: [
                                              {
                                                text: 'Confirmar',
                                                handler: (selected) => {
                                                    const month = selected.month.value;
                                                    setForm({
                                                        form: {
                                                            submitted: false,
                                                            fields: {
                                                                ...form.form.fields,
                                                                month: {
                                                                    value: month,
                                                                    has_error: false,
                                                                    message_error: ''
                                                                    }
                                                            }
                                                        }
                                                    })
                                                },
                                              },
                                            ],
                                            columns: [
                                              {
                                                name: 'month',
                                                options: [
                                                    {text: 'Enero', value: '01'},
                                                    {text: 'Febrero', value: '02'},
                                                    {text: 'Marzo', value: '03'},
                                                    {text: 'Abril', value: '04'},
                                                    {text: 'Mayo', value: '05'},
                                                    {text: 'Junio', value: '06'},
                                                    {text: 'Julio', value: '07'},
                                                    {text: 'Agosto', value: '08'},
                                                    {text: 'Septiembre', value: '09'},
                                                    {text: 'Octubre', value: '10'},
                                                    {text: 'Noviembre', value: '11'},
                                                    {text: 'Diciembre', value: '12'}
                                                ]
                                              },
                                            ],
                                          });
                                    }}
                                    defaultValue={form.form.fields.month?.value}
                                />
                                <InputText
                                    name="day"
                                    placeholder='Día'
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.day?.value, ["required"])?.has_error && form.form.submitted
                                        ? 'Día'
                                        : ''
                                    }
                                    onClick={() => {
                                        present({
                                            cssClass: 'calendar-modal',
                                            buttons: [
                                              {
                                                text: 'Confirmar',
                                                handler: (selected) => {
                                                    const day = selected.day.value;
                                                    setForm({
                                                        form: {
                                                            submitted: false,
                                                            fields: {
                                                                ...form.form.fields,
                                                                day: {
                                                                    value: day,
                                                                    has_error: false,
                                                                    message_error: ''
                                                                }
                                                            }
                                                        }
                                                    })
                                                },
                                              },
                                            ],
                                            columns: [
                                              {
                                                name: 'day',
                                                options: onGenerateDays(form.form.fields.year?.value, form.form.fields.month?.value)
                                              },
                                            ],
                                          });
                                    }}
                                    defaultValue={form.form.fields.day?.value}
                                />
                            </div>
                        </div>
                    </div>
                </Fragment>
            }
            footer={
                <DefaultFooter 
                    mainActionText='Continuar'
                    onClickMainAction={sendForm}
                />
            }
        />
    );
}

export default FormUser;