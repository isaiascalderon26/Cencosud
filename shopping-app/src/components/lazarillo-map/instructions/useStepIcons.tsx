import { LazarilloManeuvers, LocalManeuvers, maneuversMapping } from '../types';
import elevator from '../../../assets/media/map/elevator.svg';
import stairsUp from '../../../assets/media/map/mechanical-stair-up.svg';
import stairs from '../../../assets/media/map/mechanical-stair.svg';
import stairsDown from '../../../assets/media/map/mechanical-stair-down.svg';
import turnLeft from '../../../assets/media/map/turn-left.svg';
import turnRight from '../../../assets/media/map/turn-right.svg';
import turnSRight from '../../../assets/media/map/slighty-right.svg';
import turnSLeft from '../../../assets/media/map/slighty-left.svg';
import forward from '../../../assets/media/map/forward.svg';
import { IonIcon } from '@ionic/react';

const icons: Record<LocalManeuvers, any> = {
  '?': null,
  'elevator-down': elevator,
  elevator: elevator,
  'elevator-up': elevator,
  'stairs-down': stairsDown,
  'stairs-up': stairsUp,
  stairs: stairs,
  'turn-left': turnLeft,
  'turn-right': turnRight,
  'turn-slight-left': turnSLeft,
  'turn-slight-right': turnSRight,
  straight: forward,
  //todo
  'uturn-left': turnLeft,
  //todo
  'uturn-right': turnRight,
  //todo
  arrive: forward,
};

export const useFromLazarilloManeuverIcon = (maneuver: string) => {
  const icon = icons[maneuversMapping[maneuver as LazarilloManeuvers]];

  return <IonIcon icon={icon} />;
};

export const useFromLocalManeuverIcon = (maneuver: LocalManeuvers) => {
  const icon = icons[maneuver];

  return <IonIcon icon={icon} />;
};
