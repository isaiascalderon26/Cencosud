/**
 * Styles
 */
 import './index.less';

/**
 * Models
 */
import IProduct from "../../../../../../../../models/foodie/IProduct";
import IModifier from "../../../../../../../../models/foodie/IModifier";
import IModifierCategory from "../../../../../../../../models/foodie/IModifierCategory";

/**
 * Components
 */
import Section from "../section";
import RadioGroup from "../radio-group";
import Chip, { ChipTypes } from "../chip";
import CheckBoxGroup from "../checkbox-group";
import { useEffect } from 'react';


const UNIQUE_CLASS = 'vonsljbafk';

export type IModifiersGroup = {
  [modifierId: string]: {
    modifierCategory: IModifierCategory,
    products: IProduct[]
  }
};

interface IProps {
  shakeId?: string;
  selections: IModifier[];
  disabled: boolean;
  modifiersGroup: IModifiersGroup | undefined;
  onCheckModifier: (mod: IModifier) => void;
  onUncheckModifier: (mod: IModifier) => void;
  onPickPModifierFromCategory: (newMod: IModifier) => void;
}

const ModifierSection: React.FC<IProps> = ({ shakeId, selections, disabled, modifiersGroup, onCheckModifier, onUncheckModifier, onPickPModifierFromCategory }) => {

  if (!modifiersGroup) {
    return null
  }

  
  return (
    <>
      {Object.values(modifiersGroup)
        .filter(possibleModifier => possibleModifier.products.length > 0)
        .map((possibleModifier) => {
          
          const byCategory = (modifier: IModifier ) => modifier.category.id === possibleModifier.modifierCategory.id
          const shouldShake = shakeId === possibleModifier.modifierCategory.id;

          if (possibleModifier.modifierCategory.multi) {
            return (
              <ModifierProdSection cantSelected={selections.filter(byCategory).length} modCat={possibleModifier.modifierCategory} key={possibleModifier.modifierCategory.id} shake={shouldShake}>
                <CheckBoxGroup
                  maxToCheck={possibleModifier.modifierCategory.max}
                  onSelect={onCheckModifier}
                  onDeselect={onUncheckModifier}
                  options={possibleModifier.products}
                  values={selections.map(s => s.id)}
                  disabled={disabled}
                />
              </ModifierProdSection>
            )
          }
          const value = possibleModifier.products
            .find(p => {
              return selections
                .map(sel => sel.id)
                .includes(p.id)
            })?.id
          return (
            <ModifierProdSection cantSelected={selections.filter(byCategory).length} modCat={possibleModifier.modifierCategory} key={possibleModifier.modifierCategory.id} shake={shouldShake}>
              <RadioGroup
                onChangeUniqueModifierProd={onPickPModifierFromCategory}
                options={possibleModifier.products}
                value={value}
                disabled={disabled}
              />
            </ModifierProdSection>
          )
        })
      }
    </>
  )
}


const ModifierProdSection: React.FC<{ cantSelected: number, modCat: IModifierCategory, shake?: boolean }> = ({ cantSelected, children, modCat, shake}) => {

  let chipType: ChipTypes = modCat.min > 0 ? cantSelected >= modCat.min ? 'CHECKED' : 'MANDATORY' : 'OPTIONAL';
  const classStyle = `${shake && `shake-${UNIQUE_CLASS}`}`;

  return (
    <div className={classStyle}>
      <Section
        key={modCat.id}
        secondary={{
          text: modCat.name,
          cmp: <Chip type={chipType} />,
          style: {letterSpacing: '-0.05em'}
        }}
        shadowText={`Seleccione ${cantSelected}/${modCat.max}`}
        id={modCat.id}
      >
        {children}
      </Section>
    </div>
  )
}

export default ModifierSection;