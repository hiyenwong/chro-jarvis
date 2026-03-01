import { useState, useEffect } from 'react';
import { TokenTracker } from '../utils/tokenTracker';
import { TokenSummary, TimeRange, TokenStatistics } from '../types/tokenUsage';

function TokenStatsPanel() {
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await TokenTracker.getSummary(timeRange);
      setSummary(data);
    } catch (error) {
      console.error('加载 token 统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('确定要清空所有 token 记录吗？')) {
      await TokenTracker.clearAllRecords();
      loadSummary();
    }
  };

  const handleExport = async () => {
    try {
      const json = await TokenTracker.exportRecords();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `token-usage-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    const labels = {
      today: '今天',
      week: '最近 7 天',
      month: '最近 30 天',
      all: '全部'
    };
    return labels[range];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 时间范围选择 */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getTimeRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* 总体统计卡片 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
        <div>
          <div className="text-sm text-gray-600">总消耗 Token</div>
          <div className="text-2xl font-bold text-gray-900">
            {TokenTracker.formatTokenCount(summary.totalTokens)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">总成本</div>
          <div className="text-xl font-semibold text-indigo-600">
            {TokenTracker.formatCost(summary.totalCost)}
          </div>
        </div>
      </div>

      {/* 按 Provider/Model 分组统计 */}
      {summary.statistics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">按模型分组</h3>
          <div className="space-y-2">
            {summary.statistics.map((stat, index) => (
              <ModelStatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* 趋势图（简化版） */}
      {summary.trendData.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">使用趋势</h3>
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-end gap-1 h-20">
              {summary.trendData.map((point, index) => {
                const maxTokens = Math.max(...summary.trendData.map(p => p.totalTokens));
                const heightPercent = (point.totalTokens / maxTokens) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-400 hover:bg-blue-500 transition-colors rounded-t relative group"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {point.date}: {TokenTracker.formatTokenCount(point.totalTokens)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{summary.trendData[0].date}</span>
              <span>{summary.trendData[summary.trendData.length - 1].date}</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          onClick={handleExport}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          导出数据
        </button>
        <button
          onClick={handleClearAll}
          className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          清空记录
        </button>
      </div>
    </div>
  );
}

/**
 * 单个模型的统计卡片
 */
function ModelStatCard({ stat }: { stat: TokenStatistics }) {
  return (
    <div className="bg-white border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">
            {TokenTracker.getProviderDisplayName(stat.provider)}
          </div>
          <div className="text-xs text-gray-500">{stat.model}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {TokenTracker.formatTokenCount(stat.totalTokens)}
          </div>
          <div className="text-xs text-indigo-600">
            {TokenTracker.formatCost(stat.totalCost)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span>请求: {stat.requestCount}</span>
        <span>Prompt: {TokenTracker.formatTokenCount(stat.promptTokens)}</span>
        <span>Completion: {TokenTracker.formatTokenCount(stat.completionTokens)}</span>
      </div>
    </div>
  );
}

export default TokenStatsPanel;
