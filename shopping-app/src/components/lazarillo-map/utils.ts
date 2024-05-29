import { IMallPlace, ISitePlace, MallFloor } from '../../models/how-to/place';
import { Location } from './types';

import { LazarilloRoute } from './types';

export const getFloor = (id: string, site: IMallPlace): MallFloor => {
  const floor = site.innerFloors[id];
  let name = floor.level.toString();
  if (floor.level === -1 && site.id === "-N19VjzEVIj2RDKu7i4r"){
    name = 'PB';
  }

  const textRaw = (floor.title ?? '').split(' ').pop();
  if (textRaw && textRaw.length <= 2){
    name = textRaw;
  }
  return {
    id,
    name,
    level: floor.level,
  };
};

export const getRoutingFloors = (
  {
    data: {
      legs: [{ steps }],
    },
  }: LazarilloRoute,
  site: IMallPlace
): MallFloor[] => {
  const f: MallFloor[] = [];
  const idx: Record<string, number> = {};
  for (const { end_inside_floor } of steps) {
    const endFloor = getFloor(end_inside_floor!, site);


    if (!(endFloor.id in idx)) {
      idx[endFloor.id] = f.push(endFloor) - 1;
    }
  }
  return f;
};
