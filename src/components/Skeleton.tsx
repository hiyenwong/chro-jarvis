/**
 * 骨架屏组件
 * 用于加载状态下的占位显示
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  const style = {
    width: width !== undefined ? typeof width === 'number' ? `${width}px` : width : undefined,
    height: height !== undefined ? typeof height === 'number' ? `${height}px` : height : undefined
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}

/**
 * Token 统计骨架屏
 */
export function TokenStatsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* 时间范围选择骨架 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={60} height={32} variant="rectangular" />
        ))}
      </div>

      {/* 总体统计卡片骨架 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton width={80} height={14} />
          <Skeleton width={120} height={28} />
        </div>
        <div className="space-y-2">
          <Skeleton width={60} height={14} />
          <Skeleton width={100} height={24} />
        </div>
      </div>

      {/* 模型统计卡片骨架 */}
      <div>
        <Skeleton width={80} height={14} className="mb-2" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton width={100} height={14} />
                  <Skeleton width={60} height={12} />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton width={60} height={14} />
                  <Skeleton width={50} height={12} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton width={40} height={12} />
                <Skeleton width={50} height={12} />
                <Skeleton width={60} height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 趋势图骨架 */}
      <div>
        <Skeleton width={60} height={14} className="mb-2" />
        <div className="bg-white border rounded-lg p-3">
          <Skeleton width="100%" height={80} variant="rectangular" />
        </div>
      </div>

      {/* 操作按钮骨架 */}
      <div className="flex gap-2 pt-2 border-t">
        <Skeleton className="flex-1" height={38} variant="rectangular" />
        <Skeleton className="flex-1" height={38} variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * 设置页面骨架屏
 */
export function SettingsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        <Skeleton width={80} height={22} />
      </h3>

      <div className="space-y-4">
        {/* AI 供应商选择骨架 */}
        <div className="space-y-2">
          <Skeleton width={80} height={14} />
          <Skeleton width="100%" height={38} variant="rectangular" />
        </div>

        {/* API Key 输入骨架 */}
        <div className="space-y-2">
          <Skeleton width={60} height={14} />
          <Skeleton width="100%" height={38} variant="rectangular" />
        </div>

        {/* 目标语言选择骨架 */}
        <div className="space-y-2">
          <Skeleton width={70} height={14} />
          <Skeleton width="100%" height={38} variant="rectangular" />
        </div>

        {/* 保存按钮骨架 */}
        <Skeleton width="100%" height={38} variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * 聊天历史骨架屏
 */
export function ChatHistorySkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`mb-4 ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}
          style={{ maxWidth: '80%' }}
        >
          <div
            className={`p-3 rounded-lg ${
              i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Skeleton width="100%" height={14} className="mb-1" />
            <Skeleton width="80%" height={14} className="mb-2" />
            <Skeleton width={60} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 快速操作骨架屏
 */
export function QuickActionsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">
        <Skeleton width={80} height={22} />
      </h3>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={38} variant="rectangular" />
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <Skeleton width={40} height={14} className="mb-2" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={12} className="mt-1" />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
