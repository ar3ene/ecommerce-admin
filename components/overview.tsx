"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { formatter } from "@/lib/utils";

interface OverviewProps {
  data: any[]
};

export const Overview: React.FC<OverviewProps> = ({
  data
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart 
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval={0}
          tickMargin={8}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `¥${value}`}
          // hide={true}
        />
        <Tooltip 
          formatter={(value: number) => formatter.format(value)}
          labelStyle={{ color: '#888888' }}
          contentStyle={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#3498db"
          strokeWidth={2}
          dot={{ fill: "#3498db" }} 
          // label={{
          //   position: 'right',
          //   formatter: (value: number) => formatter.format(value),
          //   fontSize: 12,
          //   fill: '#666',
          //   offset: 15, // 添加水平偏移量
          //   angle: -45, // 添加45度角
          //   dx: 5, // 水平位移
          //   dy: -5, // 垂直位移
          //   style: {
          //     fontWeight: 500,
          //     textAnchor: 'start' // 文本对齐方式
          //   }
          // }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
};
