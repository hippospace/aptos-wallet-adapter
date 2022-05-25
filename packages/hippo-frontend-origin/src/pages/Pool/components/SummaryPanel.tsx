import { getPoolSummary } from 'modules/pool/reducer';
import { useSelector } from 'react-redux';

const SummaryPanel: React.FC = () => {
  const { totalValueLocked, total24Vol } = useSelector(getPoolSummary);
  return (
    <div className="flex flex-col gap-8 text-center">
      <div className="flex flex-col gap-4">
        <div className="title text-primeBlack20">Total Value Locked</div>
        <div className="header4 bold text-grey-900">${totalValueLocked.toFixed(2)}</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="title text-primeBlack20">Total 24h Volume</div>
        <div className="header4 bold text-grey-900">${total24Vol.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default SummaryPanel;
