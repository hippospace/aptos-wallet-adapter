import { IPool } from 'types/pool';

interface TProps {
  pool: IPool;
}

const PoolInfo: React.FC<TProps> = ({ pool }) => {
  const infoList = [
    {
      label: 'Total Liquidity',
      value: `$ ${parseFloat(pool.totalValueLockedUSD).toFixed(2)}`
    },
    {
      label: '24h Volume',
      value: `$ ${parseFloat(pool.volumeUSD).toFixed(2)}`
    },
    {
      label: 'APR',
      value: '63.3 %'
    }
  ];
  return (
    <div className="flex gap-3 grow justify-around">
      {infoList.map((info) => (
        <div className="flex flex-col justify-between gap-4" key={info.label}>
          <div className="title text-primeBlack80">{info.label}</div>
          <div className="header5 bold text-primeBlack80">{info.value}</div>
        </div>
      ))}
    </div>
  );
};

export default PoolInfo;
