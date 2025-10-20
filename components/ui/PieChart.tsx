import React from 'react';

interface PieChartProps {
  data: { label: string; value: number }[];
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 150 }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    return <div style={{ width: size, height: size }} className="flex items-center justify-center text-text-muted">No data</div>;
  }
  
  let cumulativePercentage = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  
  const chartColorClasses = [
      'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'
  ];

  return (
    <svg height={size} width={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
      {data.map((item, index) => {
        if (item.value <= 0) return null;
        const percentage = item.value / total;
        
        const [startX, startY] = getCoordinatesForPercent(cumulativePercentage);
        
        cumulativePercentage += percentage;
        
        const [endX, endY] = getCoordinatesForPercent(cumulativePercentage);
        
        const largeArcFlag = percentage > 0.5 ? 1 : 0;
        
        const pathData = [
          `M ${startX} ${startY}`, // Move
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
          `L 0 0`, // Line
        ].join(' ');

        const colorClass = `fill-${chartColorClasses[index % chartColorClasses.length]}`;

        return <path key={index} d={pathData} className={colorClass} />;
      })}
    </svg>
  );
};