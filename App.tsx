import React, { useState, useEffect, useMemo } from 'react';
import { ReinsuranceContract, ExchangeRate } from './types';
import { demoSlips } from './data/demoSlips';
import { SECTIONS, INITIAL_RATES, generateBlankContract } from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Section components
import Dashboard from './components/sections/Dashboard';
import Overview from './components/sections/Overview';
import Parties from './components/sections/Parties';
import Cover from './components/sections/Cover';
import Premium from './components/sections/Premium';
import Claims from './components/sections/Claims';
import Attachments from './components/sections/Attachments';
import Compliance from './components/sections/Compliance';
import Notes from './components/sections/Notes';
import ExchangeRates from './components/sections/ExchangeRates';
import Preview from './components/sections/Preview';

const App: React.FC = () => {
  const [contracts, setContracts] = useState<ReinsuranceContract[]>(() => {
    const savedContracts = localStorage.getItem('reinsuranceContracts');
    return savedContracts ? JSON.parse(savedContracts) : demoSlips;
  });

  const [activeContractId, setActiveContractId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('activeContractId');
    const contractList = localStorage.getItem('reinsuranceContracts') 
      ? JSON.parse(localStorage.getItem('reinsuranceContracts')!)
      : demoSlips;
    return savedId && contractList.some((c: ReinsuranceContract) => c.contractId === savedId) ? savedId : contractList[0]?.contractId || null;
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(() => {
    const savedRates = localStorage.getItem('reinsuranceRates');
    return savedRates ? JSON.parse(savedRates) : INITIAL_RATES;
  });

  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0]);
  const [theme, setTheme] = useState(() => localStorage.getItem('reinsuranceTheme') || 'brand');

  const activeContract = useMemo(() => {
    return contracts.find(c => c.contractId === activeContractId) || null;
  }, [contracts, activeContractId]);

  useEffect(() => {
    localStorage.setItem('reinsuranceContracts', JSON.stringify(contracts));
  }, [contracts]);
  
  useEffect(() => {
    if (activeContractId) {
        localStorage.setItem('activeContractId', activeContractId);
    } else {
        localStorage.removeItem('activeContractId');
    }
  }, [activeContractId]);

  useEffect(() => {
    localStorage.setItem('reinsuranceRates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('reinsuranceTheme', theme);
  }, [theme]);
  
  const handleSetContract = (updatedContract: ReinsuranceContract) => {
    setContracts(prev => prev.map(c => c.contractId === updatedContract.contractId ? updatedContract : c));
  };
  
  const handleAddContract = () => {
    const newContract = generateBlankContract();
    setContracts(prev => [...prev, newContract]);
    setActiveContractId(newContract.contractId);
    setActiveSection('Overview');
  };

  const renderSection = () => {
    if (!activeContract) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold text-text-heading">No Contract Selected</h2>
                <p className="mt-2 text-text-muted">
                    Please select a contract from the sidebar, or add a new one to begin.
                </p>
                <button onClick={handleAddContract} className="mt-4 px-4 py-2 bg-brand-secondary text-white rounded-md">
                    Add New Contract
                </button>
            </div>
        );
    }
    
    switch (activeSection) {
      case 'Dashboard':
        return <Dashboard contracts={contracts} exchangeRates={exchangeRates} />;
      case 'Overview':
        return <Overview contract={activeContract} setContract={handleSetContract} />;
      case 'Parties':
        return <Parties contract={activeContract} setContract={handleSetContract} />;
      case 'Cover':
        return <Cover contract={activeContract} setContract={handleSetContract} />;
      case 'Premium':
        return <Premium contract={activeContract} setContract={handleSetContract} />;
      case 'Claims':
        return <Claims contract={activeContract} setContract={handleSetContract} />;
      case 'Attachments':
        return <Attachments contract={activeContract} setContract={handleSetContract} />;
      case 'Compliance':
        return <Compliance contract={activeContract} setContract={handleSetContract} />;
      case 'Notes':
        return <Notes contract={activeContract} setContract={handleSetContract} />;
      case 'Exchange Rates':
        return <ExchangeRates rates={exchangeRates} setRates={setExchangeRates} />;
      case 'Preview':
        return <Preview contract={activeContract} />;
      default:
        return <Dashboard contracts={contracts} exchangeRates={exchangeRates} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-base font-sans">
      <Header />
      <div className="flex" style={{ height: 'calc(100vh - 4rem)'}}>
        <Sidebar 
            contracts={contracts}
            activeContractId={activeContractId}
            setActiveContractId={setActiveContractId}
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            onAddContract={handleAddContract}
            theme={theme}
            setTheme={setTheme}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default App;
