import { IonIcon } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import sc from "styled-components";
import { Capacitor } from "@capacitor/core";

interface Props<T = string> {
  options: {
    id: T;
    body: string | React.ReactNode;
    icon?: any;
  }[];
  value?: string;
  onChange?: (id?: T) => void;
  extraCss?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

type ButtonGroupOptions = {} & Pick<Props, "primaryColor" | "secondaryColor">;

const ButtonGroup = sc.div<ButtonGroupOptions>`
    position: relative;
    --primary-color: ${({ primaryColor = "black" }) => primaryColor};
    --secondary-color: ${({ secondaryColor = "white" }) => secondaryColor};
    display: flex;
    flex-direction: row;

    border-radius: 30px;
    width: max-content;
    max-width: 100%;
    overflow: hidden;
    padding:10px 5px;
    transform: rotate(90deg);
    float: right;
    right: -4px;
    bottom: -20px;
    z-index: 5;
    >* {
        flex-grow:1;
        flex-basis: 0;
        break-word: anywhere;
        font-weight: 500;
        font-size: 14px;
        line-height: 100%;
        background: transparent;
        z-index:1;

        transition: color 0.3s;

        &[data-selected='true'] {
            color: var(--secondary-color);
            fill: color: var(--secondary-color);
        }

        &[data-selected='false'] {
            color: var(--primary-color);
            fill: color: var(--primary-color);
        }
    }

    >.backgroundc {
        position: absolute;
        height: calc(100% - 2px);
        background-color: var(--primary-color);
        border: 3px solid #8e70df;
        border-radius: 30px;
        top: 0px;
        left: 0px;
        transition: left 0.3s;
        transform: translate(0, 1px);
    }
`;

function ButtonsRadioSelector<T>({
  options,
  value,
  onChange,
  extraCss,
  primaryColor = "black",
  secondaryColor = "white",
}: Props<T>) {
  const selected = value ?? options[0].id;

  const el = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);

  const setValue = (id: T) => {
    if (onChange) onChange(id);
  };

  useEffect(() => {
    const index = options.findIndex(({ id: i }) => i == selected);
    if (index != -1) {
      setLeft(90 / (options.length / index));
    }
  }, [selected]);

  return (
    <ButtonGroup
      className={extraCss}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      ref={el}
    >
      <div
        className="backgroundc"
        style={{
          // width: `calc(${100 / options.length}% - 2px)`,
          width: Capacitor.getPlatform() === "ios" ? "38px" : "40px",
          left: `calc(${left}%)`,
        }}
      ></div>
      <div
        id="access-selector-bg"
        style={{
          position: "absolute",
          backgroundColor: "white",
          width: "82px",
          height: "34px",
          bottom: "4px",
          left: "1px",
          borderRadius: "34px",
          zIndex: 0,
        }}
      />
      {options.map(({ id, body, icon }) => (
        <button
          key={`${id}`}
          onClick={() => {
            setValue(id);
          }}
          data-selected={id == selected}
          style={{
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: `${
              (id as unknown as string) === "fastest" ? "0 4px" : "0 10px"
            }`,
          }}
        >
          {icon && (
            <IonIcon
              icon={icon}
              data-selected={id == selected}
              color={id == selected ? secondaryColor : primaryColor}
              style={{
                fontSize: "20px",
                marginRight: "6px",
                transform: "rotate(-90deg)",
              }}
            />
          )}
          {body}
        </button>
      ))}
    </ButtonGroup>
  );
}

export default ButtonsRadioSelector;
