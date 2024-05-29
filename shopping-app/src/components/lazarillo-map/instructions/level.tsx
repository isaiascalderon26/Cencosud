import React from 'react';
import sc from 'styled-components';

interface Props {
  level: string;
}

const Label = sc.label`
    font-weight: 600;
    font-size: 10px;
    line-height: 14px;
    background-color: #F2F2F2;
    padding: 3px;
    border-radius: 5px;
`;

function Level({ level }: Props) {
  return <Label>Nivel {level}</Label>;
}

export default Level;
