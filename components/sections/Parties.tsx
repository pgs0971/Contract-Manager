import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReinsuranceContract, Reinsurer } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../Button';
import { PlusIcon, TrashIcon, EditIcon, SaveIcon, CancelIcon } from '../Icons';
import { useSortableTable } from '../../hooks/useSortableTable';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const initialReinsurerState: Reinsurer = { id: '', entity: '', security: 100, written: 0, signed: 0, isLeader: false };

const Parties: React.FC<Props> = ({ contract, setContract }) => {
  const [newReinsurer, setNewReinsurer] = useState<Reinsurer>(initialReinsurerState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handlePartyChange = (party: 'client' | 'broker', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContract(prev => ({
      ...prev,
      parties: {
        ...prev.parties,
        [party]: {
          ...prev.parties[party],
          [name]: value,
        },
      },
    }));
  };

  const handleReinsurerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value;
    setNewReinsurer(prev => ({ ...prev, [name]: val }));
  };

  const handleAddReinsurer = () => {
    if (!newReinsurer.entity || newReinsurer.written <= 0) {
      alert('Please fill in at least the entity name and a written share > 0.');
      return;
    }
    const finalReinsurer = { ...newReinsurer, id: uuidv4() };
    setContract(prev => ({
      ...prev,
      parties: {
        ...prev.parties,
        reinsurers: [...prev.parties.reinsurers, finalReinsurer],
      },
    }));
    setNewReinsurer(initialReinsurerState);
  };
  
  const handleUpdateReinsurer = () => {
    if (!editingId) return;
    setContract(prev => ({
        ...prev,
        parties: {
            ...prev.parties,
            reinsurers: prev.parties.reinsurers.map(r => r.id === editingId ? { ...newReinsurer, id: editingId } : r),
        },
    }));
    setEditingId(null);
    setNewReinsurer(initialReinsurerState);
  };

  const handleDeleteReinsurer = (id: string) => {
    if (window.confirm('Are you sure you want to remove this reinsurer?')) {
      setContract(prev => ({
        ...prev,
        parties: {
          ...prev.parties,
          reinsurers: prev.parties.reinsurers.filter(r => r.id !== id),
        },
      }));
    }
  };
  
  const startEditing = (reinsurer: Reinsurer) => {
      setEditingId(reinsurer.id);
      setNewReinsurer(reinsurer);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setNewReinsurer(initialReinsurerState);
  };

  const filteredReinsurers = useMemo(() => {
    if (!searchTerm) {
        return contract.parties.reinsurers;
    }
    return contract.parties.reinsurers.filter(reinsurer =>
        reinsurer.entity.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contract.parties.reinsurers, searchTerm]);

  const { sortedItems: sortedAndFilteredReinsurers, requestSort, getSortIcon } = useSortableTable<Reinsurer>(
    filteredReinsurers,
    { key: 'signed', direction: 'descending' }
  );

  const totalWritten = contract.parties.reinsurers.reduce((sum, r) => sum + r.written, 0);
  const totalSigned = contract.parties.reinsurers.reduce((sum, r) => sum + r.signed, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Client (Cedant)">
          <div className="space-y-4">
            <Input label="Client Name" name="name" value={contract.parties.client.name} onChange={(e) => handlePartyChange('client', e)} />
            <Textarea label="Client Address" name="address" value={contract.parties.client.address} onChange={(e) => handlePartyChange('client', e)} />
            <Input label="Client Contact" name="contact" value={contract.parties.client.contact} onChange={(e) => handlePartyChange('client', e)} />
          </div>
        </Card>
        <Card title="Broker">
          <div className="space-y-4">
            <Input label="Broker Name" name="name" value={contract.parties.broker.name} onChange={(e) => handlePartyChange('broker', e)} />
            <Textarea label="Broker Address" name="address" value={contract.parties.broker.address} onChange={(e) => handlePartyChange('broker', e)} />
            <Input label="Broker Contact" name="contact" value={contract.parties.broker.contact} onChange={(e) => handlePartyChange('broker', e)} />
          </div>
        </Card>
      </div>
      <Card title="Markets (Reinsurers)">
        <div className="mb-4">
          <Input 
            label="Search Markets"
            placeholder="Filter by entity name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-base">
            <thead className="bg-bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('entity')}>
                    <div className="flex items-center">Entity {getSortIcon('entity')}</div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('written')}>
                    <div className="flex items-center">Written % {getSortIcon('written')}</div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('signed')}>
                    <div className="flex items-center">Signed % {getSortIcon('signed')}</div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase cursor-pointer" onClick={() => requestSort('isLeader')}>
                    <div className="flex items-center">Leader {getSortIcon('isLeader')}</div>
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-bg-surface divide-y divide-border-base">
              {sortedAndFilteredReinsurers.map(r => (
                editingId === r.id ? (
                  <tr key={r.id}>
                    <td className="p-2"><Input name="entity" value={newReinsurer.entity} onChange={handleReinsurerChange} label="" /></td>
                    <td className="p-2"><Input type="number" name="written" value={newReinsurer.written} onChange={handleReinsurerChange} label="" /></td>
                    <td className="p-2"><Input type="number" name="signed" value={newReinsurer.signed} onChange={handleReinsurerChange} label="" /></td>
                    <td className="p-2"><input type="checkbox" name="isLeader" checked={newReinsurer.isLeader} onChange={handleReinsurerChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
                    <td className="p-2 whitespace-nowrap text-center">
                      <Button onClick={handleUpdateReinsurer} size="sm" variant="icon"><SaveIcon className="w-5 h-5 text-success" /></Button>
                      <Button onClick={cancelEditing} size="sm" variant="icon"><CancelIcon className="w-5 h-5 text-danger" /></Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.entity}</td>
                    <td className="px-4 py-3">{r.written.toFixed(2)}%</td>
                    <td className="px-4 py-3">{r.signed.toFixed(2)}%</td>
                    <td className="px-4 py-3">{r.isLeader ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <Button onClick={() => startEditing(r)} size="sm" variant="icon"><EditIcon className="w-5 h-5" /></Button>
                      <Button onClick={() => handleDeleteReinsurer(r.id)} size="sm" variant="icon"><TrashIcon className="w-5 h-5 text-danger" /></Button>
                    </td>
                  </tr>
                )
              ))}
                {!editingId && (
                    <tr className="bg-bg-muted/50">
                        <td className="p-2"><Input label="" name="entity" value={newReinsurer.entity} onChange={handleReinsurerChange} placeholder="Reinsurer Name" /></td>
                        <td className="p-2"><Input label="" type="number" name="written" value={newReinsurer.written} onChange={handleReinsurerChange} placeholder="0.00" /></td>
                        <td className="p-2"><Input label="" type="number" name="signed" value={newReinsurer.signed} onChange={handleReinsurerChange} placeholder="0.00" /></td>
                        <td className="p-2 text-center"><input type="checkbox" name="isLeader" checked={newReinsurer.isLeader} onChange={handleReinsurerChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                        <td className="p-2 text-center">
                            <Button onClick={handleAddReinsurer} size="sm" variant="secondary"><PlusIcon className="w-4 h-4 mr-1" /> Add</Button>
                        </td>
                    </tr>
                )}
            </tbody>
            <tfoot className="bg-bg-muted">
              <tr className="font-bold">
                <td className="px-4 py-2">Total</td>
                <td className={`px-4 py-2 ${totalWritten.toFixed(2) !== '100.00' ? 'text-danger-text' : ''}`}>{totalWritten.toFixed(2)}%</td>
                <td className={`px-4 py-2 ${totalSigned.toFixed(2) !== '100.00' ? 'text-danger-text' : ''}`}>{totalSigned.toFixed(2)}%</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Parties;