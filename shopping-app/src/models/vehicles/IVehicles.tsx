export default interface IVehicle {
    id: string,
    plate: string,
    user_id: string,
    created_at: string,
    updated_at: string,
}

export type ICreateVehicle = Omit<IVehicle, 'id' | 'created_at' | 'updated_at'>;