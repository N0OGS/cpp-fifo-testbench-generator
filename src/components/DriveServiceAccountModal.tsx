import React, { useState } from 'react';
import { X, Cloud, Key, CheckCircle, Copy, Check, AlertCircle, FileText } from 'lucide-react';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
}

export const DriveServiceAccountModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  folderId,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const exampleKey = `{
  "type": "service_account",
  "project_id": "silicon-verification-project",
  "private_key_id": "abcd1234efgh5678ijkl9012mnop3456",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "fifo-tb-bot@silicon-verification-project.iam.gserviceaccount.com",
  "client_id": "109876543210987654321",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}`;

  const copyKey = () => {
    navigator.clipboard.writeText(exampleKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyCmd = () => {
    navigator.clipboard.writeText('node index.js');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Google Drive API & Service Account Setup
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous verification pipeline upload authentication
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-400 uppercase text-[11px] tracking-wider block mb-1 font-sans font-semibold">
              Step 1: Service Account JSON Credentials
            </span>
            <p className="text-slate-400 font-sans leading-relaxed mb-2">
              Place your Google Cloud Service Account key as <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">service-account.json</code> in the project root directory.
            </p>
            <div className="relative">
              <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-40">
                {exampleKey}
              </pre>
              <button
                onClick={copyKey}
                className="absolute right-2 top-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'Copied' : 'Copy Sample'}</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[11px] tracking-wider block mb-1 font-sans font-semibold">
              Step 2: Google Drive Folder Permissions
            </span>
            <p className="text-slate-400 font-sans leading-relaxed">
              Open your target Google Drive folder, click <strong>Share</strong>, and add your service account email (e.g. <code className="text-blue-300 bg-slate-950 px-1 rounded">fifo-tb-bot@...iam.gserviceaccount.com</code>) with <strong>Editor</strong> permissions.
            </p>
            <div className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Current GOOGLE_DRIVE_FOLDER_ID:</span>
              <span className="text-emerald-300 font-bold">{folderId || 'Configured via .env'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[11px] tracking-wider block mb-1 font-sans font-semibold">
              Step 3: Run the Autonomous Node.js CLI Pipeline
            </span>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <code className="text-emerald-400 font-bold">$ node index.js</code>
              <button
                onClick={copyCmd}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
