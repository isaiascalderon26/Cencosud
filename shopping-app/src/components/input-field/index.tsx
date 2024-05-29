import React from "react";
import './index.less';
import NumberFormatter from "../../lib/formatters/NumberFormatter";
import DniFormatter from "../../lib/formatters/DniFormatter";

interface IProps {
  id: string
  type: string
  allowClear: boolean
  placeholder: string
  value?: string
  onChange: () => void
  constraint?: string
  prefix: string,
  focused: boolean
}
interface IState {
  id: string
  type: string
  allowClear: boolean
  placeholder: string
  value?: string
  onChange: (value?: string) => void
  constraint?: string
  prefix: string,
  focused: boolean,
  formattedValue: string,
  isValid: boolean
}

export default class InputField extends React.Component<IProps, IState>  {
  lastValidValue = "";
  state: IState = {
    id: "",
    type: "text",
    allowClear: false,
    focused: false,
    onChange: () => { },
    placeholder: "",
    prefix: "",
    formattedValue: "",
    isValid: true
  };
  textInput = React.createRef<HTMLInputElement>();
  formattedMask = React.createRef<HTMLInputElement>()

  componentDidMount() {
    const newState = { ...this.props, formattedValue: "", isValid: true }
    this.setState(newState);
    if (this.props.focused) {
      setTimeout(() => {
        if (!this.textInput.current) return;

        this.textInput.current.focus();
        this.textInput.current.click();
      }, 600);
    }
  }

  checkConstraint = (type: string, value: string) => {
    if (value === "") {
      return true;
    }
    switch (type) {
      case "only chars":
        return /^[a-zA-Zñ]+$/i.test(value);
      case "chars and spaces":
        return /^[a-zA-Z ñ]+$/.test(value);
      case "numbers":
      case "phone":
        return /^[0-9]+$/.test(value);
      case "email":
        return /^[0-9a-zA-Zñ@_|=&+-.]+$/.test(value);
      case "rut":
        return /^[0-9kK]+$/.test(value);
    }
    return true;
  };

  componentWillReceiveProps(props: IProps) {
    // If prop value is updated, then call re-render
    if (props.value !== undefined) {
      const formattedValue = this.formatValue(
        this.props.constraint || "",
        props.value
      );
      this.setState({ value: props.value, formattedValue });
    }
  }

  formatValue(constraint: string, value: string) {
    // Formatted Value
    switch (constraint) {
      case "phone":
        value = NumberFormatter.toPhone(value);
        break;
      case "rut":
        value = DniFormatter.toRut(value);
        break;
    }
    return value;
  }

  onChangeInput = (e: any) => {
    const value = e.target.value;
    const constraint = this.state.constraint || "";

    // Validate if the key pressed is valid in the context
    if (constraint) {
      const isValid = this.checkConstraint(constraint, value);
      if (!isValid) {
        this.setState({
          value: this.lastValidValue
        });
        return false;
      }
    }

    this.lastValidValue = value; // Save for later restore
    const formattedValue = this.formatValue(constraint, value);

    // Validate if the complete value is valid
    let isValid = true;
    if (constraint) {
      switch (constraint) {
        case "phone":
          isValid = value.length === 9;
          break;
        case "email":
          isValid = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            value
          );
          break;
        case "rut":
          isValid = DniFormatter.isRutValid(value);
          break;
      }
    }

    this.setState({
      value,
      formattedValue,
      isValid
    });

