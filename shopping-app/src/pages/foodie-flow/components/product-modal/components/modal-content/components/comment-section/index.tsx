import React from 'react';
import { IonTextarea } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Components
 */
import Section from '../section';

const UNIQUE_CLASS = 'nslikvxkpi';

const getStrQty = (text: string|undefined): string => {
  
  if(text !== undefined){
    const size = text.length;
    if(size <= 9) {
      return `0${size}`;
    } else {
      return `${size}`;
    }
  }
  return '00';
}

interface IProps {
  value?: string;
  setValue: (value: string) => void;
  disabled: boolean;
}

const CommentSection: React.FC<IProps> = ({value, setValue, disabled}) => {

  return (
    <Section
      secondary={{
        text: 'Comentarios',
        cmp: (<div className={`char-count-${UNIQUE_CLASS}`}>{`${getStrQty(value)}/140`}</div>),
      }}
      shadowText='Añade instrucciones y/o comentarios. El restaurante hará lo posible por cumplirlas'
    >
      <textarea 
        className={`comment-${UNIQUE_CLASS}`}
        placeholder="Escribe aquí"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={140}
        rows={4}
        disabled={disabled}
      />
    </Section>
  );
}

export default CommentSection;