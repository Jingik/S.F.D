import { ResponsiveBar } from '@nivo/bar';

const theme = {
  axis: {
    domain: {
      line: {
        stroke: '#B84F4F',
        strokeWidth: 2,
      },
    },
    ticks: {
      text: {
        fontSize: 12,
        fill: '#ffffff',
      },
      line: {
        strokeWidth: 0,
      },
    },
  },
  grid: {
    line: {
      stroke: '#cccccc',
      strokeWidth: 1,
    },
  },
  tooltip: {
    wrapper: {},
    container: {
      background: '#333333',
      color: '#ffffff',
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

export const BarChart = ({ data }: any) => {
  let maxY = 0;

  data.forEach((element: any) => {
    maxY = Math.max(maxY, Number.parseInt(element.count));
  });

  return (
    <ResponsiveBar
      data={data}
      theme={theme}
      margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
      keys={['count']}
      indexBy="type"
      padding={0.75}
      minValue={0}
      groupMode="grouped"
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={'white'}
      borderRadius={10}
      axisBottom={{
        tickValues: data.length,
        tickSize: 0,
        tickPadding: 5,
        tickRotation: -30,
      }}
      axisLeft={{
        tickValues: 6,
        tickSize: 5,
        tickPadding: 5,
      }}
      enableGridX={true}
      gridYValues={6}
      enableLabel={false}
    />
  );
};
