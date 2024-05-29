import { IonCol, IonRow } from '@ionic/react';
import React from 'react';
import { IMerchant } from '../../../models/merchants/IMerchant';
import { i18nFactory } from '../../i18n';
import localize from '../locale';
import PlaceIcon from './place-icon';
import sc from 'styled-components';

import { ISite } from '../../../models/store-data-models/ISite';
import Level from './level';

const I18 = i18nFactory(localize);

interface Props {
  start?: boolean;
  merchant: IMerchant;
  site: ISite;
}

const Instruction = sc.div`    
    z-index: 9999;
    
    >div:first-child {
        display: flex;
        gap: 12px;
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;

        >div:first-child {

        }

        >div:nth-child(2) {
            display: flex;
            flex-direction: column;
            gap: 3px;
            flex-grow: 1;
            flex-basis: 0;  

            >div:first-child {        
                font-weight: 700;
                font-size: 16px;
                line-height: 16px;

            }

            >div:last-child {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 3px;
                

                p {
                    font-weight: 300;
                    font-size: 14px;
                    line-height: 14px;
                }

                
            }
        }

        >.logo {
            height: 50px;
            width: 50px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            border: 0.5px solid #0000004D;
            border-radius: 50%;
            overflow: hidden;

            img {
                //padding: 2px;                
            }
        }
    }

    >div:last-child {
        >img {
            width:100%;
            height: 125px;
            border-radius: 10px;
            margin: 10px 0;
        }

    }
`;

const Icon = sc.div`
    width: fit-content;
`;

function PlaceInstruction({ start = true, merchant, site }: Props) {
  let image = merchant.photo.split(',');

  return (
    <Instruction>
      <div>
        <div>
          <PlaceIcon />
        </div>
        <div>
          <I18 id={start ? 'ROUTE_START' : 'ROUTE_END'} />
          <div>
            <p>{merchant.name}</p>
            <Level level={merchant.level[0]} />
          </div>
        </div>
        {start && (
          <div className="logo">
            <img src={`${site?.web}${merchant.logo}`} />
          </div>
        )}
      </div>
      {!start && image[0] && (
        <div>
          <img src={`${site?.web}${image[0]}`} />
        </div>
      )}
    </Instruction>
  );
}

export default PlaceInstruction;
