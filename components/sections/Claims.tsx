import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReinsuranceContract, Claim } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../Button';
import { PlusIcon, TrashIcon, EditIcon } from '../Icons';
import { useSortableTable } from '../../hooks/useSortableTable';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const initialClaimState: Claim = {
  id: '',
  fnolDate: new Date().toISOString().split('T')[0],
  claimRef: '',
  section: 'Main',
  perilCat: '',
  lossDate: new Date().toISOString().split('T')[0],
  reportedAmount: 0,
  reserves: 0,
  paid: 0,
  recoveries: 0,
  notes: '',
};

const Claims: React.FC<Props> = ({ contract, setContract }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentClaim, setCurrentClaim] = useState<Claim>(initialClaimState);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClaimChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setCurrentClaim(prev => ({ ...prev, [name]: val }));
  };

  const startAdding = () => {
    setEditingId(null);
    setCurrentClaim(initialClaimState);
    setIsAdding(true);
  };
  
  const startEditing = (claim: Claim) => {
    setIsAdding(false);
    setEditingId(claim.id);
    setCurrentClaim(claim);
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentClaim(initialClaimState);
  };

  const handleSaveClaim = () => {
    if (!currentClaim.claimRef) {
      alert('Claim Reference is required.');
      return;
    }
    
    if (editingId) { // Update
      setContract(prev => ({
        ...prev,
        claims: prev.claims.map(c => c.id === editingId ? currentClaim : c),
      }));
    } else { // Add new
      setContract(prev => ({
        ...prev,
        claims: [...prev.claims, { ...currentClaim, id: uuidv4() }],
      }));
    }
    cancelAction();
  };

  const handleDeleteClaim = (id: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      setContract(prev => ({
        ...prev,
        claims: prev.claims.filter(c => c.id !== id),
      }));
    }
  };
  
  const filteredClaims = useMemo(() => {
    if (!searchTerm) {
        return contract.claims;
    }
    return contract.claims.filter(claim => 
        claim.claimRef.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contract.claims, searchTerm]);

  const customSorters = {
    incurred: (a: Claim, b: Claim) => {
        const aValue = a.paid + a.reserves;
        const bValue = b.paid + b.reserves;
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
    }
  };

  const { sortedItems: sortedAndFilteredClaims, requestSort, getSortIcon } = useSortableTable<Claim>(
    filteredClaims,
    { key: 'lossDate', direction: 'descending' },
    customSorters
  );

  const totals = useMemo(() => {
    return contract.claims.reduce((acc, claim) => {
        acc.paid += claim.paid;
        acc.reserves += claim.reserves;
        acc.incurred += claim.paid + claim.reserves;
        return acc;
    }, { paid: 0, reserves: 0, incurred: 0 });
  }, [contract.claims]);

  const renderEditForm = () => (
    <div className="p-4 bg-bg-muted border rounded-md">
      <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Claim' : 'Add New Claim'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Claim Ref" name="claimRef" value={currentClaim.claimRef} onChange={handleClaimChange} required/>
        <Input type="date" label="FNOL Date" name="fnolDate" value={currentClaim.fnolDate} onChange={handleClaimChange}/>
        <Input type="date" label="Loss Date" name="lossDate" value={currentClaim.lossDate} onChange={handleClaimChange}/>
        <Input label="Section" name="section" value={currentClaim.section} onChange={handleClaimChange}/>
        <Input label="Peril / Catastrophe" name="perilCat" value={currentClaim.perilCat} onChange={handleClaimChange}/>
        <Input type="number" label="Reported Amount" name="reportedAmount" value={currentClaim.reportedAmount} onChange={handleClaimChange}/>
        <Input type="number" label="Reserves" name="reserves" value={currentClaim.reserves} onChange={handleClaimChange}/>
        <Input type="number" label="Paid" name="paid" value={currentClaim.paid} onChange={handleClaimChange}/>
        <Input type="number" label="Recoveries" name="recoveries" value={currentClaim.recoveries} onChange={handleClaimChange}/>
      </div>
      <div className="mt-4">
        <Textarea label="Claim Notes" name="notes" value={currentClaim.notes} onChange={handleClaimChange} rows={3}/>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={cancelAction} variant="secondary">Cancel</Button>
        <Button onClick={handleSaveClaim}>Save Claim</Button>
      </div>
    </div>
  );

  return (
    <Card title="Claims Ledger">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="w-full max-w-xs">
                <Input
                    label="Search Claims"
                    placeholder="Filter by claim ref..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            {!isAdding && !editingId && (
                <Button onClick={startAdding}><PlusIcon className="w-4 h-4 mr-2"/>Add Claim</Button>
            )}
        </div>
        
        {(isAdding || editingId) && renderEditForm()}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-base">
            <thead className="bg-bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('claimRef')}>
                    <div className="flex items-center">Claim Ref {getSortIcon('claimRef')}</div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('lossDate')}>
                    <div className="flex items-center">Loss Date {getSortIcon('lossDate')}</div>
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('paid')}>
                    <div className="flex items-center justify-end">Paid {getSortIcon('paid')}</div>
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('reserves')}>
                    <div className="flex items-center justify-end">Reserves {getSortIcon('reserves')}</div>
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('incurred')}>
                    <div className="flex items-center justify-end">Incurred {getSortIcon('incurred')}</div>
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-bg-surface divide-y divide-border-base">
              {sortedAndFilteredClaims.map(claim => (
                <tr key={claim.id}>
                  <td className="px-4 py-3 font-medium">{claim.claimRef}</td>
                  <td className="px-4 py-3">{claim.lossDate}</td>
                  <td className="px-4 py-3 text-right">{claim.paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{claim.reserves.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">{(claim.paid + claim.reserves).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Button onClick={() => startEditing(claim)} size="sm" variant="icon"><EditIcon className="w-5 h-5"/></Button>
                    <Button onClick={() => handleDeleteClaim(claim.id)} size="sm" variant="icon"><TrashIcon className="w-5 h-5 text-danger"/></Button>
                  </td>
                </tr>
              ))}
               {sortedAndFilteredClaims.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-text-muted">
                        {contract.claims.length > 0 ? 'No claims match your search.' : 'No claims reported for this contract.'}
                    </td>
                </tr>
               )}
            </tbody>
            <tfoot className="bg-bg-muted font-bold">
                <tr>
                    <td className="px-4 py-2" colSpan={2}>Total</td>
                    <td className="px-4 py-2 text-right">{totals.paid.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{totals.reserves.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{totals.incurred.toLocaleString()}</td>
                    <td></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default Claims;