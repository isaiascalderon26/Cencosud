import React from "react";
import { IonCheckbox, IonItem, IonLabel } from "@ionic/react";

/**
 * Lib
 */
import NumberFormatter from '../../../../../../../../lib/formatters/NumberFormatter';

/**
 * Models
 */
import IProduct from "../../../../../../../../models/foodie/IProduct";
import IModifier from "../../../../../../../../models/foodie/IModifier";

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = 'lpdhkfmeor';

interface IProps {
  maxToCheck?: number,
  options: IProduct[],
  values: string[],
  disabled: boolean,
  onSelect: (value: IModifier) => void;
  onDeselect: (value: IModifier) => void;
}

const CheckBoxGroup: React.FC<IProps> = ({ maxToCheck, options, disabled, values, onSelect, onDeselect }) => {

  const onCheckClick = (opt: IProduct) => {

    if (values.includes(opt.id)) {
      onDeselect(opt);
    } else {
      const byProductsArray = (id: string) => options.map(p => p.id).includes(id);
      if (maxToCheck && maxToCheck > values.filter(byProductsArray).length) {
        onSelect(opt);
      } else if (!maxToCheck) {
        onSelect(opt);
      }
    }
  }

  return (
    <>
      {options.map((opt, idx) => {
        const isLast = idx === options.length - 1;
        const style = `check-${UNIQUE_CLASS} ${!isLast && 'border-bottom'} ${values && values.includes(opt.id) ? `check-selected-${UNIQUE_CLASS}` : ''}`
        return (
          <div className={style} key={opt.id} onClick={() => onCheckClick(opt)}>
            <IonCheckbox
              slot="start"
              value={opt.id}
              checked={values && values.includes(opt.id)}
              disabled={disabled}
            />
            <IonLabel className="text-middle">{opt.name}</IonLabel>
            {opt.price > 0 && <IonLabel className='text-end'>{`+${NumberFormatter.toCurrency(opt.price)}`}</IonLabel>}
          </div>
        )
      })}
    </>
  )
}

export default CheckBoxGroup;