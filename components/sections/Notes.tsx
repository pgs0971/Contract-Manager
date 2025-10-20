
import React from 'react';
import { ReinsuranceContract } from '../../types';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Textarea';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const Notes: React.FC<Props> = ({ contract, setContract }) => {

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContract(prev => ({ ...prev, notes: { ...prev.notes, [name]: value } }));
  };

  return (
    <Card title="Contract Notes">
      <Textarea
        label="General Notes"
        name="contractNotes"
        value={contract.notes.contractNotes}
        onChange={handleChange}
        rows={10}
        maxLength={1000}
        helperText="Any additional information, warranties, or subjectivities related to the contract."
      />
    </Card>
  );
};

export default Notes;
