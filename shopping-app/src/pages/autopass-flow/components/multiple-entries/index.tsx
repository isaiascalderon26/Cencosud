import React, { RefObject } from 'react';
// index
import './index.less';

interface IProps {
    onChange: (value: { plate: string; valid: boolean}) => void; 
}

interface IState {
    forwardButton: boolean,
    plate?: string
}

export default class MultipleEntries extends React.Component<IProps, IState> {

    private readonly digitInput1?: RefObject<HTMLInputElement>;
    private readonly digitInput2?: RefObject<HTMLInputElement>;
    private readonly digitInput3?: RefObject<HTMLInputElement>;
    private readonly digitInput4?: RefObject<HTMLInputElement>;
    private readonly digitInput5?: RefObject<HTMLInputElement>;
    private readonly digitInput6?: RefObject<HTMLInputElement>;

    constructor(props: any, state: any) {
        super(props, state);

        this.digitInput1 = React.createRef<HTMLInputElement>();
        this.digitInput2 = React.createRef<HTMLInputElement>();
        this.digitInput3 = React.createRef<HTMLInputElement>();
        this.digitInput4 = React.createRef<HTMLInputElement>();
        this.digitInput5 = React.createRef<HTMLInputElement>();
        this.digitInput6 = React.createRef<HTMLInputElement>();
    }

    state: IState = {
        forwardButton: true,
    }

    onKeyboardInput = async (e: any, current:any, next: any, prev: any): Promise<void> => {
        if (e.keyCode === 8) {
            current.current.value = '';
            if(prev !== undefined) {
                prev.current.focus();
            }
            this.setState({
                forwardButton: true
            });
        } else {
            current.current.value = current.current.value.replace(/[^a-z0-9]/gi,'');
            if(current.current.value && next !== undefined) {
                next.current.focus();
            }
        }
        if (this.formValid()) {
            this.setState({
                forwardButton: false
            });
        }
        return;
    }

    joinPlateInput = (): string => {
        return [
          this.digitInput1!.current!.value,
          this.digitInput2!.current!.value,
          this.digitInput3!.current!.value,
          this.digitInput4!.current!.value,
          this.digitInput5!.current!.value,
          this.digitInput6!.current!.value,
        ].join('').toUpperCase();
    }
    
    formValid = (): boolean => {
        const fullString = this.joinPlateInput();
        this.setState({ plate: fullString });

        const isValid = fullString.replace(' ', '').length === 6;

        // call on change
        this.props.onChange({ plate: fullString, valid: isValid });

        return isValid;
    }

    render() {
        return (
            <div className="component-multiple-entries">
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput1, this.digitInput2, undefined)} ref={this.digitInput1} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput2, this.digitInput3, this.digitInput1)} ref={this.digitInput2} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput3, this.digitInput4, this.digitInput2)} ref={this.digitInput3} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput4, this.digitInput5, this.digitInput3)} ref={this.digitInput4} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput5, this.digitInput6, this.digitInput4)} ref={this.digitInput5} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput6, undefined, this.digitInput5)} ref={this.digitInput6} maxLength={1} />
            </div>
        )
    }
}