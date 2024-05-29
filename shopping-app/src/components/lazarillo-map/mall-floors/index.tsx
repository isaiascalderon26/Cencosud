import React from 'react';
import sc from 'styled-components';
import { MallFloor } from '../../../models/how-to/place';
import {Browser} from "leaflet";
import win = Browser.win;

interface Props {
  floors: MallFloor[];
  value: string;
  onChange?: (id: string) => void;
  routingFloors?: MallFloor[];
}

const Body = sc.div<{ selected_floor: number }>`
  position: absolute;
  bottom: 0;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
height: 100%;
  >.floors {
    position: absolute;
    right: 5px;
    transform: translateY(-50%);
    font-size: 14px;
    background-color: white;
    padding: 3px;
    display:flex;
    flex-direction: column;
    gap: 16px;
    border-radius: 100px;
    align-items: center;
    width: 34px;
    visibility: visible;
    z-index: 4;

    >.selected-floor {
      position: absolute;
      left: 50%;
      width: 40px;
      height: 40px;
      top: 0px;
      transform: translate(-50%, ${({ selected_floor }) =>
        `${selected_floor * 100}%`});
      color: white;
      display:flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      border-radius: 50px;
      padding: 5px;
      transition: transform 0.3s;
      background: linear-gradient(#CE57D3,#9454E5,#6A6CE9,#47BAD8);

      >div:first-child {
        background-color: black;
        width: 35px;
        height: 35px;
        position: absolute;
        border-radius: 50px;
        display:flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        span {
          font-weight: 600;
          font-size: 16px;
          line-height: 16px;
        }
      }
    }

    >.floor {
      padding: 5px;
      width:25px;
      height:25px;
      display:flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      span {
        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
      }
    }

    >.floor-deactivated {
      padding: 5px;
      width:25px;
      height:25px;
      display:flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      span {
        font-weight: 600;
        font-size: 14px;
        color: #C5C3C3;
        line-height: 14px;
      }
    }
  }
`;

function MallFloors({ floors, value, routingFloors, onChange }: Props) {
  const floorsUsed = routingFloors ?? floors;
  const v = floors.find(({ id }) => id == value)?.name;
  const i = floors.findIndex(({ id }) => id == value);

  return (
    <Body selected_floor={i}>
      <div className="floors" style={{bottom: routingFloors === undefined ? "35%" : "10%"}}>
        {v && (
          <div className="selected-floor">
            <div>
              <span>{v}</span>
            </div>
          </div>
        )}
        {floors.map(({ name, id }) => {
          const isRoutingFloor = floorsUsed.some((floor) => floor.id === id);
          const className = isRoutingFloor ? 'floor' : 'floor-deactivated';
          return (
          <div
            key={id}
            data-selected-floor={id === value}
            className={className}
            onClick={() => {
              if (isRoutingFloor && id !== value) {
                onChange && onChange(id);
              }
            }}
          >
            <span>{name}</span>
          </div>
        )
          })}
      </div>
    </Body>
  );
}

export default MallFloors;
