import WithBootedClient from '../lib/WithBootedClient';
import RESTClient from './RESTClient';
import UserClient from './UserClient';

interface IConfig {
  baseURL: string
}

class ParkingClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async attachPlateToCurrentUser(plate: string) {
    const myInfo = await UserClient.me();

    if(!myInfo.vehicles) {
      myInfo.vehicles = [];
    }
    const alreadyRegistered = myInfo.vehicles.find((vehicle: any) => vehicle.plate === plate);
    if(alreadyRegistered) {
      return null;
    }

    const response = await this.axios.post('/vehicles/attach-vehicle', {
      "plate": plate,
      "primarysid": myInfo.primarysid,
    });

    if(!response.data) {
      return null;
    }


    return response;
  }

  async removePlate(plate: string) {
    const response = await this.axios.delete(`/vehicles/${plate}`);
    return response
  }
}

export default new ParkingClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
