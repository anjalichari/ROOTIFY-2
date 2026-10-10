import React from 'react';
import { OrderTimelineStep } from '../../types';
import { Check, Clock, PackageCheck, CookingPot, Bike, Home, CheckCircle2 } from 'lucide-react';

interface OrderTimelineProps {
  timeline: OrderTimelineStep[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline }) => {
  const getStepIcon = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted && !isCurrent) {
      return <Check className="w-4 h-4 text-white stroke-[3]" />;
    }

    switch (status) {
      case 'PLACED':
        return <Clock className="w-4 h-4" />;
      case 'ACCEPTED':
        return <PackageCheck className="w-4 h-4" />;
      case 'PREPARING':
        return <CookingPot className="w-4 h-4" />;
      case 'READY_FOR_PICKUP':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return <Bike className="w-4 h-4" />;
      case 'DELIVERED':
        return <Home className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="py-2">
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Connecting vertical line */}
        <div className="absolute top-3 bottom-3 left-3 sm:left-4 w-0.5 bg-gray-200 -translate-x-1/2"></div>

        {timeline.map((step, index) => {
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <div key={step.status + index} className="relative flex items-start gap-4 group">
              {/* Step Circle Pin */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center -translate-x-1/2 transition-all shadow-sm ${
                  isCurrent
                    ? 'bg-brand-700 text-white ring-4 ring-brand-100 ring-offset-1 animate-pulse'
                    : isCompleted
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border-2 border-sand-300 text-charcoal-400'
                }`}
              >
                {getStepIcon(step.status, isCompleted, isCurrent)}
              </div>

              {/* Step Information */}
              <div className="flex-1 bg-white p-3.5 sm:p-4 rounded-xl border border-sand-300 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-display font-bold text-sm sm:text-base ${
                        isCurrent
                          ? 'text-brand-800'
                          : isCompleted
                          ? 'text-charcoal-900'
                          : 'text-charcoal-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-200 tracking-wider">
                        In Progress
                      </span>
                    )}
                    {isCompleted && !isCurrent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                        Done
                      </span>
                    )}
                  </div>

                  {step.timestamp && (
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.description}
                </p>

                {step.updatedByRole && (
                  <div className="mt-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <span>Verified by:</span>
                    <span className="text-gray-700 capitalize">{step.updatedByRole}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
