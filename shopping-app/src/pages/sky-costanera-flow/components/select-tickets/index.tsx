import React from 'react';
import { IonIcon } from '@ionic/react';
import plussSquareBold from '../../../../assets/media/plus-square-bold.svg';
import minusSquareBold from '../../../../assets/media/minus-square-bold.svg';
import { ITicketType } from '../../../../models/reservation-contexts/IReservationContexts';

// index
import './index.less';
// components
import FakeInput from '../fake-input';
import EmptyModal from '../empty-modal';
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';

const textInfoTicket = {
  ADULT: {
    singular_ticket_name: 'Adulto',
    plural_ticket_name: 'Adultos',
    ticket_description: '',
  },
  CHILD: {
    singular_ticket_name: 'Niño',
    plural_ticket_name: 'Nińos',
    ticket_description: '(5 a 12 años)',
  },
  INFANT: {
    singular_ticket_name: 'Infante',
    plural_ticket_name: 'Infantes',
    ticket_description: '(0 a 4 años)',
  }
}

export interface ISelectedTicket extends ITicketType {
  count: number;
}

interface IProps {
    disabled: boolean;
    formError: boolean;
    ticketTypes?: ITicketType[];
    selectedTickets?: ISelectedTicket[];
    onChange: (selectedTickets: ISelectedTicket[]) => void;
}

interface IState {
  modal: boolean;
  selectedTickets: ISelectedTicket[];
}

export default class SelectTickets extends React.Component<IProps, IState> {
  state: IState = {
    modal: false,
    selectedTickets: this.props.selectedTickets?this.props.selectedTickets:[]
  }

  componentDidUpdate = (prevProps: IProps) => {
      if (this.props.ticketTypes !== prevProps.ticketTypes) {
          // populate selected tickets
          // using ticket types changes
          this.setState((prevState) => ({
              ...prevState,
              selectedTickets: (this.props.ticketTypes || []).map((type) => ({ ...type, count: 0 }))
          }))
      }
  }

  handleOpenModal = () => {
      if (this.props.disabled) {
          return;
      }

      this.setState({ modal: true });
  }

  increaseTicketCount = (type: string): void => {
    this.setState((prevState) => ({
        ...prevState,
        selectedTickets: prevState.selectedTickets.map((ticket) => {
            if (ticket.type === type) {
                return {
                    ...ticket,
                    count: ticket.count + 1
                }
            }

            return ticket;
        })
    }));
  }

  decreaseTicketCount = (type: string): void => {
        this.setState((prevState) => ({
            ...prevState,
            selectedTickets: prevState.selectedTickets.map((ticket) => {
                if (ticket.type === type) {
                    return {
                        ...ticket,
                        count: Math.max(0, ticket.count - 1)
                    }
                }

                return ticket;
            })
        }));
  }

  parseSingularOrPlurarText = (selectedTicket: ISelectedTicket): string => {
    return selectedTicket.count>1?textInfoTicket[selectedTicket.type].plural_ticket_name:textInfoTicket[selectedTicket.type].singular_ticket_name;
  }

  parseInputText  = () => {
    return this.state.selectedTickets.reduce((text, item: ISelectedTicket) => {
      if(item.count>0)
        text = text!==''? text + ' + ' + item.count + ' ' + this.parseSingularOrPlurarText(item): text + item.count + ' ' + this.parseSingularOrPlurarText(item);

        return text;
    }, '');
  }

  handleSave = () => {
    // pass only ticket with count > 0
    this.props.onChange(this.state.selectedTickets.filter((ticket) => ticket.count > 0));

    // hide modal
    this.setState({ modal: false });
  }

  render() {
    return (
      <div className='select-tickets-21xyz' >
        <FakeInput formError={this.props.formError} icon="user" text={this.parseInputText()} placeholder="Número de tickets" onClick={() => this.handleOpenModal()} />

        {this.state.modal && (
          <EmptyModal height="520px" title="Número de tickets" okText="Seleccionar" onOkClick={this.handleSave} onClose={() => this.setState({ modal: false })}>
            <p>Selecciona el número de tickets que deseas.</p>
            <div className="container-tickets">
              {this.state.selectedTickets.map((ticket) => {
                return (
                  <div key={`${ticket.type}`} className="element-ticket-person">
                    <div className="container-labels">
                      <div className="label">
                        {ticket.name} {NumberFormatter.toCurrency(ticket.price)}
                      </div>
                      <div className="sub-label">
                        {textInfoTicket[ticket.type].ticket_description}
                      </div>
                    </div>
                    <div className="actions">
                      <div className="action" onClick={() => this.decreaseTicketCount(ticket.type)}>
                          <IonIcon className={ticket.count === 0 ? "disabled" : ""} icon={minusSquareBold}></IonIcon>
                      </div>
                      <div className="count">{ticket.count}</div>
                      <div className="action" onClick={() => this.increaseTicketCount(ticket.type)}>
                          <IonIcon icon={plussSquareBold}></IonIcon>
                      </div>
                    </div>
                  </div>
                )
              }
              )}
            </div>
          </EmptyModal>
        )}
      </div>
    )
  }
}
