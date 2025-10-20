import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeRate } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../Button';
import { HARD_CURRENCIES } from '../../constants';
import { PlusIcon, TrashIcon } from '../Icons';

interface Props {
  rates: ExchangeRate[];
  setRates: React.Dispatch<React.SetStateAction<ExchangeRate[]>>;
}

const initialRateState = { from: 'EUR', to: 'USD', rate: 1.0 };

const ExchangeRates: React.FC<Props> = ({ rates, setRates }) => {
  const [newRate, setNewRate] = useState(initialRateState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setNewRate(prev => ({ ...prev, [name]: val }));
  };

  const handleAddRate = () => {
    if (!newRate.from || !newRate.to || newRate.rate <= 0) {
      alert('Please fill all fields with valid values.');
      return;
    }
    if (newRate.from === newRate.to) {
      alert('Cannot set a rate for the same currency.');
      return;
    }
    // Check for duplicates
    const exists = rates.some(r => r.from === newRate.from && r.to === newRate.to);
    if (exists) {
      alert(`A rate from ${newRate.from} to ${newRate.to} already exists. Please delete it first to add a new one.`);
      return;
    }
    
    setRates(prev => [...prev, { ...newRate, id: uuidv4() }]);
    setNewRate(initialRateState);
  };

  const handleDeleteRate = (id: string) => {
    setRates(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Card title="Manage Exchange Rates">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-heading mb-4">Current Rates</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-base">
              <thead className="bg-bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Rate (1 From = X To)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-bg-surface divide-y divide-border-base">
                {rates.map(rate => (
                  <tr key={rate.id}>
                    <td className="px-4 py-3 font-medium">{rate.from}</td>
                    <td className="px-4 py-3 font-medium">{rate.to}</td>
                    <td className="px-4 py-3">{rate.rate}</td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteRate(rate.id)}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rates.length === 0 && (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-text-muted">No exchange rates defined.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border-base">
          <h3 className="text-lg font-semibold text-text-heading mb-4">Add New Rate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Select label="From Currency" name="from" value={newRate.from} onChange={handleInputChange}>
              {HARD_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </Select>
            <Select label="To Currency" name="to" value={newRate.to} onChange={handleInputChange}>
               {HARD_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </Select>
            <Input type="number" label="Rate" name="rate" value={newRate.rate} onChange={handleInputChange} step="0.0001" />
            <div>
              <Button onClick={handleAddRate}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Rate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExchangeRates;