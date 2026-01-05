'use client';

import { useEffect, useState } from 'react';
import { cedarClient } from '@/lib/cedar-client';

export default function SchemaPage() {
    const [schema, setSchema] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [jsonContent, setJsonContent] = useState('');
    const [saving, setSaving] = useState(false);

    async function loadSchema() {
        try {
            setLoading(true);
            const data = await cedarClient.getSchema();
            setSchema(data);
            setJsonContent(data ? JSON.stringify(data, null, 2) : '{}');
            setError(null);
        } catch (err) {
            // Schema might not exist yet
            setSchema(null);
            setJsonContent('{}');
            if (err instanceof Error && !err.message.includes('404')) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSchema();
    }, []);

    async function handleSave() {
        setSaving(true);
        setError(null);

        try {
            const parsed = JSON.parse(jsonContent);
            await cedarClient.updateSchema(parsed);
            setSchema(parsed);
            setEditMode(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save schema');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Delete the schema? This cannot be undone.')) return;

        try {
            await cedarClient.deleteSchema();
            setSchema(null);
            setJsonContent('{}');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete schema');
        }
    }

    function addSampleSchema() {
        const sample = {
            "": {
                entityTypes: {
                    User: {
                        shape: {
                            type: "Record",
                            attributes: {
                                email: { type: "String" },
                                role: { type: "String" }
                            }
                        },
                        memberOfTypes: ["Role"]
                    },
                    Role: {
                        shape: {
                            type: "Record",
                            attributes: {}
                        }
                    },
                    Document: {
                        shape: {
                            type: "Record",
                            attributes: {
                                title: { type: "String" },
                                owner: { type: "String" }
                            }
                        }
                    }
                },
                actions: {
                    view: {
                        appliesTo: {
                            principalTypes: ["User", "Role"],
                            resourceTypes: ["Document"]
                        }
                    },
                    edit: {
                        appliesTo: {
                            principalTypes: ["User", "Role"],
                            resourceTypes: ["Document"]
                        }
                    },
                    delete: {
                        appliesTo: {
                            principalTypes: ["User"],
                            resourceTypes: ["Document"]
                        }
                    }
                }
            }
        };
        setJsonContent(JSON.stringify(sample, null, 2));
        setEditMode(true);
    }

    return (
        <div>
            <div className="page-header">
                <h1>Schema</h1>
                <p>Define the structure of your entities and actions for type-safe policies</p>
            </div>

            <div className="actions-bar">
                {editMode ? (
                    <>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Schema'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            setEditMode(false);
                            setJsonContent(schema ? JSON.stringify(schema, null, 2) : '{}');
                        }}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Schema
                        </button>
                        <button className="btn btn-secondary" onClick={loadSchema} disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Refresh
                        </button>
                        {!schema && (
                            <button className="btn btn-secondary" onClick={addSampleSchema}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                </svg>
                                Add Sample Schema
                            </button>
                        )}
                        {schema && (
                            <button className="btn btn-danger" onClick={handleDelete}>
                                Delete Schema
                            </button>
                        )}
                    </>
                )}
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

            {loading ? (
                <div className="loading">
                    <span className="spinner" />
                    Loading schema...
                </div>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Cedar Schema (JSON)</h3>
                        <span className={`badge ${schema ? 'badge-success' : 'badge-warning'}`}>
                            {schema ? 'Defined' : 'Not Set'}
                        </span>
                    </div>

                    {editMode ? (
                        <textarea
                            className="form-textarea"
                            value={jsonContent}
                            onChange={(e) => setJsonContent(e.target.value)}
                            style={{ minHeight: 500, fontFamily: 'JetBrains Mono, monospace' }}
                        />
                    ) : (
                        <>
                            {!schema ? (
                                <div className="empty-state">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                    </svg>
                                    <h3>No Schema Defined</h3>
                                    <p>Define a schema to enable type checking for your policies</p>
                                </div>
                            ) : (
                                <pre className="entity-tree">
                                    {JSON.stringify(schema, null, 2)}
                                </pre>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <h3 className="card-title">About Cedar Schema</h3>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 12 }}>
                        The Cedar schema defines the structure of your entity types and actions.
                        It enables type checking for your policies, helping catch errors before deployment.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        <strong>Entity Types:</strong> Define what attributes each entity type has and
                        what other entity types it can be a member of.
                    </p>
                    <p>
                        <strong>Actions:</strong> Define which principal types can perform each action
                        on which resource types.
                    </p>
                </div>
            </div>
        </div>
    );
}
