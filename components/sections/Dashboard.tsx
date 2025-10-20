import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ReinsuranceContract, ExchangeRate } from '../../types';
import { Card } from '../ui/Card';
import { PieChart } from '../ui/PieChart';
import { ChevronDownIcon } from '../Icons';

interface Props {
  contracts: ReinsuranceContract[];
  exchangeRates: ExchangeRate[];
}

const Dashboard: React.FC<Props> = ({ contracts, exchangeRates }) => {
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>(() => contracts.map(c => c.contractId));
  const [isOpen, setIsOpen] = useState(false);
  const [consolidatedView, setConsolidatedView] = useState(false);
  const [reportingCurrency, setReportingCurrency] = useState('USD');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Resync selection if the underlying contracts list changes
  useEffect(() => {
    setSelectedContractIds(prev => prev.filter(id => contracts.some(c => c.contractId === id)));
  }, [contracts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSelectAll = () => {
    if (selectedContractIds.length === contracts.length) {
      setSelectedContractIds([]);
    } else {
      setSelectedContractIds(contracts.map(c => c.contractId));
    }
  };

  const handleContractSelection = (contractId: string) => {
    setSelectedContractIds(prev =>
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const contractsToDisplay = useMemo(() => {
    return contracts.filter(c => selectedContractIds.includes(c.contractId));
  }, [contracts, selectedContractIds]);
  
  const getRate = (from: string, to: string) => {
    if (from === to) return 1;
    const rate = exchangeRates.find(r => r.from === from && r.to === to);
    return rate?.rate;
  }

  const consolidatedMetrics = useMemo(() => {
    if (!consolidatedView) return null;

    const metrics = { epi: 0, incurred: 0, missingRates: new Set<string>() };
    
    contractsToDisplay.forEach(c => {
        const rate = getRate(c.premium.currency, reportingCurrency);
        if (rate) {
            metrics.epi += c.premium.epi * rate;
            const contractIncurred = c.claims.reduce((sum, claim) => sum + claim.paid + claim.reserves, 0);
            metrics.incurred += contractIncurred * rate;
        } else {
            if (c.premium.currency !== reportingCurrency) {
              metrics.missingRates.add(c.premium.currency);
            } else {
              // Same currency, no conversion needed
              metrics.epi += c.premium.epi;
              const contractIncurred = c.claims.reduce((sum, claim) => sum + claim.paid + claim.reserves, 0);
              metrics.incurred += contractIncurred;
            }
        }
    });

    return {
        ...metrics,
        lossRatio: metrics.epi > 0 ? (metrics.incurred / metrics.epi) * 100 : 0,
    };
  }, [contractsToDisplay, consolidatedView, reportingCurrency, exchangeRates]);

  const keyMetricsByCurrency = useMemo(() => {
    const metrics: { [currency: string]: { epi: number; incurred: number; count: number } } = {};

    contractsToDisplay.forEach(c => {
      if (!metrics[c.premium.currency]) {
        metrics[c.premium.currency] = { epi: 0, incurred: 0, count: 0 };
      }
      metrics[c.premium.currency].epi += c.premium.epi;
      const contractIncurred = c.claims.reduce((sum, claim) => sum + claim.paid + claim.reserves, 0);
      metrics[c.premium.currency].incurred += contractIncurred;
      metrics[c.premium.currency].count += 1;
    });

    return Object.entries(metrics).map(([currency, data]) => ({
      currency,
      ...data,
      lossRatio: data.epi > 0 ? (data.incurred / data.epi) * 100 : 0,
    }));
  }, [contractsToDisplay]);

  const marketShareData = useMemo(() => {
    if (contractsToDisplay.length !== 1) return [];
    return contractsToDisplay[0].parties.reinsurers
      .map((r) => ({
        label: r.entity,
        value: r.signed,
      }))
      .sort((a, b) => b.value - a.value);
  }, [contractsToDisplay]);

  const premiumCompositionData = useMemo(() => {
    if (contractsToDisplay.length !== 1) return [];
    const { epi, brokerage, tax } = contractsToDisplay[0].premium;
    const brokerageAmount = (epi * brokerage) / 100;
    const taxAmount = (epi * tax) / 100;
    const netPremium = epi - brokerageAmount - taxAmount;
    return [
      { label: 'Net Premium', value: netPremium },
      { label: 'Brokerage', value: brokerageAmount },
      { label: 'Tax', value: taxAmount },
    ].filter(d => d.value > 0);
  }, [contractsToDisplay]);
  
  const formatCurrency = (value: number, currency: string) => {
    return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getSelectionText = () => {
    if (selectedContractIds.length === contracts.length) return 'All Contracts';
    if (selectedContractIds.length === 1) {
        const selected = contracts.find(c => c.contractId === selectedContractIds[0]);
        return selected?.contractTitle || '1 Contract Selected';
    }
    if (selectedContractIds.length === 0) return 'No Contracts Selected';
    return `${selectedContractIds.length} Contracts Selected`;
  };

  const chartColorClasses = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'];

  return (
    <div className="space-y-6">
      <Card title="Dashboard Filter">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="max-w-md" ref={dropdownRef}>
              <label className="block text-sm font-medium text-text-base mb-1">Select Contracts</label>
              <div className="relative">
                  <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full px-3 py-2 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm text-left flex justify-between items-center"
                  >
                      <span>{getSelectionText()}</span>
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-bg-surface border border-border-base rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-border-base">
                              <label className="flex items-center space-x-2 px-2 py-1 hover:bg-bg-muted rounded-md cursor-pointer">
                                  <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                                      checked={selectedContractIds.length === contracts.length}
                                      onChange={handleToggleSelectAll}
                                  />
                                  <span className="font-semibold">Select All</span>
                              </label>
                          </div>
                          <div className="p-2">
                              {contracts.map(c => (
                                  <label key={c.contractId} className="flex items-center space-x-2 px-2 py-1 hover:bg-bg-muted rounded-md cursor-pointer">
                                      <input
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                                          checked={selectedContractIds.includes(c.contractId)}
                                          onChange={() => handleContractSelection(c.contractId)}
                                      />
                                      <span>{c.contractTitle}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
                <label htmlFor="consolidated-toggle" className="mr-2 text-sm font-medium text-text-base">Consolidated View:</label>
                <button
                    id="consolidated-toggle"
                    onClick={() => setConsolidatedView(!consolidatedView)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${consolidatedView ? 'bg-brand-secondary' : 'bg-border-input'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${consolidatedView ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
            {consolidatedView && (
              <div>
                <label htmlFor="reporting-currency" className="block text-sm font-medium text-text-base mb-1">Reporting Currency</label>
                <select id="reporting-currency" value={reportingCurrency} onChange={e => setReportingCurrency(e.target.value)}
                  className="px-3 py-1.5 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm sm:text-sm"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {consolidatedView && consolidatedMetrics && (
        <div>
            <h2 className="text-xl font-semibold text-text-heading mb-3">Consolidated Metrics ({reportingCurrency})</h2>
            {consolidatedMetrics.missingRates.size > 0 && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm">
                <strong>Warning:</strong> Missing exchange rate for {Array.from(consolidatedMetrics.missingRates).join(', ')}. Contracts with these currencies are excluded from totals.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title={`EPI (${reportingCurrency})`}>
                    <p className="text-3xl font-bold text-text-heading">{formatCurrency(consolidatedMetrics.epi, reportingCurrency)}</p>
                </Card>
                <Card title={`Incurred (${reportingCurrency})`}>
                    <p className="text-3xl font-bold text-text-heading">{formatCurrency(consolidatedMetrics.incurred, reportingCurrency)}</p>
                </Card>
                <Card title="Loss Ratio">
                    <p className={`text-3xl font-bold ${consolidatedMetrics.lossRatio > 70 ? 'text-danger-text' : 'text-success-text'}`}>
                    {consolidatedMetrics.lossRatio.toFixed(2)}%
                    </p>
                </Card>
            </div>
        </div>
      )}

      {!consolidatedView && keyMetricsByCurrency.map(({ currency, epi, incurred, lossRatio, count }) => (
        <div key={currency}>
            <h2 className="text-xl font-semibold text-text-heading mb-3">
                Metrics for {currency}
                {contractsToDisplay.length > 1 && <span className="text-base font-normal text-text-muted"> (from {count} contracts)</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="EPI">
                    <p className="text-3xl font-bold text-text-heading">{formatCurrency(epi, currency)}</p>
                </Card>
                <Card title="Total Incurred Claims">
                    <p className="text-3xl font-bold text-text-heading">{formatCurrency(incurred, currency)}</p>
                </Card>
                <Card title="Loss Ratio">
                    <p className={`text-3xl font-bold ${lossRatio > 70 ? 'text-danger-text' : 'text-success-text'}`}>
                    {lossRatio.toFixed(2)}%
                    </p>
                </Card>
                <Card title="Markets">
                    <p className="text-3xl font-bold text-text-heading">
                        {contractsToDisplay.reduce((sum, c) => sum + (c.premium.currency === currency ? c.parties.reinsurers.length : 0), 0)}
                    </p>
                </Card>
            </div>
        </div>
      ))}
       {!consolidatedView && keyMetricsByCurrency.length === 0 && (
            <div className="text-center py-10 text-text-muted">
                <p>No contracts selected or no data to display.</p>
            </div>
        )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Market Share">
            {contractsToDisplay.length === 1 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                        <PieChart data={marketShareData} />
                    </div>
                    <div className="w-full">
                        <ul className="space-y-2">
                            {marketShareData.slice(0, 5).map((item, index) => (
                                <li key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 bg-${chartColorClasses[index % chartColorClasses.length]}`}></span>
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="font-semibold">{item.value.toFixed(2)}%</span>
                                </li>
                            ))}
                            {marketShareData.length > 5 && (
                                <li className="text-sm text-text-muted">...and {marketShareData.length - 5} more.</li>
                            )}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 text-text-muted">
                    {selectedContractIds.length === 0 ? 'No contract selected.' : 'Select a single contract to view market share.'}
                </div>
            )}
        </Card>

        <Card title="Premium Composition">
           {contractsToDisplay.length === 1 ? (
               <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                        <PieChart data={premiumCompositionData} />
                    </div>
                    <div className="w-full">
                        <ul className="space-y-2">
                            {premiumCompositionData.map((item, index) => (
                                <li key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 bg-${chartColorClasses[index % chartColorClasses.length]}`}></span>
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="font-semibold">{formatCurrency(item.value, contractsToDisplay[0].premium.currency)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
           ) : (
               <div className="flex items-center justify-center h-48 text-text-muted">
                   {selectedContractIds.length === 0 ? 'No contract selected.' : 'Select a single contract to view premium composition.'}
               </div>
           )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
