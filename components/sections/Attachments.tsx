import React, { useState } from 'react';
import { ReinsuranceContract, Attachment } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../Button';
import { PlusIcon, TrashIcon } from '../Icons';

interface Props {
  contract: ReinsuranceContract;
  setContract: React.Dispatch<React.SetStateAction<ReinsuranceContract>>;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const Attachments: React.FC<Props> = ({ contract, setContract }) => {
  const [addType, setAddType] = useState<'url' | 'file'>('url');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            alert(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = ''; // Clear the input
            return;
        }
        setFile(selectedFile);
        if (!name) {
            setName(selectedFile.name);
        }
    }
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleAddAttachment = () => {
    if (!name.trim()) {
        alert('Please provide a name for the attachment.');
        return;
    }

    let newAttachment: Omit<Attachment, 'id'> | null = null;

    if (addType === 'url') {
        if (!url.trim()) {
            alert('Please provide a URL.');
            return;
        }
        try {
            new URL(url); // Validate URL format
        } catch (_) {
            alert('Please enter a valid URL.');
            return;
        }
        newAttachment = { name: name.trim(), type: 'url', data: url.trim() };
    } else {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const finalAttachment: Attachment = {
                id: uuidv4(),
                name: name.trim(),
                type: 'file',
                data: dataUrl,
                fileName: file.name,
                fileType: file.type
            };
            setContract(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), finalAttachment]
            }));
            resetForm();
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            alert("Failed to read the file.");
        };
        reader.readAsDataURL(file);
        return; // Return early as FileReader is async
    }

    if (newAttachment) {
        setContract(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), { ...newAttachment, id: uuidv4() } as Attachment]
        }));
        resetForm();
    }
  };

  const handleDeleteAttachment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
        setContract(prev => ({
            ...prev,
            attachments: prev.attachments.filter(att => att.id !== id)
        }));
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card title="Manage Attachments">
        <div className="p-4 bg-bg-muted border-b border-border-base">
            <h3 className="text-lg font-semibold text-text-heading mb-4">Add New Attachment</h3>
            <div className="flex space-x-4 border-b border-border-base mb-4">
                <button 
                    onClick={() => setAddType('url')}
                    className={`pb-2 font-medium ${addType === 'url' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-text-muted'}`}>
                    Add URL
                </button>
                <button 
                    onClick={() => setAddType('file')}
                    className={`pb-2 font-medium ${addType === 'file' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-text-muted'}`}>
                    Upload File
                </button>
            </div>
            <div className="space-y-4">
                <Input label="Attachment Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Original Slip PDF" />
                {addType === 'url' ? (
                    <Input label="URL" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/document.pdf" />
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1">File</label>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="block w-full text-sm text-text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-brand-secondary hover:file:text-white"/>
                        <p className="mt-1 text-xs text-text-muted">Max file size: {MAX_FILE_SIZE_MB}MB.</p>
                    </div>
                )}
                <div className="text-right">
                    <Button onClick={handleAddAttachment}>
                        <PlusIcon className="w-4 h-4 mr-2"/>
                        Add Attachment
                    </Button>
                </div>
            </div>
        </div>
        
        <div>
           <h3 className="text-lg font-semibold text-text-heading mb-4 px-4">Attached Documents</h3>
           <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-base">
                    <thead className="bg-bg-muted">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Details</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-bg-surface divide-y divide-border-base">
                        {contract.attachments?.map(att => (
                            <tr key={att.id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <a href={att.data} target="_blank" rel="noopener noreferrer" download={att.type === 'file' ? att.fileName : undefined} className="text-sm font-medium text-brand-secondary hover:underline">
                                        {att.name}
                                    </a>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-base">{att.type === 'url' ? 'URL' : 'File'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-muted">
                                    {att.type === 'file' ? `${att.fileName} (${formatBytes(atob(att.data.split(',')[1]).length)})` : 'External Link'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteAttachment(att.id)}>
                                        <TrashIcon className="w-4 h-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {(!contract.attachments || contract.attachments.length === 0) && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-text-muted">No attachments for this contract.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default Attachments;
