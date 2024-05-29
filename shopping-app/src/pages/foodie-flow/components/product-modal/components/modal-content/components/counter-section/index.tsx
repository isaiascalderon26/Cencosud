import React from "react";

/**
 * Components
 */
import Section from "../section";
import IncDecInput from "../../../../../inc-dec-input";

interface IProps {
  value: number,
  setValue: (value: number) => void,
}

const CounterSection:React.FC<IProps> = ({value, setValue}) => {

  const decrement = () => {
    setValue(Math.max(1, value - 1) )
  }
  
  const increment = () => {
    setValue(value + 1)
  }

  return (
    <Section secondary={{
      text: 'Unidades',
      cmp: <IncDecInput value={value} onDecrement={decrement} onIncrement={increment} disableLeftOnMin={true} minValue={1}/>,
      style: {marginBottom: 0}
    }}/>
  )
}

export default CounterSection;