    if (this.state.onChange) {
      this.state.onChange(isValid ? value : undefined);
    }
  };

  onInputBlur = () => {
    this.setState({ focused: false });
    setTimeout(() => {
      const span = this.formattedMask.current;
      // MAYBE DID UNMOUNT, so check if still exist??
      if (span && span.style) {
        span.style.display = "block";

        // SIMULATE BUBBLING
        this.textInput.current!.blur();
      }
    }, 5);
  };

  onFormattedMaskClick = () => {
    this.setState({ focused: true });
    const span = this.formattedMask.current;
    // MAYBE DID UNMOUNT, so check if still exist??
    if (span && span.style) {
      span.style.display = "none";

      // SIMULATE BUBBLING
      this.textInput.current!.focus();
    }
  };

  onPlaceholderFocus = () => {
    // SIMULATE BUBBLING
    this.textInput.current!.focus();
  };

  clearInput = () => {
    this.setState({ value: "" });
    // Call onChange, because when clear,
    // the onChange Event on input is not triggered
    if (this.state.onChange) {
      this.state.onChange("");
    }
    setTimeout(() => {
      this.onFormattedMaskClick();
    }, 10);
  };

  render() {
    const cssClasses = [];
    let suffix = null;
    let prefix = this.state.prefix;

    // Put a X in to clear value
    if (this.state.allowClear && this.state.value) {
      suffix = (
        <i role="button" tabIndex={-1} onClick={this.clearInput}>
          <svg width="1.25em" height="1.25em" viewBox="0 0 90 90">
            <g
              id="remove"
              stroke="none"
              stroke-width="1"
              fill="currentColor"
              fill-rule="evenodd"
            >
              <path
                d="M45,0 C69.81728,0 90,20.1827 90,45 C90,69.8173 69.81728,90 45,90 C20.182721,90 0,69.8173 0,45 C0,20.1827 20.182721,0 45,0 Z M26.65625,23.96875 C25.5022417,24.0924692 24.5230963,24.8706716 24.1420676,25.9669648 C23.7610388,27.0632579 24.0464785,28.2809808 24.875,29.09375 L40.75,45 L24.875,60.875 C24.0385368,61.616342 23.6835004,62.7611899 23.9537256,63.8457345 C24.2239509,64.9302791 25.0746361,65.7747093 26.1611454,66.0369232 C27.2476547,66.2991372 28.3898513,65.9356615 29.125,65.09375 L45,49.21875 L60.875,65.09375 C61.6101487,65.9356615 62.7523453,66.2991372 63.8388546,66.0369232 C64.9253639,65.7747093 65.7760491,64.9302791 66.0462744,63.8457345 C66.3164996,62.7611899 65.9614632,61.616342 65.125,60.875 L49.25,45 L65.125,29.09375 C66.0479331,28.1938083 66.2928604,26.8049092 65.733429,25.6435578 C65.1739975,24.4822065 63.9352575,23.8080008 62.65625,23.96875 C61.9763804,24.0583936 61.3477354,24.3782306 60.875,24.875 L45,40.75 L29.125,24.875 C28.4853645,24.2091439 27.5747736,23.8748764 26.65625,23.96875 Z"
                id="Shape"
                fill="#b4b4b4"
                fill-rule="nonzero"
              />
            </g>
          </svg>
        </i>
      );
    }

    // Add a has-suffix classname
    if (suffix) {
      cssClasses.push("has_suffix");
    }

    // Add a has-prefix classname
    if (prefix) {
      cssClasses.push("has_prefix");
    }

    // check if has a value
    if (this.state.value) {
      cssClasses.push("has_value");
    }

    // check if is valid or invalid
    if (!this.state.focused) {
      cssClasses.push(this.state.isValid ? "is_valid" : "is_invalid");
    }

    return (
      <div id={this.state.id} className={cssClasses.join(" ")}>
        <div>
          <span>
            <span>{prefix}</span>
            <span
              onClick={this.onPlaceholderFocus}
              onFocus={this.onPlaceholderFocus}
            >
              {this.state.placeholder}
            </span>
            <input
              ref={this.textInput}
              onFocus={this.onFormattedMaskClick}
              onBlur={this.onInputBlur}
              onChange={this.onChangeInput}
              type={this.state.type}
              value={this.state.value}
            />
            <span>{suffix}</span>
            <span ref={this.formattedMask} onClick={this.onFormattedMaskClick}>
              <span>{this.state.formattedValue}</span>
            </span>
          </span>
        </div>
      </div>
    );
  }
}
