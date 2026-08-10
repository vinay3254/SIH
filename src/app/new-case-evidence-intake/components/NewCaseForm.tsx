'use client';
import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronLeft,
  Shield,
  Info,
  Loader2,
  File,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

// ─── Zod schema ──────────────────────────────────────────────────────────────
const onionAddressSchema = z.object({
  address: z
    .string()
    .min(1, 'Onion address is required')
    .regex(
      /^[a-z2-7]{56}\.onion$|^[a-z2-7]{16}\.onion$/i,
      'Invalid onion address format (v3: 56 chars, v2: 16 chars before .onion)'
    ),
});

const newCaseSchema = z.object({
  caseName: z
    .string()
    .min(3, 'Case name must be at least 3 characters')
    .max(80, 'Case name cannot exceed 80 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  onionAddresses: z
    .array(onionAddressSchema)
    .min(1, 'At least one onion address is required')
    .max(10, 'Maximum 10 onion addresses per case'),
  assignedAnalyst: z.string().min(1, 'Analyst assignment is required'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  classification: z.enum(['Top Secret', 'Secret', 'Confidential', 'Unclassified']),
  caseNotes: z.string().max(5000, 'Case notes cannot exceed 5000 characters').optional(),
  supervisorApproval: z.string().min(1, 'Supervisor approval reference is required'),
  legalAuthority: z.string().min(1, 'Legal authority / warrant reference is required'),
});

type NewCaseFormData = z.infer<typeof newCaseSchema>;

// ─── Mock data ───────────────────────────────────────────────────────────────
const analysts = [
  { id: 'analyst-reyes', name: 'SA Reyes, Marcus', unit: 'Cyber Crimes Unit' },
  { id: 'analyst-chen', name: 'SA Chen, Wei', unit: 'Cyber Crimes Unit' },
  { id: 'analyst-okonkwo', name: 'SA Okonkwo, Adaeze', unit: 'Digital Forensics' },
  { id: 'analyst-petrov', name: 'SA Petrov, Dmitri', unit: 'Dark Web Task Force' },
  { id: 'analyst-hassan', name: 'SA Hassan, Farah', unit: 'Dark Web Task Force' },
  { id: 'analyst-nakamura', name: 'SA Nakamura, Kenji', unit: 'Cyber Crimes Unit' },
];

const ACCEPTED_TYPES = ['.pcap', '.pcapng', '.json', '.csv', '.log', '.txt'];
const MAX_FILE_SIZE_MB = 2048; // 2 GB

interface UploadedFile {
  id: string;
  file: File;
  status: 'validating' | 'valid' | 'invalid' | 'uploading' | 'uploaded';
  error?: string;
  progress?: number;
}

// ─── File size formatter ─────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── File type icon ──────────────────────────────────────────────────────────
function fileTypeColor(name: string): string {
  if (name.endsWith('.pcap') || name.endsWith('.pcapng')) return '#60a5fa';
  if (name.endsWith('.json')) return '#f59e0b';
  if (name.endsWith('.csv')) return '#28CD41';
  return 'var(--color-accent)';
}

// ─── Evidence Uploader ───────────────────────────────────────────────────────
function EvidenceUploader({
  files,
  onFilesAdded,
  onFileRemove,
}: {
  files: UploadedFile[];
  onFilesAdded: (newFiles: File[]) => void;
  onFileRemove: (id: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      onFilesAdded(dropped);
    },
    [onFilesAdded]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onFilesAdded(selected);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-[980px] border-2 border-dashed p-8 text-center transition-all duration-200 ${isDragging ? 'drop-zone-active' : ''}`}
        style={{
          borderColor: isDragging ? 'var(--color-accent)' : 'rgba(0,113,227,0.3)',
          background: isDragging ? 'rgba(0,113,227,0.08)' : 'rgba(0,113,227,0.04)',
        }}
        role="region"
        aria-label="Evidence file upload area"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(142,182,155,0.12)' }}
          >
            <Upload size={24} style={{ color: '#1D1D1F', fontSize: '13px', fontWeight: 500 }} />
          </div>
          <div>
            <p className="text-sm font-600 mb-1" style={{ color: '#1D1D1F', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Drop evidence files here
            </p>
            <p className="text-xs" style={{ color: '#6E6E73' }}>
              or{' '}
              <label
                htmlFor="file-input"
                className="font-600 cursor-pointer underline underline-offset-2"
                style={{ color: '#1D1D1F', fontSize: '13px', fontWeight: 500 }}
              >
                browse to upload
              </label>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {ACCEPTED_TYPES.map((t) => (
              <span
                key={`filetype-${t}`}
                className="text-2xs px-2 py-0.5 rounded font-mono font-500"
                style={{
                  background: 'rgba(142,182,155,0.12)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(142,182,155,0.2)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-2xs" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
            Max file size: 2 GB per file
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          className="sr-only"
          aria-label="Upload evidence files"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uf) => (
            <div
              key={uf.id}
              className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-150"
              style={{
                background: 'rgba(142,182,155,0.04)',
                borderColor:
                  uf.status === 'invalid' ?'rgba(239,68,68,0.3)'
                    : uf.status === 'valid'|| uf.status === 'uploaded' ?'rgba(74,222,128,0.2)' :'rgba(142,182,155,0.15)',
              }}
            >
              {/* File icon */}
              <div
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: `${fileTypeColor(uf.file.name)}1a` }}
              >
                <File size={16} style={{ color: fileTypeColor(uf.file.name) }} />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-xs font-600 truncate"
                    style={{ color: '#1D1D1F', fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {uf.file.name}
                  </p>
                  {/* Status badge */}
                  {uf.status === 'valid' && (
                    <span className="flex items-center gap-1 text-2xs" style={{ color: '#28CD41' }}>
                      <CheckCircle2 size={11} />
                      Valid
                    </span>
                  )}
                  {uf.status === 'invalid' && (
                    <span className="flex items-center gap-1 text-2xs" style={{ color: '#FF3B30' }}>
                      <AlertCircle size={11} />
                      Invalid
                    </span>
                  )}
                  {uf.status === 'validating' && (
                    <span className="flex items-center gap-1 text-2xs" style={{ color: '#f59e0b' }}>
                      <Loader2 size={11} className="animate-spin-slow" />
                      Validating
                    </span>
                  )}
                  {uf.status === 'uploaded' && (
                    <span className="flex items-center gap-1 text-2xs" style={{ color: '#28CD41' }}>
                      <CheckCircle2 size={11} />
                      Ingested
                    </span>
                  )}
                </div>
                <p className="text-2xs mt-0.5" style={{ color: '#6E6E73' }}>
                  {formatFileSize(uf.file.size)}
                  {uf.error && (
                    <span className="ml-2" style={{ color: '#FF3B30' }}>
                      · {uf.error}
                    </span>
                  )}
                </p>
                {/* Upload progress bar */}
                {uf.status === 'uploading' && uf.progress !== undefined && (
                  <div
                    className="mt-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(142,182,155,0.15)', height: '3px' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${uf.progress}%`,
                        background: 'var(--color-accent)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onFileRemove(uf.id)}
                className="p-1.5 rounded flex-shrink-0 transition-all duration-150"
                style={{ color: '#6E6E73' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#FF3B30';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
                }}
                aria-label={`Remove ${uf.file.name}`}
                title={`Remove ${uf.file.name} from upload queue`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chain of custody notice */}
      <div
        className="flex items-start gap-2 p-3 rounded-lg text-xs"
        style={{
          background: 'rgba(0,113,227,0.08)',
          border: '1px solid rgba(142,182,155,0.15)',
        }}
      >
        <Shield size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#1D1D1F', fontSize: '13px', fontWeight: 500 }} />
        <p style={{ color: '#6E6E73' }}>
          <span className="font-600" style={{ color: '#1D1D1F', fontSize: '13px', fontWeight: 500 }}>
            Chain-of-Custody Notice:{' '}
          </span>
          All uploaded evidence files are hashed (SHA-256) on ingestion and logged immutably. File metadata including uploader identity, timestamp, and hash are appended to the case audit trail. Evidence cannot be modified after ingestion — only superseded by a new version with a new audit entry.
        </p>
      </div>
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-700 flex-shrink-0"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--color-highlight)',
          border: '1px solid rgba(218,241,222,0.2)',
        }}
      >
        {number}
      </div>
      <div>
        <h2 className="text-base font-600" style={{ color: '#1D1D1F', fontWeight: 600, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#6E6E73' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-600 mb-1 tracking-wide"
        style={{ color: '#1D1D1F', fontSize: '13px', fontWeight: 500 }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: '#FF3B30' }} aria-label="required">
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="text-2xs mb-1.5" style={{ color: 'var(--muted-foreground)', opacity: 0.8 }}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#FF3B30' }} role="alert">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main form component ─────────────────────────────────────────────────────
export function NewCaseForm() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<NewCaseFormData>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      onionAddresses: [{ address: '' }],
      priority: 'High',
      classification: 'Confidential',
    },
  });

  const { fields: onionFields, append: appendOnion, remove: removeOnion } = useFieldArray({
    control,
    name: 'onionAddresses',
  });

  const watchedDescription = watch('description', '');
  const watchedNotes = watch('caseNotes', '');

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const toAdd: UploadedFile[] = newFiles.map((file, i) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = ACCEPTED_TYPES.includes(ext);
      const isValidSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      const error = !isValidType
        ? `File type ${ext} not accepted`
        : !isValidSize
        ? `File exceeds 2 GB limit`
        : undefined;

      return {
        id: `file-${Date.now()}-${i}`,
        file,
        status: error ? 'invalid' : 'valid',
        error,
      };
    });
    setUploadedFiles((prev) => [...prev, ...toAdd]);
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Backend integration point: POST /api/v1/cases + POST /api/v1/ingest/traffic-capture
  const onSubmit = async (data: NewCaseFormData) => {
    const validFiles = uploadedFiles.filter((f) => f.status === 'valid');
    if (validFiles.length === 0 && uploadedFiles.length === 0) {
      toast?.warning?.('No evidence files attached. You can add evidence after case creation.');
    }

    setIsSubmitting(true);

    try {
      // Simulate case creation API call
      await new Promise((r) => setTimeout(r, 1500));

      // Simulate file ingestion progress
      if (validFiles.length > 0) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.status === 'valid' ? { ...f, status: 'uploading', progress: 0 } : f
          )
        );

        for (let p = 0; p <= 100; p += 20) {
          await new Promise((r) => setTimeout(r, 200));
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.status === 'uploading' ? { ...f, progress: p } : f
            )
          );
        }

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.status === 'uploading' ? { ...f, status: 'uploaded', progress: 100 } : f
          )
        );
      }

      setSubmitSuccess(true);
      toast?.success?.(`Case "${data.caseName}" created successfully — evidence ingestion queued`);
    } catch {
      toast?.error?.('Case creation failed. Check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    background: 'rgba(118,118,128,0.12)',
    border: 'none',
    borderRadius: '10px',
    color: '#1D1D1F',
    fontSize: '0.875rem',
    padding: '0.625rem 0.875rem',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-[#1D1D1F]">
          Case Created Successfully
        </h2>
        <p className="text-sm mb-1 text-gray-300">
          Evidence files queued for ingestion. Correlation jobs can now be triggered.
        </p>
        <p
          className="text-xs font-mono mb-6 text-cyan-400"
        >
          Case ID: case-2026-{String(Math.floor(Math.random() * 900) + 100)}
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-[980px] text-xs font-bold bg-[#0071E3] hover:bg-cyan-500 text-[#1D1D1F] transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setSubmitSuccess(false)}
            className="px-5 py-2.5 rounded-[980px] text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            Create Another Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-[980px] bg-gray-900 border border-gray-800 text-gray-300 hover:text-[#1D1D1F] transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>
          <span className="text-gray-600">/</span>
          <h1 className="text-xl font-bold text-[#1D1D1F]">
            New Investigation Case
          </h1>
        </div>

        {/* Required fields legend */}
        <p className="text-xs text-gray-400 font-mono">
          <span className="text-[#FF3B30]">*</span> Required fields
        </p>
      </div>

      {/* Unsaved changes notice */}
      {isDirty && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-[980px] mb-5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400"
          role="status"
        >
          <Info size={13} />
          You have unsaved changes. Complete the form and submit to create the case.
        </div>
      )}

      <div className="space-y-6">
        {/* ── Section 1: Case Metadata ─────────────────────────────────── */}
        <div
          className="rounded-[16px] bg-[#FFFFFF] p-6 border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.04)]"
        >
          <SectionHeader
            number="1"
            title="Case Metadata"
            description="Define the investigation scope, classification level, and responsible analyst."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Case name */}
            <div className="md:col-span-2">
              <FormField
                label="Operation / Case Name"
                htmlFor="caseName"
                required
                hint="Use the officially assigned operation codename. Do not use real names or identifying information."
                error={errors.caseName?.message}
              >
                <input
                  id="caseName"
                  type="text"
                  placeholder="e.g. Operation Nightshade"
                  {...register('caseName')}
                  className={`w-full px-3.5 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs text-[#1D1D1F] focus:outline-none focus:border-cyan-500 transition-colors ${errors.caseName ? 'border-rose-500' : ''}`}
                  aria-invalid={!!errors.caseName}
                  aria-describedby={errors.caseName ? 'caseName-error' : undefined}
                />
              </FormField>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <FormField
                label="Case Description"
                htmlFor="description"
                required
                hint="Describe the investigation objective, suspected illegal activity, and initial intelligence basis."
                error={errors.description?.message}
              >
                <div className="relative">
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the suspected illegal marketplace activity, known onion addresses, and basis for investigation…"
                    {...register('description')}
                    className={`w-full px-3.5 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs text-[#1D1D1F] focus:outline-none focus:border-cyan-500 transition-colors resize-none ${errors.description ? 'border-rose-500' : ''}`}
                    aria-invalid={!!errors.description}
                  />
                  <span
                    className="absolute bottom-2 right-3 text-[10px] font-mono text-gray-500"
                  >
                    {watchedDescription?.length ?? 0}/2000
                  </span>
                </div>
              </FormField>
            </div>

            {/* Analyst */}
            <FormField
              label="Assigned Analyst"
              htmlFor="assignedAnalyst"
              required
              error={errors.assignedAnalyst?.message}
            >
              <select
                id="assignedAnalyst"
                {...register('assignedAnalyst')}
                style={selectStyle}
                aria-invalid={!!errors.assignedAnalyst}
              >
                <option value="">Select analyst…</option>
                {analysts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} — {a.unit}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Priority */}
            <FormField
              label="Priority Level"
              htmlFor="priority"
              required
              error={errors.priority?.message}
            >
              <select
                id="priority"
                {...register('priority')}
                style={selectStyle}
                aria-invalid={!!errors.priority}
              >
                <option value="Critical">Critical — Immediate threat to public safety</option>
                <option value="High">High — Active illegal marketplace</option>
                <option value="Medium">Medium — Suspected activity, monitoring phase</option>
                <option value="Low">Low — Background intelligence collection</option>
              </select>
            </FormField>

            {/* Classification */}
            <FormField
              label="Classification Level"
              htmlFor="classification"
              required
              hint="Classification determines access controls. Consult your security officer if unsure."
              error={errors.classification?.message}
            >
              <select
                id="classification"
                {...register('classification')}
                style={selectStyle}
                aria-invalid={!!errors.classification}
              >
                <option value="Top Secret">Top Secret</option>
                <option value="Secret">Secret</option>
                <option value="Confidential">Confidential</option>
                <option value="Unclassified">Unclassified</option>
              </select>
            </FormField>

            {/* Supervisor approval */}
            <FormField
              label="Supervisor Approval Reference"
              htmlFor="supervisorApproval"
              required
              hint="Enter the approval ticket or supervisor badge number authorizing this investigation."
              error={errors.supervisorApproval?.message}
            >
              <input
                id="supervisorApproval"
                type="text"
                placeholder="e.g. APPR-2026-0447 or SSV badge #"
                {...register('supervisorApproval')}
                className={`w-full px-3.5 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs text-[#1D1D1F] font-mono focus:outline-none focus:border-cyan-500 transition-colors ${errors.supervisorApproval ? 'border-rose-500' : ''}`}
                aria-invalid={!!errors.supervisorApproval}
              />
            </FormField>

            {/* Legal authority */}
            <FormField
              label="Legal Authority / Warrant Reference"
              htmlFor="legalAuthority"
              required
              hint="Court order, warrant number, or statutory authority for this investigation."
              error={errors.legalAuthority?.message}
            >
              <input
                id="legalAuthority"
                type="text"
                placeholder="e.g. Warrant #WR-2026-00234 or 18 U.S.C. § 2703"
                {...register('legalAuthority')}
                className={`w-full px-3.5 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs text-[#1D1D1F] font-mono focus:outline-none focus:border-cyan-500 transition-colors ${errors.legalAuthority ? 'border-rose-500' : ''}`}
                aria-invalid={!!errors.legalAuthority}
              />
            </FormField>

            {/* Onion addresses */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label
                  className="text-xs font-mono font-semibold text-gray-300"
                >
                  Target Onion Addresses{' '}
                  <span className="text-[#FF3B30]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => appendOnion({ address: '' })}
                  disabled={onionFields.length >= 10}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono disabled:opacity-40"
                >
                  <Plus size={11} />
                  Add address
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mb-2 font-mono">
                Enter TOR v3 (.onion) addresses associated with the target hidden service. v3 addresses are 56 characters before .onion.
              </p>

              {errors.onionAddresses?.root?.message && (
                <p className="text-xs mb-2 flex items-center gap-1 text-[#FF3B30]">
                  <AlertCircle size={11} />
                  {errors.onionAddresses.root.message}
                </p>
              )}

              <div className="space-y-2">
                {onionFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <input
                          type="text"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.onion"
                          {...register(`onionAddresses.${index}.address`)}
                          className={`w-full pl-9 pr-3 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors ${
                            errors.onionAddresses?.[index]?.address ? 'border-rose-500' : ''
                          }`}
                          aria-label={`Onion address ${index + 1}`}
                          aria-invalid={!!errors.onionAddresses?.[index]?.address}
                        />
                      </div>
                      {errors.onionAddresses?.[index]?.address && (
                        <p
                          className="text-xs mt-1 flex items-center gap-1 text-[#FF3B30]"
                          role="alert"
                        >
                          <AlertCircle size={11} />
                          {errors.onionAddresses[index]?.address?.message}
                        </p>
                      )}
                    </div>
                    {onionFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOnion(index)}
                        className="p-2.5 rounded-[980px] text-gray-500 hover:text-[#FF3B30] hover:bg-rose-500/10 transition-colors mt-0.5"
                        aria-label={`Remove onion address ${index + 1}`}
                        title="Remove this onion address"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Case notes */}
            <div className="md:col-span-2">
              <FormField
                label="Initial Case Notes"
                htmlFor="caseNotes"
                hint="Optional. Additional context, intelligence sources, or investigative notes. These are part of the case record."
                error={errors.caseNotes?.message}
              >
                <div className="relative">
                  <textarea
                    id="caseNotes"
                    rows={3}
                    placeholder="Optional: additional context, related cases, intelligence source references…"
                    {...register('caseNotes')}
                    className="w-full px-3.5 py-2.5 rounded-[980px] bg-[rgba(118,118,128,0.12)] border-none rounded-[10px] text-[#1D1D1F] focus:bg-[rgba(118,118,128,0.16)] focus:outline focus:outline-2 focus:outline-[rgba(0,113,227,0.5)] text-xs text-[#1D1D1F] focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                  <span
                    className="absolute bottom-2 right-3 text-[10px] font-mono text-gray-500"
                  >
                    {watchedNotes?.length ?? 0}/5000
                  </span>
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Section 2: Evidence Intake ────────────────────────────────── */}
        <div
          className="rounded-[16px] bg-[#FFFFFF] p-6 border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.04)]"
        >
          <SectionHeader
            number="2"
            title="Evidence Intake"
            description="Upload TOR traffic captures and supporting evidence files. All files are hashed and logged on ingestion."
          />

          {/* Ingestion info banner */}
          <div
            className="flex items-start gap-2 p-3 rounded-[980px] mb-5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300"
          >
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <div className="text-gray-300 leading-relaxed">
              <span className="font-semibold text-blue-400">
                Supported evidence types:{' '}
              </span>
              PCAP/PCAPNG traffic captures (primary), JSON correlation metadata, CSV timing datasets, log files. Files are validated for format integrity before ingestion. Corrupt or unsupported files are rejected with an error.
            </div>
          </div>

          <EvidenceUploader
            files={uploadedFiles}
            onFilesAdded={handleFilesAdded}
            onFileRemove={handleFileRemove}
          />

          {/* Invalid files warning */}
          {uploadedFiles.some((f) => f.status === 'invalid') && (
            <div
              className="flex items-start gap-2 p-3 rounded-[980px] mt-3 text-xs bg-rose-500/10 border border-rose-500/30 text-[#FF3B30]"
              role="alert"
            >
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              {uploadedFiles.filter((f) => f.status === 'invalid').length} file(s) failed validation and will be excluded from ingestion. Remove them or replace with valid files.
            </div>
          )}
        </div>

        {/* ── Section 3: Review summary ─────────────────────────────────── */}
        <div
          className="rounded-[16px] bg-[#FFFFFF] p-5 border border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start gap-2">
            <FileText size={15} className="flex-shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <p className="text-xs font-semibold mb-1 text-cyan-300">
                Before Submitting
              </p>
              <ul className="space-y-1">
                {[
                  'Verify all onion addresses are correct v3 format — they cannot be changed after submission without a new audit entry',
                  'Ensure classification level is accurate — downgrading after creation requires supervisor approval',
                  'Evidence files cannot be deleted after ingestion — only superseded',
                  'Submitting creates an immutable audit log entry with your identity and timestamp',
                ].map((item, i) => (
                  <li
                    key={`checklist-${i}`}
                    className="text-xs flex items-start gap-1.5 text-gray-400"
                  >
                    <span className="mt-1 flex-shrink-0 text-cyan-400">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom action bar ──────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 left-0 right-0 mt-6 px-6 py-4 rounded-2xl border border-gray-800 bg-[#F5F5F7]/90 backdrop-blur z-10 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          {/* File summary */}
          {uploadedFiles.length > 0 && (
            <span className="text-xs text-gray-400 font-mono">
              {uploadedFiles.filter((f) => f.status === 'valid' || f.status === 'uploaded').length} valid file(s) ·{' '}
              {uploadedFiles.filter((f) => f.status === 'invalid').length > 0 && (
                <span className="text-[#FF3B30]">
                  {uploadedFiles.filter((f) => f.status === 'invalid').length} invalid
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-[980px] text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:text-[#1D1D1F] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[980px] text-xs font-bold bg-[#0071E3] hover:bg-cyan-500 disabled:opacity-60 text-[#1D1D1F] transition-colors shadow-lg shadow-cyan-600/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating Case…
              </>
            ) : (
              <>
                <Shield size={15} />
                Create Investigation Case
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default NewCaseForm;
