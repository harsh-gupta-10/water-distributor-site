import { useEffect, useMemo, useState } from 'react';
import { Copy, Pencil, RefreshCw, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../components/Toast';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const SHARED_MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media';

const uploadTargets = {
  blog: {
    label: 'Blog Image',
    bucket: SHARED_MEDIA_BUCKET,
    folder: 'blogs',
  },
  product: {
    label: 'Product Image',
    bucket: SHARED_MEDIA_BUCKET,
    folder: 'products',
  },
};

function ensureWebp(file) {
  if (!file) return false;
  const lowerName = file.name.toLowerCase();
  return file.type === 'image/webp' && lowerName.endsWith('.webp');
}

function sanitizeBaseName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.webp$/i, '')
    .replace(/[^a-z0-9-_.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadsPage() {
  const toast = useToast();
  const [targetKey, setTargetKey] = useState('blog');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [renamingPath, setRenamingPath] = useState('');
  const [renameInput, setRenameInput] = useState('');

  const target = useMemo(() => uploadTargets[targetKey], [targetKey]);

  useEffect(() => {
    fetchFiles();
  }, [targetKey]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(target.bucket)
        .list(target.folder, {
          limit: 200,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      const filtered = (data || []).filter((item) => !item.name.endsWith('/'));
      setFiles(filtered);
    } catch (error) {
      toast(`Failed to list files: ${error.message}`, 'error');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!file) {
      toast('Choose a .webp image to upload.', 'error');
      return;
    }

    if (!ensureWebp(file)) {
      toast('Only .webp images are allowed.', 'error');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast('File too large. Maximum is 50MB.', 'error');
      return;
    }

    const nameBase = sanitizeBaseName(fileName || file.name) || `file-${Date.now()}`;
    const targetPath = `${target.folder}/${nameBase}.webp`;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from(target.bucket)
        .upload(targetPath, file, {
          cacheControl: '31536000',
          upsert: true,
          contentType: 'image/webp',
        });

      if (error) throw error;
      toast('Upload complete', 'success');
      setFile(null);
      setFileName('');
      await fetchFiles();
    } catch (error) {
      toast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(target.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function copyPublicUrl(path) {
    try {
      const url = getPublicUrl(path);
      await navigator.clipboard.writeText(url);
      toast('Public URL copied', 'success');
    } catch {
      toast('Could not copy URL', 'error');
    }
  }

  function startRename(path) {
    const currentName = path.split('/').pop() || '';
    setRenamingPath(path);
    setRenameInput(currentName.replace(/\.webp$/i, ''));
  }

  async function saveRename(oldPath) {
    const base = sanitizeBaseName(renameInput);
    if (!base) {
      toast('Enter a valid file name.', 'error');
      return;
    }

    const newPath = `${target.folder}/${base}.webp`;
    if (newPath === oldPath) {
      setRenamingPath('');
      setRenameInput('');
      return;
    }

    try {
      const { error } = await supabase.storage
        .from(target.bucket)
        .move(oldPath, newPath);

      if (error) throw error;

      toast('File renamed', 'success');
      setRenamingPath('');
      setRenameInput('');
      await fetchFiles();
    } catch (error) {
      toast(`Rename failed: ${error.message}`, 'error');
    }
  }

  async function deleteFile(path) {
    const ok = window.confirm(`Delete ${path.split('/').pop()}?`);
    if (!ok) return;

    try {
      const { error } = await supabase.storage.from(target.bucket).remove([path]);
      if (error) throw error;
      toast('File deleted', 'success');
      await fetchFiles();
    } catch (error) {
      toast(`Delete failed: ${error.message}`, 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header__info">
          <h1>Uploads</h1>
          <p>Upload, rename, and delete image files in Supabase Storage</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card__body" style={{ display: 'grid', gap: 12 }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-field">
              <label>What do you want to upload?</label>
              <select
                value={targetKey}
                onChange={(e) => setTargetKey(e.target.value)}
              >
                {Object.entries(uploadTargets).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Choose .webp file</label>
              <input
                type="file"
                accept="image/webp,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="form-field">
              <label>Rename before upload (optional)</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example-file-name"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-admin btn-admin--primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload WebP'}
            </button>

            <button
              type="button"
              className="btn-admin btn-admin--secondary"
              onClick={fetchFiles}
              disabled={loading}
            >
              <RefreshCw size={16} /> Refresh Files
            </button>

            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              Bucket: {target.bucket} | Folder: {target.folder} | Max size: 50MB
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Files ({files.length})</div>
        </div>
        <div className="card__body card__body--flush">
          {loading ? (
            <div style={{ padding: 20, color: '#6b7280' }}>Loading files...</div>
          ) : files.length === 0 ? (
            <div style={{ padding: 20, color: '#6b7280' }}>No files found in this folder.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item) => {
                    const path = `${target.folder}/${item.name}`;
                    const isEditing = renamingPath === path;
                    return (
                      <tr key={path}>
                        <td style={{ minWidth: 260 }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                placeholder="new-file-name"
                                style={{ minWidth: 180 }}
                              />
                              <button
                                className="btn-admin btn-admin--primary"
                                onClick={() => saveRename(path)}
                              >
                                Save
                              </button>
                              <button
                                className="btn-admin btn-admin--secondary"
                                onClick={() => {
                                  setRenamingPath('');
                                  setRenameInput('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontFamily: 'monospace' }}>{item.name}</span>
                          )}
                        </td>
                        <td>{formatSize(item.metadata?.size || item.metadata?.contentLength)}</td>
                        <td>{item.updated_at ? new Date(item.updated_at).toLocaleString('en-IN') : '-'}</td>
                        <td>
                          <div className="data-table__actions">
                            <button
                              className="data-table__action-btn"
                              title="Copy public URL"
                              onClick={() => copyPublicUrl(path)}
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              className="data-table__action-btn"
                              title="Rename"
                              onClick={() => startRename(path)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="data-table__action-btn data-table__action-btn--danger"
                              title="Delete"
                              onClick={() => deleteFile(path)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
