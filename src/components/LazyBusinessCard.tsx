import { lazy, Suspense } from 'react';
import { BusinessCardSkeleton } from '@/components/BusinessCardSkeleton';
import { useLazyLoad } from '@/hooks/use-lazy-load';
import { BusinessCardDisplay } from '@/types/business-card';

const BusinessCard = lazy(() => import('@/components/BusinessCard'));

interface LazyBusinessCardProps {
  card: BusinessCardDisplay;
  variant?: "compact" | "full" | "preview";
  showStats?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LazyBusinessCard = ({ card, onClick, ...props }: LazyBusinessCardProps) => {
  const { ref, isVisible } = useLazyLoad({ rootMargin: '100px', threshold: 0.01 });

  return (
    <div ref={ref} onClick={onClick} className="h-full">
      {isVisible ? (
        <Suspense fallback={<BusinessCardSkeleton />}>
          <BusinessCard card={card} {...props} />
        </Suspense>
      ) : (
        <BusinessCardSkeleton />
      )}
    </div>
  );
};
