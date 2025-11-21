import React from 'react';
import { ScriptStats as ScriptStatsType } from '../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface ScriptStatsProps {
  stats: ScriptStatsType;
}

export const ScriptStats: React.FC<ScriptStatsProps> = ({ stats }) => {
  const data = [
    { subject: '逻辑性', A: stats.logic, fullMark: 100 },
    { subject: '荒谬度', A: stats.absurdity, fullMark: 100 },
    { subject: '反套路', A: stats.tropeDeconstruction, fullMark: 100 },
    { subject: '节奏感', A: stats.pacing, fullMark: 100 },
    { subject: '精神暴击', A: stats.emotionalDamage, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 font-mono text-center">
        剧本六维分析
      </h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Script Stats"
              dataKey="A"
              stroke="#c084fc"
              strokeWidth={2}
              fill="#c084fc"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xs text-slate-500 font-mono">精神暴击 (DMG)</div>
          <div className="text-xl font-bold text-red-400">{stats.emotionalDamage}%</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xs text-slate-500 font-mono">荒谬指数 (ABS)</div>
          <div className="text-xl font-bold text-purple-400">{stats.absurdity}%</div>
        </div>
      </div>
    </div>
  );
};