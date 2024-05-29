import React from 'react';
import { LazarilloManeuvers, LocalManeuvers, Step } from '../types';
import sc from 'styled-components';
import {
  useFromLazarilloManeuverIcon,
  useFromLocalManeuverIcon,
} from './useStepIcons';

interface Props<T> {
  maneuver: T;
}

const Icon = sc.div`
    height: 40px;
    width: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    color: white;
    font-size: 16px;
`;

export function StepIcon({ maneuver }: Props<string>) {
  const icon = useFromLazarilloManeuverIcon(maneuver);
  return <Icon>{icon}</Icon>;
}

export function FloorStepIcon({ maneuver }: Props<LocalManeuvers>) {
  const icon = useFromLocalManeuverIcon(maneuver);
  return <Icon>{icon}</Icon>;
}
