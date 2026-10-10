import React, { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ImportUploader } from '../components/ImportUploader';
import { ImportPreview } from '../components/ImportPreview';
import { Button } from '../../../components/ui/Button';
import { importsApi } from '../api/imports.api';

export const ImportProductsPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setCommitResult(null);
    setIsUploading(true);
    try {
      const uploadRes = await importsApi.upload(selectedFile);
      const jId = uploadRes.jobId || uploadRes._id;
      setJobId(jId);

      const previewRes = await importsApi.preview(jId);
      setPreviewData(previewRes);
    } catch (err: any) {
      setError(err.message || 'Failed to parse and preview uploaded CSV');
      setFile(null);
      setJobId(null);
      setPreviewData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!jobId) return;
    setError(null);
    setIsCommitting(true);
    try {
      const result = await importsApi.commit(jobId);
      setCommitResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to commit import job');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <PageHeader
        title="Bulk Catalog Import"
        subtitle="Import products from CSV with auto-validation"
        actions={
          <a href={importsApi.getTemplateUrl()} download="catalog-template.csv" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Download CSV Template</Button>
          </a>
        }
      />

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {commitResult ? (
        <div style={{ background: '#1e293b', border: '1px solid #10b981', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#10b981', marginTop: 0 }}>Import Completed Successfully</h3>
          <p style={{ color: '#f8fafc', fontSize: '15px' }}>
            Processed <strong>{commitResult.totalRows}</strong> rows:
            <span style={{ color: '#34d399', marginLeft: '8px' }}>{commitResult.importedCount} imported</span>,
            <span style={{ color: '#f87171', marginLeft: '8px' }}>{commitResult.failedCount} failed</span>.
          </p>
          {commitResult.rowErrors && commitResult.rowErrors.length > 0 && (
            <div style={{ marginTop: '16px', background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
              <h5 style={{ color: '#f87171', margin: '0 0 8px 0' }}>Row Errors:</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1' }}>
                {commitResult.rowErrors.map((err: any, i: number) => (
                  <li key={i}>Row {err.rowNumber}: {err.errorMessage}</li>
                ))}
              </ul>
            </div>
          )}
          <Button
            style={{ marginTop: '20px' }}
            onClick={() => {
              setFile(null);
              setJobId(null);
              setPreviewData(null);
              setCommitResult(null);
            }}
          >
            Import Another CSV
          </Button>
        </div>
      ) : (
        <>
          <ImportUploader onFileSelect={handleFileSelect} />
          {isUploading && (
            <div style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px' }}>
              Validating CSV structure and headers...
            </div>
          )}

          {previewData && (
            <div style={{ marginTop: '24px' }}>
              <ImportPreview
                previewRows={previewData.previewRows || []}
                totalRows={previewData.totalRows || 0}
                validationErrors={previewData.validationErrors || []}
              />
              <Button
                style={{ marginTop: '20px' }}
                onClick={handleCommit}
                disabled={isCommitting}
              >
                {isCommitting ? 'Importing Products...' : `Commit Import (${previewData.totalRows} Products)`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
