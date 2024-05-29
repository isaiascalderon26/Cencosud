/**
 * Components
 */
import CustomChip from "../../../../../custom-chip";

export type ChipTypes = 'MANDATORY' | 'OPTIONAL' | 'CHECKED';

interface IProp {
  type: ChipTypes
}

const Chip: React.FC<IProp> = ({type}) => {
  
  switch(type){
    case 'MANDATORY': return <CustomChip text="Obligatorio" icon={true} type="WARNING" />
    case 'OPTIONAL': return <CustomChip text="Opcional"/>
    case 'CHECKED': return <CustomChip text="Obligatorio" type="SUCCESS" icon={true}/>
    default:
      return null;
  }
}

export default Chip;