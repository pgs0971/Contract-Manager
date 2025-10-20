import React from 'react';
import { ReinsuranceContract } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const Compliance: React.FC<Props> = ({ contract, setContract }) => {
  const handleToggle = () => {
    setContract(prev => ({
      ...prev,
      compliance: {
        ...prev.compliance,
        sanctionsChecked: !prev.compliance.sanctionsChecked,
      },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContract(prev => ({
      ...prev,
      compliance: {
        ...prev.compliance,
        screeningReference: e.target.value,
      },
    }));
  };

  return (
    <Card title="Compliance & Sanctions">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="sanctions-toggle" className="text-sm font-medium text-text-base">Sanctions Check Status:</label>
          <button
            id="sanctions-toggle"
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary ${
              contract.compliance.sanctionsChecked ? 'bg-success' : 'bg-border-input'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                contract.compliance.sanctionsChecked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold ${contract.compliance.sanctionsChecked ? 'text-success-text' : 'text-text-muted'}`}>
            {contract.compliance.sanctionsChecked ? 'PASS' : 'PENDING'}
          </span>
        </div>
        <Input
          label="Screening Evidence / Reference"
          name="screeningReference"
          value={contract.compliance.screeningReference}
          onChange={handleChange}
          helperText="Enter reference number from screening system."
        />
      </div>
    </Card>
  );
};

export default Compliance;