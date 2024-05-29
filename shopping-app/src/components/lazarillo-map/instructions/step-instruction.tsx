import { IonIcon, IonRow } from '@ionic/react';
import React from 'react';
import { Step } from '../types';
import sc from 'styled-components';
import Level from './level';

import { useFromLazarilloManeuverIcon } from './useStepIcons';
import { location } from 'ionicons/icons';
import { IMallPlace } from '../../../models/how-to/place';
import { getFloor } from '../utils';
import { FloorStepIcon, StepIcon } from './step-icon';

interface StepInstructionProps {
  step: Step;
  site: IMallPlace;
}

const Row = sc.div`
    display: flex;
    flex-direction: column;
    gap: 15px;


    >div:first-child{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        background-color: white;

        >div:first-child {
            box-shadow: 0px 0px 5px 1px #00000014;
        }

        >div:last-child {
            display:flex;
            gap: 5px;
            flex-direction: row;
            align-items: flex-start;
            flex: 1;

            p {
                font-weight: 400;
                font-size: 14px;
                line-height: 16px;
                flex: 1;
            }
        }
    }

    >.step-instruction-metrics:last-child {
        display:flex;
        flex-direction: row;
        font-size: 14px;
        align-items: center;
        gap: 6px;
        margin-left: 50px;
    }
`;

function StepInstruction({
  step: {
    plain_instructions,
    maneuver,
    distance,
    start_inside_floor,
    end_inside_floor,
    elevator_step,
  },
  site,
}: StepInstructionProps) {
  const startFloor = getFloor(start_inside_floor!, site);
  const endFloor = getFloor(end_inside_floor!, site);
  const upstairs = startFloor.level < endFloor.level;
  return (
    <Row>
      <div style={{ paddingBottom: "10px" }}>
        {startFloor.id === endFloor.id ? (
          <StepIcon maneuver={maneuver!} />
        ) : (
          <FloorStepIcon
            maneuver={
              elevator_step
                ? upstairs
                  ? 'elevator-up'
                  : 'elevator-down'
                : upstairs
                ? 'stairs-up'
                : 'stairs-down'
            }
          />
        )}
        <div>
          <p>{plain_instructions}</p>
          <Level level={startFloor.name} />
        </div>
      </div>
      {/* <div className="step-instruction-metrics">
        <IonIcon icon={location} />
        <span>{Math.round(+distance.value.toFixed(2))} mts</span>
      </div> */}
    </Row>
  );
}

export default StepInstruction;
