import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { MapPin, Check, X, AlertTriangle } from 'lucide-react';

export const LocationModal: React.FC = () => {
  const { allLocations, currentLocation, changeLocation, isLocationSelectorOpen, setIsLocationSelectorOpen } =
    useLocation();

  if (!isLocationSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-sand-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-sand-200 flex items-center justify-between bg-sand-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">Select Delivery Location</h3>
              <p className="text-xs text-charcoal-500">Choose your area in Goa to verify producer delivery</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationSelectorOpen(false)}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {allLocations.map((loc) => {
            const isSelected = currentLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => changeLocation(loc.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 shadow-2xs'
                    : 'border-sand-200 hover:border-brand-300 hover:bg-sand-50/80'
                } ${!loc.isServiceable ? 'opacity-65' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-sand-100 text-charcoal-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal-900">{loc.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-charcoal-600">
                        {loc.taluka} Taluka
                      </span>
                      {!loc.isServiceable && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Limited Service
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5">
                      {loc.district} • Est. Delivery: ~{loc.estimatedDeliveryMin} mins
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sand-200 bg-sand-50 text-xs text-charcoal-500 flex items-center justify-between">
          <span>Delivery active across Bardez, Tiswadi, Salcete, Ponda, Mormugao</span>
          <button
            onClick={() => setIsLocationSelectorOpen(false)}
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
