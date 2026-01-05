'use client';

import { useState } from 'react';
import { cedarClient, type AuthorizationResponse } from '@/lib/cedar-client';

export default function AuthorizePage() {
    const [principal, setPrincipal] = useState('User::"alice"');
    const [action, setAction] = useState('Action::"view"');
    const [resource, setResource] = useState('Document::"doc1"');
    const [context, setContext] = useState('{}');
    const [result, setResult] = useState<AuthorizationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let parsedContext = {};
            if (context.trim()) {
                try {
                    parsedContext = JSON.parse(context);
                } catch {
                    throw new Error('Invalid JSON in context field');
                }
            }

            const response = await cedarClient.isAuthorized({
                principal: principal || undefined,
                action: action || undefined,
                resource: resource || undefined,
                context: parsedContext,
            });

            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authorization check failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1>Test Authorization</h1>
                <p>Check if a principal is allowed to perform an action on a resource</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Authorization Request</h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Principal</label>
                            <input
                                type="text"
                                className="form-input"
                                value={principal}
                                onChange={(e) => setPrincipal(e.target.value)}
                                placeholder='User::"alice"'
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                Format: Type::"id" (e.g., User::"alice", Role::"admin")
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Action</label>
                            <input
                                type="text"
                                className="form-input"
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                placeholder='Action::"view"'
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                Format: Action::"name" (e.g., Action::"view", Action::"edit")
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Resource</label>
                            <input
                                type="text"
                                className="form-input"
                                value={resource}
                                onChange={(e) => setResource(e.target.value)}
                                placeholder='Document::"doc1"'
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                Format: Type::"id" (e.g., Document::"doc1", File::"readme.md")
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Context (JSON)</label>
                            <textarea
                                className="form-textarea"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="{}"
                                style={{ minHeight: 100 }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 16, height: 16 }} />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    Check Authorization
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Result</h3>
                    </div>

                    {error && (
                        <div style={{
                            padding: 16,
                            background: 'var(--danger-bg)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--danger)',
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {result && (
                        <>
                            <div className={`decision-card ${result.decision === 'Allow' ? 'decision-allow' : 'decision-deny'}`}>
                                <div className="decision-icon">
                                    {result.decision === 'Allow' ? (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                    ) : (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    )}
                                </div>
                                <div className="decision-text">{result.decision}</div>
                            </div>

                            {result.diagnostics.reason.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                                        Policies Applied:
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {result.diagnostics.reason.map((policyId, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '4px 12px',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {policyId}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.diagnostics.errors.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--danger)' }}>
                                        Errors:
                                    </h4>
                                    {result.diagnostics.errors.map((err, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: 'var(--danger-bg)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.85rem',
                                                marginBottom: 8,
                                            }}
                                        >
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {!result && !error && (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <h3>No Result Yet</h3>
                            <p>Fill in the form and click "Check Authorization" to test</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
