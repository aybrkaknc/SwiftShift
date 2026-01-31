import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div
            className={`bg-surface/80 animate-pulse rounded-md ${className}`}
        />
    );
};

export const SkeletonRow = () => (
    <div className="flex items-center space-x-3 p-3 w-full">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);
