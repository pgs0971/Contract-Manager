import React from 'react';
import { SECTIONS } from '../constants';
import { ReinsuranceContract } from '../types';
import { PaletteIcon, PlusIcon } from './Icons';
import { Button } from './Button';

interface SidebarProps {
  contracts: ReinsuranceContract[];
  activeContractId: string | null;
  setActiveContractId: (id: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAddContract: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  contracts,
  activeContractId,
  setActiveContractId,
  activeSection,
  setActiveSection,
  onAddContract,
  theme,
  setTheme
}) => {
  return (
    <aside className="w-64 bg-bg-sidebar text-text-sidebar flex-shrink-0 no-print flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Contract Sections</h2>
          <nav>
            <ul>
              {SECTIONS.map(section => (
                <li key={section} className="mb-1">
                  <button
                    onClick={() => setActiveSection(section)}
                    disabled={!activeContractId && section !== 'Dashboard' && section !== 'Exchange Rates'}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeSection === section
                        ? 'bg-bg-sidebar-active text-white'
                        : 'hover:bg-bg-sidebar-hover'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="p-4 border-b border-gray-700 space-y-4">
            <div>
              <Button onClick={onAddContract} variant="secondary" className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" /> New Contract
              </Button>
            </div>
            <div>
              <label htmlFor="contract-selector" className="block text-sm font-medium mb-2">Select Contract</label>
              <select
                  id="contract-selector"
                  value={activeContractId || ''}
                  onChange={(e) => setActiveContractId(e.target.value)}
                  className="w-full px-3 py-2 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
              >
                  <option value="" disabled>-- Select a contract --</option>
                  {contracts.map(c => (
                      <option key={c.contractId} value={c.contractId}>{c.contractTitle} ({c.contractId.slice(-4)})</option>
                  ))}
              </select>
            </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-2">
            <PaletteIcon className="w-5 h-5 mr-2" />
            <label htmlFor="theme-selector" className="text-sm font-medium">Theme</label>
        </div>
        <select
          id="theme-selector"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full px-3 py-2 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
        >
          <option value="brand">Brand</option>
          <option value="dark">Dark</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </div>
    </aside>
  );
};
