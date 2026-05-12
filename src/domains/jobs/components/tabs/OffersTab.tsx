import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { useOffers } from '../../hooks/useOffers';

interface OffersTabProps {
  jobId: string;
}

interface Offer {
  id: string;
  baseSalary: number;
  bonusPercent: number;
  equity: string;
  startDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}

export default function OffersTab({ jobId }: OffersTabProps) {
  const { data: offers = [], isLoading, error } = useOffers(jobId);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [formData, setFormData] = useState({
    baseSalary: 0,
    bonusPercent: 0,
    equity: '',
    startDate: '',
    notes: '',
  });

  const handleAddOffer = async () => {
    // TODO: Call API to create offer
    setIsAddingOffer(false);
    setFormData({
      baseSalary: 0,
      bonusPercent: 0,
      equity: '',
      startDate: '',
      notes: '',
    });
  };

  const handleDeleteOffer = async (offerId: string) => {
    // TODO: Call API to delete offer
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calculateTotalCompensation = (offer: Offer) => {
    const bonus = offer.baseSalary * (offer.bonusPercent / 100);
    return offer.baseSalary + bonus;
  };

  return (
    <div className="p-6">
      {/* Add Offer Form */}
      {isAddingOffer && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Log Offer</h3>

          <input
            type="number"
            placeholder="Base Salary (e.g., 150000)"
            value={formData.baseSalary || ''}
            onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="number"
            placeholder="Bonus %"
            value={formData.bonusPercent || ''}
            onChange={(e) => setFormData({ ...formData, bonusPercent: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Equity (e.g., 0.25% RSUs)"
            value={formData.equity}
            onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Additional notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={2}
          />

          <div className="flex gap-2">
            <button
              onClick={handleAddOffer}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
            >
              Log Offer
            </button>
            <button
              onClick={() => setIsAddingOffer(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Offer Button */}
      {!isAddingOffer && (
        <button
          onClick={() => setIsAddingOffer(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition text-sm font-medium"
        >
          <Plus size={16} />
          Log Offer
        </button>
      )}

      {/* Offers List */}
      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer: Offer) => {
            const totalComp = calculateTotalCompensation(offer);
            const statusColors = {
              pending: 'bg-yellow-50 border-yellow-200',
              accepted: 'bg-green-50 border-green-200',
              rejected: 'bg-red-50 border-red-200',
            };

            return (
              <div
                key={offer.id}
                className={`border rounded-lg p-4 ${statusColors[offer.status]}`}
              >
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    offer.status === 'accepted'
                      ? 'bg-green-200 text-green-800'
                      : offer.status === 'rejected'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="p-1 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>

                {/* Compensation Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base Salary</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${offer.baseSalary.toLocaleString()}
                    </span>
                  </div>

                  {offer.bonusPercent > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bonus ({offer.bonusPercent}%)</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${Math.round((offer.baseSalary * offer.bonusPercent) / 100).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {offer.equity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Equity</span>
                      <span className="text-sm font-semibold text-gray-900">{offer.equity}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <TrendingUp size={14} />
                      Total Compensation
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${totalComp.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                {offer.startDate && (
                  <div className="text-xs text-gray-600 mb-2">
                    Start Date: {new Date(offer.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                )}

                {/* Notes */}
                {offer.notes && (
                  <div className="bg-white bg-opacity-50 rounded p-2 text-xs text-gray-700">
                    {offer.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !isAddingOffer ? (
        <p className="text-sm text-gray-600 text-center py-4">No offers logged yet</p>
      ) : null}
    </div>
  );
}
