import React from 'react';
import { ReinsuranceContract } from '../../types';
import { Button } from '../Button';
import { PrintIcon } from '../Icons';

interface Props {
  contract: ReinsuranceContract;
}

const Preview: React.FC<Props> = ({ contract }) => {
  
  const handlePrint = () => {
    window.print();
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="mb-8 page-break">
      <h2 className="text-2xl font-bold text-text-heading border-b-2 border-brand-accent pb-2 mb-4">{title}</h2>
      {children}
    </div>
  );

  const renderField = (label: string, value: string | number | undefined) => (
    <div className="flex flex-col sm:flex-row mb-2">
      <p className="w-full sm:w-1/3 font-semibold text-text-base">{label}:</p>
      <p className="w-full sm:w-2/3 text-text-base">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-3xl font-bold text-text-heading">Contract Preview</h1>
        <Button onClick={handlePrint} variant="primary">
            <PrintIcon className="w-5 h-5 mr-2" />
            Print Contract
        </Button>
      </div>

      <div id="print-area" className="p-8 bg-bg-surface rounded-lg shadow-lg border border-border-base printable-area">
        <header className="text-center mb-10 border-b pb-4">
          <h1 className="text-4xl font-extrabold text-text-heading">{contract.contractTitle}</h1>
          <p className="text-lg text-text-muted mt-2">Reinsurance Contract Slip</p>
        </header>

        {renderSection('Key Details', 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderField('Contract ID', contract.contractId)}
                {renderField('Type', contract.inOutward)}
                {renderField('Line of Business', contract.lineOfBusiness)}
                {renderField('Territory', contract.territory)}
                {renderField('Inception Date', contract.inceptionDate)}
                {renderField('Expiry Date', contract.expiryDate)}
                {renderField('Governing Law', contract.governingLaw)}
                {renderField('Jurisdiction', contract.jurisdiction)}
            </div>
        )}

        {renderSection('Parties',
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-text-heading">Client (Cedant)</h3>
              {renderField('Name', contract.parties.client.name)}
              {renderField('Address', contract.parties.client.address)}
              {renderField('Contact', contract.parties.client.contact)}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-text-heading">Broker</h3>
              {renderField('Name', contract.parties.broker.name)}
              {renderField('Address', contract.parties.broker.address)}
              {renderField('Contact', contract.parties.broker.contact)}
            </div>
          </div>
        )}
        
        {renderSection('Cover Terms', 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderField('Cover Type', contract.cover.type)}
                {renderField('Layer / Sum Insured', `${contract.premium.currency} ${contract.cover.layer.toLocaleString()}`)}
                {renderField('Attachment Point', `${contract.premium.currency} ${contract.cover.attachment.toLocaleString()}`)}
                {renderField('Limit', `${contract.premium.currency} ${contract.cover.limit.toLocaleString()}`)}
                {renderField('Deductible', `${contract.premium.currency} ${contract.cover.deductible.toLocaleString()}`)}
                {renderField('Rate on Line (ROL)', `${contract.cover.rol}%`)}
            </div>
        )}

        {renderSection('Premium', 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderField('Currency', contract.premium.currency)}
                {renderField('EPI', contract.premium.epi.toLocaleString())}
                {renderField('Brokerage', `${contract.premium.brokerage}%`)}
                {renderField('Tax', `${contract.premium.tax}%`)}
                {renderField('Payment Terms', contract.premium.paymentTerms)}
                {renderField('SDD', `${contract.premium.sddDays} days`)}
            </div>
        )}
        
        {renderSection('Markets (Reinsurers)',
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="border-b">
                        <tr>
                            <th className="font-semibold p-2">Entity</th>
                            <th className="font-semibold p-2 text-right">Written %</th>
                            <th className="font-semibold p-2 text-right">Signed %</th>
                            <th className="font-semibold p-2">Leader</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contract.parties.reinsurers.map(r => (
                            <tr key={r.id} className="border-b">
                                <td className="p-2">{r.entity}</td>
                                <td className="p-2 text-right">{r.written.toFixed(2)}%</td>
                                <td className="p-2 text-right">{r.signed.toFixed(2)}%</td>
                                <td className="p-2">{r.isLeader ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold">
                            <td className="p-2">Total</td>
                            <td className="p-2 text-right">{contract.parties.reinsurers.reduce((s, r) => s + r.written, 0).toFixed(2)}%</td>
                            <td className="p-2 text-right">{contract.parties.reinsurers.reduce((s, r) => s + r.signed, 0).toFixed(2)}%</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        )}

        {contract.claims.length > 0 && renderSection('Claims Summary',
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="border-b">
                        <tr>
                            <th className="font-semibold p-2">Claim Ref</th>
                            <th className="font-semibold p-2">Loss Date</th>
                            <th className="font-semibold p-2 text-right">Paid</th>
                            <th className="font-semibold p-2 text-right">Reserves</th>
                            <th className="font-semibold p-2 text-right">Incurred</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contract.claims.map(c => (
                            <tr key={c.id} className="border-b">
                                <td className="p-2">{c.claimRef}</td>
                                <td className="p-2">{c.lossDate}</td>
                                <td className="p-2 text-right">{c.paid.toLocaleString()}</td>
                                <td className="p-2 text-right">{c.reserves.toLocaleString()}</td>
                                <td className="p-2 text-right font-semibold">{(c.paid + c.reserves).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold border-t-2">
                            <td className="p-2" colSpan={2}>Total</td>
                            <td className="p-2 text-right">{contract.claims.reduce((s, c) => s + c.paid, 0).toLocaleString()}</td>
                            <td className="p-2 text-right">{contract.claims.reduce((s, c) => s + c.reserves, 0).toLocaleString()}</td>
                            <td className="p-2 text-right">{contract.claims.reduce((s, c) => s + c.paid + c.reserves, 0).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        )}

        {contract.attachments?.length > 0 && renderSection('Attachments',
            <ul>
                {contract.attachments.map(att => (
                    <li key={att.id} className="mb-2">
                        <span className="font-semibold">{att.name}:</span> 
                        <span className="text-text-muted ml-2">
                            {att.type === 'url' ? att.data : att.fileName}
                        </span>
                    </li>
                ))}
            </ul>
        )}
        
        {renderSection('Notes',
            <p className="whitespace-pre-wrap">{contract.notes.contractNotes}</p>
        )}
        
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .printable-area, .printable-area * {
                    visibility: visible;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    border: none;
                    box-shadow: none;
                    margin: 0;
                    padding: 0;
                }
                .no-print {
                    display: none;
                }
                .page-break {
                    page-break-inside: avoid;
                }
            }
        `}</style>

      </div>
    </div>
  );
};

export default Preview;