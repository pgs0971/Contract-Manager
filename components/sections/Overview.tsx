

import React from 'react';
import { ReinsuranceContract } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LINES_OF_BUSINESS } from '../../constants';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const Overview: React.FC<Props> = ({ contract, setContract }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContract(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBrokerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setContract(prev => ({
      ...prev,
      parties: {
        ...prev.parties,
        broker: {
          ...prev.parties.broker,
          brokerNumber: value,
        },
      },
    }));
  };

  const umr = contract.parties.broker.brokerNumber
    ? `B${contract.parties.broker.brokerNumber}${contract.contractId}`
    : 'Not Available (Enter Broker No.)';

  return (
    <div className="space-y-6">
      <Card title="Contract Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Contract Title" name="contractTitle" value={contract.contractTitle} onChange={handleChange} required />
          <Input label="Unique Market Reference (UMR)" name="umr" value={umr} readOnly disabled helperText="Generated from Broker No. and Contract ID"/>
          <Input label="Contract ID" name="contractId" value={contract.contractId} onChange={handleChange} />
          <Input label="Broker Number (4 digits)" name="brokerNumber" value={contract.parties.broker.brokerNumber} onChange={handleBrokerNumberChange} maxLength={4} />
          <Select label="Inward/Outward" name="inOutward" value={contract.inOutward} onChange={handleChange}>
            <option>Inward</option>
            <option>Outward</option>
          </Select>
          <Select label="Line of Business" name="lineOfBusiness" value={contract.lineOfBusiness} onChange={handleChange}>
            {LINES_OF_BUSINESS.map(lob => (
              <option key={lob} value={lob}>{lob}</option>
            ))}
          </Select>
          <Input label="Territory" name="territory" value={contract.territory} onChange={handleChange} />
          <Input type="date" label="Inception Date" name="inceptionDate" value={contract.inceptionDate} onChange={handleChange} />
          <Input type="date" label="Expiry Date" name="expiryDate" value={contract.expiryDate} onChange={handleChange} />
        </div>
      </Card>
      <Card title="Legal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Governing Law" name="governingLaw" value={contract.governingLaw} onChange={handleChange} />
            <Input label="Jurisdiction" name="jurisdiction" value={contract.jurisdiction} onChange={handleChange} />
        </div>
      </Card>
    </div>
  );
};

export default Overview;