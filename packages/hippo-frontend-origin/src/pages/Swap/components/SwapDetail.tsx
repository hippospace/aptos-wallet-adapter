import { getSwapSettings } from 'modules/swap/reducer';
import { useSelector } from 'react-redux';

const SwapDetail: React.FC = () => {
  const swapSettings = useSelector(getSwapSettings);

  const details = [
    {
      label: 'Expected Output',
      value: '0.0001235 ETH'
    },
    {
      label: 'Minimum received after slippage',
      value: '0.0012466713 ETH'
    },
    {
      label: 'Price Impact',
      value: '-0.06%'
    },
    {
      label: 'Slippage tolerance',
      value: `${swapSettings.slipTolerance} %`
    }
  ];

  return (
    <div className="flex flex-col gap-2 py-4 mt-6 -mb-6 px-2">
      {details.map((detail) => (
        <div className="flex justify-between" key={detail.label}>
          <small className="font-bold text-grey-900">{detail.label}</small>
          <small className="font-bold text-grey-900">{detail.value}</small>
        </div>
      ))}
    </div>
  );
};

export default SwapDetail;
