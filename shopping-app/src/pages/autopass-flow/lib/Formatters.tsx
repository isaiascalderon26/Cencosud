interface IState {
    text: string;
    cssClass: string;
}

class Formatters {

    plateDecorator = (plate: any):string => {
        return plate.match(/.{1,2}/g).join(' · ');
    }

    stateDecorator = (state: string): IState=> {
        switch (state) {
            case 'CREATED':
                return { text: 'Estacionado', cssClass: 'parked'};
            case 'APPROVED':
                return { text: 'Pagado', cssClass: 'paid'};
            case 'REJECTED':
                return { text: 'Pendiente', cssClass: 'pending'};
            default:
                return { text: 'default', cssClass: 'default' };
        }
    }

}

export default new Formatters();