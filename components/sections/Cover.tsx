
import React, { useMemo } from 'react';
import { ReinsuranceContract } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const Cover: React.FC<Props> = ({ contract, setContract }) => {

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setContract(prev => ({ ...prev, cover: { ...prev.cover, [name]: val } }));
  };
  
  const handleReinstatementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setContract(prev => ({
      ...prev,
      cover: {
        ...prev.cover,
        reinstatements: {
          ...prev.cover.reinstatements,
          [name]: val,
        },
      },
    }));
  };

  const calculatedRol = useMemo(() => {
    if (contract.cover.limit > 0) {
      return ((contract.premium.epi / contract.cover.limit) * 100).toFixed(2);
    }
    return 'N/A';
  }, [contract.premium.epi, contract.cover.limit]);
  
  const totalReinstatementPremium = useMemo(() => {
    const { claims, cover, premium } = contract;
    if (cover.reinstatements.type === 'Free' || cover.limit <= 0) {
      return 0;
    }

    const totalPaid = claims.reduce((sum, claim) => sum + claim.paid, 0);
    const limitAvailableToReinstate = cover.limit * cover.reinstatements.count;
    const amountToReinstate = Math.min(totalPaid, limitAvailableToReinstate);

    if (amountToReinstate <= 0) {
      return 0;
    }

    const reinstatementRatio = amountToReinstate / cover.limit;

    if (cover.reinstatements.type === 'Pro-rata') {
      return reinstatementRatio * premium.epi;
    }

    if (cover.reinstatements.type === 'With AP') {
      return reinstatementRatio * premium.epi * (cover.reinstatements.charge / 100);
    }

    return 0;
  }, [contract]);

  const totalClaimsPaid = useMemo(() => contract.claims.reduce((sum, c) => sum + c.paid, 0), [contract.claims]);


  return (
    <div className="space-y-6">
      <Card title="Cover Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Select label="Cover Type" name="type" value={contract.cover.type} onChange={handleCoverChange}>
            <option>Proportional</option>
            <option>Non-Proportional</option>
          </Select>
          <Input type="number" label="Layer / Sum Insured" name="layer" value={contract.cover.layer} onChange={handleCoverChange} />
          <Input type="number" label="Attachment Point" name="attachment" value={contract.cover.attachment} onChange={handleCoverChange} disabled={contract.cover.type === 'Proportional'}/>
          <Input type="number" label="Limit" name="limit" value={contract.cover.limit} onChange={handleCoverChange} disabled={contract.cover.type === 'Proportional'}/>
          <Input type="number" label="Deductible" name="deductible" value={contract.cover.deductible} onChange={handleCoverChange} />
          <Input type="number" label="Rate on Line (ROL) %" name="rol" value={contract.cover.rol} onChange={handleCoverChange} helperText={`Calculated: ${calculatedRol}%`} />
        </div>
      </Card>
      <Card title="Reinstatements">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input type="number" label="Number of Reinstatements" name="count" value={contract.cover.reinstatements.count} onChange={handleReinstatementChange} />
          <Select label="Reinstatement Type" name="type" value={contract.cover.reinstatements.type} onChange={handleReinstatementChange}>
            <option>Free</option>
            <option>Pro-rata</option>
            <option>With AP</option>
          </Select>
          <Input
            type="number"
            label="Charge %"
            name="charge"
            value={contract.cover.reinstatements.charge}
            onChange={handleReinstatementChange}
            disabled={contract.cover.reinstatements.type === 'Free'}
            helperText="100% for 'With AP' is typical"
          />
        </div>
        <div className="mt-6 pt-4 border-t border-border-base">
            <h4 className="text-md font-semibold text-text-heading">Calculated Reinstatement Premium</h4>
            <p className="text-2xl font-bold text-text-accent mt-2">
                {totalReinstatementPremium.toLocaleString(undefined, { style: 'currency', currency: contract.premium.currency })}
            </p>
            <p className="text-xs text-text-muted mt-1">
                Based on total claims paid of {totalClaimsPaid.toLocaleString(undefined, { style: 'currency', currency: contract.premium.currency })} and reinstatement terms.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default Cover;
