import React from "react";
import GoogleMapReact from 'google-map-react';
import Market from '../../assets/media/market.png'

const AnyReactComponent = ({market}: any) => 
  <div>
    {market}
  </div>;

export default class Map extends React.Component {
    render() {
      const center = {lat:-33.41799043636642, lng:-70.60630076290002}
      const zoom = 15;
        return (
            <div style={{ height: '184px', width: '100%' }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: '' }}
              defaultCenter={center}
              defaultZoom={zoom}
            >
              <AnyReactComponent
                lat={-33.41799043636642}
                lng={-70.60630076290002}
                market={<img style={{width: '45px'}} src={Market} />}
              />
            </GoogleMapReact>
          </div>
        );
    }
}