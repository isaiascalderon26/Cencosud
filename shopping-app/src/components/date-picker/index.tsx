import React, { FC, useEffect, useRef, useState } from 'react'
import SelectInput from '../select-input'
import ImageCalendar from '../../assets/media/scheduling/calendar.svg';
import { useIonPicker } from '@ionic/react';
import './index.less'
import moment, { Moment } from 'moment';

interface IPresenterItem {
    text: string,
    value: string | number
}

type BuilderType = 'year' | 'month' | 'day';

const defaultMonths = [
    {
        text: 'ENE',
        value: 'ENE'
    },
    {
        text: 'FEB',
        value: 'FEB'
    },
    {
        text: 'MAR',
        value: 'MAR'
    },
    {
        text: 'ABR',
        value: 'ABR'
    },
    {
        text: 'MAY',
        value: 'MAY'
    },
    {
        text: 'JUN',
        value: 'JUN'
    },
    {
        text: 'JUL',
        value: 'JUL'
    },
    {
        text: 'AGO',
        value: 'AGO'
    },
    {
        text: 'SEP',
        value: 'SEP'
    },
    {
        text: 'OCT',
        value: 'OCT'
    },
    {
        text: 'NOV',
        value: 'NOV'
    },
    {
        text: 'DIC',
        value: 'DIC'
    }
]
interface DatePickerProps {

    maxDate?: Moment;
    onChange?: (date: Date | null) => void
}

const DatePicker: FC<DatePickerProps> = ({
    maxDate,
    onChange
}) => {

    const [present] = useIonPicker();

    const [dateObject, setDateObject] = useState<Record<BuilderType, any>>({
        year: null,
        month: null,
        day: null,
    })

    const selectedIndexRef = useRef<Record<BuilderType, number>>({
        year: 0,
        month: 0,
        day: 0,
    });

    const currentValuesRef = useRef<IPresenterItem[]>([]);

    const ItemsBuilder: Record<BuilderType, Function> = {
        year: function (endYearOffset = 0): IPresenterItem[] {

            const startOffsetYears = 80;

            const now = maxDate ? new Date(maxDate?.format("YYYY-MM-DD")) : new Date();

            const year = now.getFullYear() - endYearOffset;

            const startYear = year - startOffsetYears; // last 100 years

            const values = Array(startOffsetYears + 1).fill(1).map((n, index) => ({
                text: String(startYear + index),
                value: startYear + index
            })).reverse();

            currentValuesRef.current = values;

            return values;

        },
        month: function (): IPresenterItem[] {
            currentValuesRef.current = defaultMonths;

            return defaultMonths;
        },
        day: function (): IPresenterItem[] {
            const monthIndex = defaultMonths.findIndex((m) => m.value === dateObject.month.value) + 1;

            const daysInMonth = moment(`${dateObject.year.value}-${monthIndex <= 9 ? '0' + monthIndex : monthIndex}`, "YYY-MM").daysInMonth();

            const values = Array(daysInMonth).fill(1).map((d, index) => ({
                text: String(index + 1),
                value: index + 1
            }));

            currentValuesRef.current = values;

            return values;
        }
    }

    const getLastSelectedIndex = (type: BuilderType = "year"): number => {
        return selectedIndexRef.current[type]

    }

    const showSelector = async (type: BuilderType = "year", param?: any) => {

        present({
            cssClass: 'select-modal-opigf009',
            buttons: [
                {
                    text: 'Selecionar',
                    handler: (value: any) => {

                        selectedIndexRef.current[type] = currentValuesRef.current.findIndex((item) => item.value === value[type].value);

                        const result = { ...dateObject, ...value }
                        if (value.year) {
                            setDateObject(value)
                        } else {
                            if (value.month) {
                                delete result.day;
                            }
                            setDateObject(result)
                        }
                    }
                }
            ],
            columns: [
                {
                    name: type,
                    selectedIndex: getLastSelectedIndex(type),
                    options: ItemsBuilder[type].call(null, param)
                }
            ]
        });

    }

    useEffect(() => {
        if (dateObject.day && dateObject.month && dateObject.year) {
            const monthIndex = defaultMonths.findIndex((m) => m.value === dateObject.month.value) + 1;
            onChange?.(new Date(`${dateObject.year.value}-${monthIndex}-${dateObject.day.value}`))
        } else onChange?.(null);
    }, [dateObject])

    return (
        <div className='csx-date-picker'>
            <SelectInput
                cssClass="csx-date-picker-selector-input csx-date-picker-selector-input--year"
                icon={ImageCalendar}
                placeholder="Año"
                text={dateObject.year?.text}
                onClick={() => showSelector('year')}
            />
            <SelectInput
                cssClass="csx-date-picker-selector-input"
                disabled={!dateObject.year}
                placeholder="Mes"
                text={dateObject.month?.text}
                onClick={() => showSelector('month')}
            />
            <SelectInput
                cssClass="csx-date-picker-selector-input"
                disabled={!dateObject.month}
                text={dateObject.day?.text}
                placeholder="Dia"
                onClick={() => showSelector('day')}
            />
        </div>
    )
}

export default DatePicker