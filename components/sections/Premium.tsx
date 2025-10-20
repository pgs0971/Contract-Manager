import React, { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReinsuranceContract, Instalment } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../Button';
import { TrashIcon } from '../Icons';
import { useSortableTable } from '../../hooks/useSortableTable';
import { HARD_CURRENCIES } from '../../constants';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const Premium: React.FC<Props> = ({ contract, setContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setContract(prev => ({ ...prev, premium: { ...prev.premium, [name]: val } }));
  };

  const handleInstalmentChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setContract(prev => ({
        ...prev,
        premium: {
            ...prev.premium,
            instalments: prev.premium.instalments.map(inst =>
                inst.id === id ? { ...inst, [name]: val } : inst
            )
        }
    }));
  };

  const handleDeleteInstalment = (id: string) => {
    setContract(prev => ({
        ...prev,
        premium: {
            ...prev.premium,
            instalments: prev.premium.instalments.filter(inst => inst.id !== id)
        }
    }));
  };
  
  const generateInstalments = useCallback(() => {
    const { epi, instalmentFrequency, sddDays } = contract.premium;
    const { inceptionDate } = contract;

    if (instalmentFrequency === 'Manual' || !inceptionDate) {
      alert('Cannot auto-generate for "Manual" frequency or if inception date is not set.');
      return;
    }
    
    let numInstalments = 0;
    if (instalmentFrequency === 'Monthly') numInstalments = 12;
    if (instalmentFrequency === 'Quarterly') numInstalments = 4;
    if (instalmentFrequency === 'Annually') numInstalments = 1;

    if (numInstalments === 0) return;

    const amountPerInstalment = epi / numInstalments;
    const newInstalments: Instalment[] = [];
    const startDate = new Date(inceptionDate);

    for (let i = 0; i < numInstalments; i++) {
        const dueDate = new Date(startDate);
        if (instalmentFrequency === 'Monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
        } else if (instalmentFrequency === 'Quarterly') {
            dueDate.setMonth(dueDate.getMonth() + i * 3);
        }
        
        dueDate.setDate(dueDate.getDate() + sddDays);

        newInstalments.push({
            id: uuidv4(),
            no: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: Math.round(amountPerInstalment * 100) / 100, // round to 2 decimal places
            status: 'Pending',
        });
    }

    // Adjust last instalment for rounding differences
    const totalGenerated = newInstalments.reduce((sum, inst) => sum + inst.amount, 0);
    const roundingDiff = epi - totalGenerated;
    if (newInstalments.length > 0) {
        newInstalments[newInstalments.length - 1].amount += roundingDiff;
    }


    setContract(prev => ({
        ...prev,
        premium: {
            ...prev.premium,
            instalments: newInstalments
        }
    }));

  }, [contract.premium, contract.inceptionDate, setContract]);

  const filteredInstalments = useMemo(() => {
    if (!searchTerm) {
        return contract.premium.instalments;
    }
    return contract.premium.instalments.filter(inst =>
        inst.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.dueDate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contract.premium.instalments, searchTerm]);

  const { sortedItems: sortedAndFilteredInstalments, requestSort, getSortIcon } = useSortableTable<Instalment>(
    filteredInstalments,
    { key: 'dueDate', direction: 'ascending' }
  );
  
  const totalInstalmentAmount = contract.premium.instalments.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <Card title="Premium Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Select label="Currency" name="currency" value={contract.premium.currency} onChange={handlePremiumChange}>
            {HARD_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
            ))}
          </Select>
          <Input type="number" label="Estimated Premium Income (EPI)" name="epi" value={contract.premium.epi} onChange={handlePremiumChange} />
          <Input type="number" label="Brokerage %" name="brokerage" value={contract.premium.brokerage} onChange={handlePremiumChange} />
          <Input type="number" label="Tax %" name="tax" value={contract.premium.tax} onChange={handlePremiumChange} />
          <Input label="Payment Terms" name="paymentTerms" value={contract.premium.paymentTerms} onChange={handlePremiumChange} />
          <Input type="number" label="SDD (days)" name="sddDays" value={contract.premium.sddDays} onChange={handlePremiumChange} helperText="Settlement Due Date days from inception/period."/>
        </div>
      </Card>
      <Card title="Instalments">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select label="Frequency" name="instalmentFrequency" value={contract.premium.instalmentFrequency} onChange={handlePremiumChange}>
                <option>Manual</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
            </Select>
            <div className="md:mt-6">
                <Button onClick={generateInstalments} variant="secondary" disabled={contract.premium.instalmentFrequency === 'Manual'}>
                    Auto-Generate Schedule
                </Button>
            </div>
            <Input
                label="Search Instalments"
                placeholder="Filter by status or due date..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-base">
                <thead className="bg-bg-muted">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('no')}>
                            <div className="flex items-center">No. {getSortIcon('no')}</div>
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('dueDate')}>
                            <div className="flex items-center">Due Date {getSortIcon('dueDate')}</div>
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('amount')}>
                            <div className="flex items-center">Amount {getSortIcon('amount')}</div>
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('status')}>
                            <div className="flex items-center">Status {getSortIcon('status')}</div>
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-text-muted uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-bg-surface divide-y divide-border-base">
                    {sortedAndFilteredInstalments.map(inst => (
                        <tr key={inst.id}>
                            <td className="p-2"><Input type="number" name="no" value={inst.no} onChange={(e) => handleInstalmentChange(inst.id, e)} label="" /></td>
                            <td className="p-2"><Input type="date" name="dueDate" value={inst.dueDate} onChange={(e) => handleInstalmentChange(inst.id, e)} label="" /></td>
                            <td className="p-2"><Input type="number" name="amount" value={inst.amount} onChange={(e) => handleInstalmentChange(inst.id, e)} label="" /></td>
                            <td className="p-2">
                                <Select name="status" value={inst.status} onChange={(e) => handleInstalmentChange(inst.id, e)} label="">
                                    <option>Pending</option>
                                    <option>Paid</option>
                                    <option>Overdue</option>
                                </Select>
                            </td>
                            <td className="p-2 text-center">
                                <Button onClick={() => handleDeleteInstalment(inst.id)} size="sm" variant="danger"><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-bg-muted">
                    <tr className="font-bold">
                        <td className="px-4 py-2" colSpan={2}>Total</td>
                        <td className={`px-4 py-2 ${totalInstalmentAmount.toFixed(2) !== contract.premium.epi.toFixed(2) ? 'text-danger-text' : ''}`}>
                            {totalInstalmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan={2}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Premium;