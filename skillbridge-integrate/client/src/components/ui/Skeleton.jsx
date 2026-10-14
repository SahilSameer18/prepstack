import React from 'react';

const Skeleton = ({ width, height, borderRadius = '0.5rem', className = '' }) => {
    return (
        <div
            className={`skeleton-shimmer ${className}`}
            style={{
                width: width || '100%',
                height: height || '1rem',
                borderRadius: borderRadius,
            }}
        />
    );
};

export default Skeleton;

