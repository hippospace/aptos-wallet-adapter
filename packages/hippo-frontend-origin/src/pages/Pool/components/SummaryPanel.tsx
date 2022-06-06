import { getPoolSummary } from 'modules/pool/reducer';
import { useSelector } from 'react-redux';

const SummaryPanel: React.FC = () => {
  const { totalValueLocked, total24Vol } = useSelector(getPoolSummary);
  return (
    <div className="flex flex-col gap-5 text-left border-4 border-grey-900 rounded-xxl bg-secondary px-10 py-8">
      <div className="flex flex-col gap-4">
        <small className="text-grey-700 font-bold">Total Value Locked</small>
        <h5 className="font-bold text-grey-900">${totalValueLocked.toFixed(2)}</h5>
      </div>
      <hr className="border-[1px] border-primeBlack20" />
      <div className="flex flex-col gap-4">
        <small className="text-grey-700 font-bold">Total 24h Volume</small>
        <h5 className="font-bold text-grey-900">${total24Vol ? total24Vol.toFixed(2) : '-'}</h5>
      </div>
    </div>
  );
};

export default SummaryPanel;
