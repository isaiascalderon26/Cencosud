import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import moment from 'moment';
// style
import './index.less';
// assets
import calendarImg from '../../../../assets/media/challenge/calendar.svg';

export interface IStatus {
  status: boolean;
  value: string;
  actived: boolean;
}
export interface IItem {
    text: string;
    value: string;
}

export interface IStatusProps {
  onOnClick: (status?: IStatus) => void;
  isContinue?: boolean;
}

interface IState {
  selected_year?: string;
  selected_month?: string;
  selected_day?: string;
  disabled_day?: boolean;
}

export default class BirthdayUser extends React.Component<IStatusProps, IState> {
    state: IState = { 
        disabled_day: true
    }

    generateYears = (age:number): IItem[] => {
        const max = new Date().getFullYear();
        const min = max - age;
        let years: IItem[] = []

        for (var i = max; i >= min; i--) {
            years.push({ text: i.toString(), value: i.toString() })
        }
        return years;
    }

    generateMonths = (): IItem[] => {
        const months: IItem[] = [];
        months.push({ value: '01', text: '1' });
        months.push({ value: '02', text: '2' });
        months.push({ value: '03', text: '3' });
        months.push({ value: '04', text: '4' });
        months.push({ value: '05', text: '5' });
        months.push({ value: '06', text: '6' });
        months.push({ value: '07', text: '7' });
        months.push({ value: '08', text: '8' });
        months.push({ value: '09', text: '9' });
        months.push({ value: '10', text: '10' });
        months.push({ value: '11', text: '11' });
        months.push({ value: '12', text: '12' });
        return months;
    }

    generateDays = (year: string, month: string): IItem[] => {

        const days: IItem[] = [];
        const maxDays = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();
        for (let i = 1; i <= maxDays; i++) {
            days.push({ text: i.toString(), value: i.toString() })
        }
        return days;
    }

    onChangeDate = (e:any):void => {
        const value = e.detail.value;
        const type = e.target.name;
        this.setState({ [`selected_${type}`]: `${value}` });

        const { selected_year, selected_month } = this.state;
        if (selected_year && selected_month) {
            this.setState({ disabled_day: false })
        }
        const isValid = this.verifyDate();

        this.props.onOnClick(isValid);        
    }

    verifyDate = ():IStatus => {

        const { selected_year, selected_month, selected_day } = this.state;
        const birthday = `${selected_year}-${selected_month}-${selected_day}`;
        if (selected_year && selected_month  && selected_day ) {
            return { status: true, value: birthday , actived: true};
        }
        return { status: false, value: birthday, actived: true };
    }

    render() {
        
        const { selected_year, selected_month, selected_day, disabled_day} = this.state;
        const years = this.generateYears(100);
        const months = this.generateMonths();
        const days = selected_year && selected_month ? this.generateDays(selected_year,selected_month) : [];
        const options = {
            cssClass: 'custom-interface-css-class',
        };

        return (
            <div className="component-birthday-user">
                <div className={`select-component-birthday-user ${this.props.isContinue && !selected_year ? "error-component-birthday-user" : ""}`}>
                    <img src={calendarImg} alt="logo" />
                    <IonSelect interface="action-sheet" interfaceOptions={options} value={this.state.selected_year} placeholder="Año" cancelText="Cerrar" name="year" onIonChange={this.onChangeDate}>
                        {years.map((year) => (
                            <IonSelectOption key={year.text} value={year.value}>{year.text}</IonSelectOption>
                        ))}
                    </IonSelect>
                </div>
                <div className={`select-component-birthday-user ${this.props.isContinue && !selected_month ? "error-component-birthday-user" : ""}`}>
                    <IonSelect interface="action-sheet" interfaceOptions={options} value={this.state.selected_month} placeholder="Mes" cancelText="Cerrar" name="month" onIonChange={this.onChangeDate}>
                    {months.map((month) => (
                        <IonSelectOption key={month.text} value={month.value}>{month.text}</IonSelectOption>
                    ))}
                    </IonSelect>
                </div>
                <div className={`select-component-birthday-user ${this.props.isContinue && !selected_day ? "error-component-birthday-user" : ""}`}>
                    <IonSelect interface="action-sheet" interfaceOptions={options} value={this.state.selected_day} placeholder="Día" cancelText="Cerrar" name="day"  disabled={disabled_day} onIonChange={this.onChangeDate}>
                        {days.map((day) => (
                            <IonSelectOption key={day.text} value={day.value}>{day.text}</IonSelectOption>
                        ))}
                    </IonSelect>
                </div>
            </div>
        )
    }
}
