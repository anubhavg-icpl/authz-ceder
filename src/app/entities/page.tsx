'use client';

import { useEffect, useState } from 'react';
import { cedarClient, type Entity } from '@/lib/cedar-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, RefreshCw, Trash2, Users, Loader2, Sparkles } from 'lucide-react';

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
            { uid: { type: 'User', id: 'alice' }, attrs: { email: 'alice@example.com', role: 'admin' }, parents: [{ type: 'Role', id: 'admin' }] },
            { uid: { type: 'User', id: 'bob' }, attrs: { email: 'bob@example.com', role: 'viewer' }, parents: [{ type: 'Role', id: 'viewer' }] },
            { uid: { type: 'Role', id: 'admin' }, attrs: {}, parents: [] },
            { uid: { type: 'Role', id: 'viewer' }, attrs: {}, parents: [] },
            { uid: { type: 'Document', id: 'doc1' }, attrs: { title: 'Project Plan', owner: 'alice' }, parents: [] },
            { uid: { type: 'Action', id: 'view' }, attrs: {}, parents: [] },
            { uid: { type: 'Action', id: 'edit' }, attrs: {}, parents: [] },
        ];
        setJsonContent(JSON.stringify(sample, null, 2));
        setEditMode(true);
    }

    function groupByType(entities: Entity[]): Record<string, Entity[]> {
        return entities.reduce((acc, entity) => {
            const type = entity.uid.type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(entity);
            return acc;
        }, {} as Record<string, Entity[]>);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Entities</h1>
                <p className="text-muted-foreground">
                    Manage the data entities (users, resources, roles) in your authorization model
                </p>
            </div>

            <div className="flex gap-3">
                {editMode ? (
                    <>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setEditMode(false);
                            setJsonContent(JSON.stringify(entities, null, 2));
                        }}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setEditMode(true)}>
                            <Pencil className="h-4 w-4" />
                            Edit Entities
                        </Button>
                        <Button variant="outline" onClick={loadEntities} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {entities.length === 0 && (
                            <Button variant="outline" onClick={addSampleEntities}>
                                <Sparkles className="h-4 w-4" />
                                Add Sample Entities
                            </Button>
                        )}
                        {entities.length > 0 && (
                            <Button variant="destructive" onClick={handleClear}>
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                    </>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Entity Data (JSON)</CardTitle>
                                <Badge variant="secondary">{entities.length} entities</Badge>
                            </div>
                            <CardDescription>Raw JSON representation of all entities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {editMode ? (
                                <Textarea
                                    value={jsonContent}
                                    onChange={(e) => setJsonContent(e.target.value)}
                                    className="min-h-[400px] font-mono text-sm"
                                />
                            ) : (
                                <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                    {entities.length === 0 ? 'No entities defined' : JSON.stringify(entities, null, 2)}
                                </pre>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Entity Summary</CardTitle>
                            <CardDescription>Entities grouped by type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {entities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 opacity-50" />
                                    <h3 className="mt-4 font-medium">No Entities</h3>
                                    <p className="text-sm">Add entities to define users, resources, and roles</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(groupByType(entities)).map(([type, items]) => (
                                        <div key={type} className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-primary">{type}</span>
                                                <Badge variant="secondary">{items.length}</Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((entity) => (
                                                    <Badge key={`${entity.uid.type}::${entity.uid.id}`} variant="outline" className="font-mono">
                                                        {entity.uid.id}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
