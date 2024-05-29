/**
 * Components
 */
import Image from '../../../image';


interface IProps {
  localLogo?: string;
  localName: string;
  detail?: string
}

const StoreInfo: React.FC<IProps> = ({ localLogo, localName, detail }) => {
  return (
    <div className='store-section'>
      <div className='logo'>
        <Image type='STORE' src={localLogo} />
      </div>
      <div className='local-data'>
        <div className='local-name'>{localName}</div>
        <div className='local-detail text-secondary-text-color'>{detail}</div>
      </div>
    </div>
  );
}

export default StoreInfo;