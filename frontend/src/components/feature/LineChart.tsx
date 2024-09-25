import { ResponsiveLine } from '@nivo/line';

const theme = {
  axis: {
    domain: {
      line: {
        stroke: '#10982b',
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
};

export const LineChart = ({ data }: any) => {
  let maxY = 0;

  data[0].data.forEach((element: any) => {
    maxY = Math.max(maxY, Number.parseInt(element.y));
  });

  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 30, right: 30, bottom: 30, left: 40 }}
      xScale={{
        type: 'linear',
        min: data[0].data[0].x,
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yScale={{
        type: 'linear',
        min: 0,
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      curve="monotoneX"
      axisBottom={{
        tickValues: data[0].data.length,
        tickSize: 5,
        tickPadding: 5,
      }}
      axisLeft={{
        tickValues: maxY,
        tickSize: 5,
        tickPadding: 5,
      }}
      enableGridX={false}
      gridYValues={maxY}
      colors={['white']}
      lineWidth={3}
      pointSize={12}
      areaOpacity={0}
      enableTouchCrosshair={true}
      useMesh={true}
    />
  );
};
