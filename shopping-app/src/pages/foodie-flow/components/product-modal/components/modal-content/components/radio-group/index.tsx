import { IonItem, IonLabel, IonRadio, IonRadioGroup } from "@ionic/react";

/**
 * Lib
 */
import NumberFormatter from "../../../../../../../../lib/formatters/NumberFormatter";

/**
 * Models
 */
import IProduct from "../../../../../../../../models/foodie/IProduct";
import IModifier from "../../../../../../../../models/foodie/IModifier";

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = 'bdfeuhwfeb';

interface IProps {
  options: IProduct[];
  value?: string;
  disabled: boolean;
  onChangeUniqueModifierProd: (value: IModifier) => void;
}

const RadioGroup:React.FC<IProps> = ({ options, value, disabled, onChangeUniqueModifierProd}) => {
  
  const onChange = (event:CustomEvent) => {
    const modifierProduct = options.find(opt => opt.id === event.detail.value);
    if(modifierProduct){
      onChangeUniqueModifierProd(modifierProduct);
    }
  }

  const onSelecet = ( id:string ) => {
    const modifierProduct = options.find(opt => opt.id === id);
    if(modifierProduct){
      onChangeUniqueModifierProd(modifierProduct);
    }
  }

  return(
    <IonRadioGroup value={value} onIonChange={onChange}>
      {options.map((opt, idx) => {
        const isLast = idx === options.length - 1;
        const style = `radio-${UNIQUE_CLASS} ${!isLast && 'border-bottom'} ${opt.id === value ? `radio-selected-${UNIQUE_CLASS}` : ''}`
        return (
            <div key={opt.id} className={style} onClick={() => onSelecet(opt.id)}>
              <IonRadio slot="start" value={opt.id} disabled={disabled}/>
              <IonLabel className="text-middle">{opt.name}</IonLabel>
              { opt.price > 0 && <IonLabel className='text-end'>{`+${NumberFormatter.toCurrency(opt.price)}`}</IonLabel> }
            </div>
        );
      })}
    </IonRadioGroup>
  )
}

export default RadioGroup;