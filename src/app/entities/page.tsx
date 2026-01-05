'use client';

import { useEffect, useState } from 'react';
import { cedarClient, type Entity } from '@/lib/cedar-client';

export default function EntitiesPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [jsonContent, setJsonContent] = useState('');
    const [saving, setSaving] = useState(false);

    async function loadEntities() {
        try {
            setLoading(true);
            const data = await cedarClient.getEntities();
            setEntities(data);
            setJsonContent(JSON.stringify(data, null, 2));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load entities');
            setJsonContent('[]');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadEntities();
    }, []);

    async function handleSave() {
        setSaving(true);
        setError(null);

        try {
            const parsed = JSON.parse(jsonContent);
            await cedarClient.updateEntities(parsed);
            setEntities(parsed);
            setEditMode(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save entities');
        } finally {
            setSaving(false);
        }
    }

    async function handleClear() {
        if (!confirm('Delete all entities? This cannot be undone.')) return;

        try {
            await cedarClient.deleteEntities();
            setEntities([]);
            setJsonContent('[]');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear entities');
        }
    }

    function addSampleEntities() {
        const sample: Entity[] = [
            {
                uid: { type: 'User', id: 'alice' },
                attrs: { email: 'alice@example.com', role: 'admin' },
                parents: [{ type: 'Role', id: 'admin' }],
            },
            {
                uid: { type: 'User', id: 'bob' },
                attrs: { email: 'bob@example.com', role: 'viewer' },
                parents: [{ type: 'Role', id: 'viewer' }],
            },
            {
                uid: { type: 'Role', id: 'admin' },
                attrs: {},
                parents: [],
            },
            {
                uid: { type: 'Role', id: 'viewer' },
                attrs: {},
                parents: [],
            },
            {
                uid: { type: 'Document', id: 'doc1' },
                attrs: { title: 'Project Plan', owner: 'alice' },
                parents: [],
            },
            {
                uid: { type: 'Action', id: 'view' },
                attrs: {},
                parents: [],
            },
            {
                uid: { type: 'Action', id: 'edit' },
                attrs: {},
                parents: [],
            },
        ];
        setJsonContent(JSON.stringify(sample, null, 2));
        setEditMode(true);
    }

    return (
        <div>
            <div className="page-header">
                <h1>Entities</h1>
                <p>Manage the data entities (users, resources, roles) in your authorization model</p>
            </div>

            <div className="actions-bar">
                {editMode ? (
                    <>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            setEditMode(false);
                            setJsonContent(JSON.stringify(entities, null, 2));
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
                            Edit Entities
                        </button>
                        <button className="btn btn-secondary" onClick={loadEntities} disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Refresh
                        </button>
                        {entities.length === 0 && (
                            <button className="btn btn-secondary" onClick={addSampleEntities}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                </svg>
                                Add Sample Entities
                            </button>
                        )}
                        {entities.length > 0 && (
                            <button className="btn btn-danger" onClick={handleClear}>
                                Clear All
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
                    Loading entities...
                </div>
            ) : (
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Entity Data (JSON)</h3>
                            <span className="badge badge-secondary" style={{ background: 'var(--bg-tertiary)' }}>
                                {entities.length} entities
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
                            <pre className="entity-tree">
                                {entities.length === 0 ? 'No entities defined' : JSON.stringify(entities, null, 2)}
                            </pre>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Entity Summary</h3>
                        </div>

                        {entities.length === 0 ? (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                                <h3>No Entities</h3>
                                <p>Add entities to define users, resources, and roles</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: 12 }}>
                                {Object.entries(groupByType(entities)).map(([type, items]) => (
                                    <div key={type} style={{
                                        padding: 16,
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 8,
                                        }}>
                                            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                                                {type}
                                            </span>
                                            <span className="badge badge-secondary" style={{ background: 'var(--bg-primary)' }}>
                                                {items.length}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {items.map((entity) => (
                                                <span
                                                    key={`${entity.uid.type}::${entity.uid.id}`}
                                                    style={{
                                                        padding: '2px 8px',
                                                        background: 'var(--bg-primary)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.8rem',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    {entity.uid.id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function groupByType(entities: Entity[]): Record<string, Entity[]> {
    return entities.reduce((acc, entity) => {
        const type = entity.uid.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(entity);
        return acc;
    }, {} as Record<string, Entity[]>);
}
