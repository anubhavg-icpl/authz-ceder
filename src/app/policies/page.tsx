'use client';

import { useEffect, useState } from 'react';
import { cedarClient, type Policy } from '@/lib/cedar-client';

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [formId, setFormId] = useState('');
    const [formContent, setFormContent] = useState('');
    const [saving, setSaving] = useState(false);

    async function loadPolicies() {
        try {
            setLoading(true);
            const data = await cedarClient.getPolicies();
            setPolicies(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load policies');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPolicies();
    }, []);

    function openCreateForm() {
        setEditingPolicy(null);
        setFormId('');
        setFormContent(`permit (
  principal,
  action,
  resource
);`);
        setShowForm(true);
    }

    function openEditForm(policy: Policy) {
        setEditingPolicy(policy);
        setFormId(policy.id);
        setFormContent(policy.content);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingPolicy) {
                await cedarClient.updatePolicy(editingPolicy.id, { content: formContent });
            } else {
                await cedarClient.createPolicy({ id: formId, content: formContent });
            }
            setShowForm(false);
            setEditingPolicy(null);
            await loadPolicies();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save policy');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(`Delete policy "${id}"?`)) return;

        try {
            await cedarClient.deletePolicy(id);
            await loadPolicies();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete policy');
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1>Policies</h1>
                <p>Manage Cedar policies that define your authorization rules</p>
            </div>

            <div className="actions-bar">
                <button className="btn btn-primary" onClick={openCreateForm}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Policy
                </button>
                <button className="btn btn-secondary" onClick={loadPolicies} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23,4 23,10 17,10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Refresh
                </button>
            </div>

            {error && (
                <div style={{
                    padding: 16,
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)',
                    marginBottom: 24,
                }}>
                    {error}
                </div>
            )}

            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            {editingPolicy ? `Edit Policy: ${editingPolicy.id}` : 'Create New Policy'}
                        </h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!editingPolicy && (
                            <div className="form-group">
                                <label className="form-label">Policy ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formId}
                                    onChange={(e) => setFormId(e.target.value)}
                                    placeholder="my-policy"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Policy Content (Cedar)</label>
                            <textarea
                                className="form-textarea"
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="permit (principal, action, resource);"
                                style={{ minHeight: 250 }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <span className="spinner" />
                    Loading policies...
                </div>
            ) : policies.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                        </svg>
                        <h3>No Policies</h3>
                        <p>Create your first Cedar policy to define authorization rules</p>
                        <button className="btn btn-primary" onClick={openCreateForm} style={{ marginTop: 16 }}>
                            Create Policy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="policy-grid">
                    {policies.map((policy) => (
                        <div key={policy.id} className="policy-item">
                            <div className="policy-header">
                                <span className="policy-id">{policy.id}</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openEditForm(policy)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(policy.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="policy-content">
                                {policy.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
