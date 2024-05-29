import { LzLocation, SdkLegRoute, SdkStepRoute } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';

export type LazarilloManeuvers =
  | 'turn-slight-left'
  | 'turn-sharp-left'
  | 'uturn-left'
  | 'turn-left'
  | 'turn-slight-right'
  | 'turn-sharp-right'
  | 'uturn-right'
  | 'turn-right'
  | 'straight'
  | 'ramp-left'
  | 'ramp-right'
  | 'merge'
  | 'fork-left'
  | 'fork-right'
  | 'ferry'
  | 'ferry-train'
  | 'roundabout-left'
  | 'roundabout-right'
  | 'arrive';

export type LocalManeuvers =
  | '?'
  | 'turn-left'
  | 'turn-slight-left'
  | 'turn-right'
  | 'turn-slight-right'
  | 'uturn-left'
  | 'uturn-right'
  | 'straight'
  | 'arrive'
  | 'elevator-up'
  | 'elevator-down'
  | 'elevator'
  | 'stairs-up'
  | 'stairs-down'
  | 'stairs';

export const maneuversMapping: Record<LazarilloManeuvers, LocalManeuvers> = {
  'turn-slight-left': 'turn-slight-left',
  'ferry-train': '?',
  'fork-left': 'turn-left',
  'fork-right': 'turn-right',
  'ramp-left': 'turn-left',
  'ramp-right': 'turn-right',
  'roundabout-left': 'turn-left',
  'roundabout-right': 'turn-right',
  'turn-left': 'turn-left',
  'turn-right': 'turn-right',
  'turn-sharp-left': 'turn-slight-left',
  'turn-sharp-right': 'turn-slight-right',
  'turn-slight-right': 'turn-slight-right',
  'uturn-left': 'uturn-left',
  'uturn-right': 'uturn-right',
  straight: 'straight',
  arrive: 'arrive',
  ferry: '?',
  merge: '?',
};

type Val = { value: number };

export type Step = SdkStepRoute;

export type Leg = SdkLegRoute;

export interface LazarilloRoute {
  data: {
    legs: Leg[];
  };
  routeId: string;
}

export interface Location {
  location: LzLocation;
}
