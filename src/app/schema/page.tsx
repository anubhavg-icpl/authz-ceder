'use client';

import { useEffect, useState } from 'react';
import { cedarClient } from '@/lib/cedar-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, RefreshCw, Trash2, Database, Loader2, Sparkles } from 'lucide-react';

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
                    User: { shape: { type: "Record", attributes: { email: { type: "String" }, role: { type: "String" } } }, memberOfTypes: ["Role"] },
                    Role: { shape: { type: "Record", attributes: {} } },
                    Document: { shape: { type: "Record", attributes: { title: { type: "String" }, owner: { type: "String" } } } }
                },
                actions: {
                    view: { appliesTo: { principalTypes: ["User", "Role"], resourceTypes: ["Document"] } },
                    edit: { appliesTo: { principalTypes: ["User", "Role"], resourceTypes: ["Document"] } },
                    delete: { appliesTo: { principalTypes: ["User"], resourceTypes: ["Document"] } }
                }
            }
        };
        setJsonContent(JSON.stringify(sample, null, 2));
        setEditMode(true);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Schema</h1>
                <p className="text-muted-foreground">
                    Define the structure of your entities and actions for type-safe policies
                </p>
            </div>

            <div className="flex gap-3">
                {editMode ? (
                    <>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Schema
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setEditMode(false);
                            setJsonContent(schema ? JSON.stringify(schema, null, 2) : '{}');
                        }}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setEditMode(true)}>
                            <Pencil className="h-4 w-4" />
                            Edit Schema
                        </Button>
                        <Button variant="outline" onClick={loadSchema} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {!schema && (
                            <Button variant="outline" onClick={addSampleSchema}>
                                <Sparkles className="h-4 w-4" />
                                Add Sample Schema
                            </Button>
                        )}
                        {schema && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                Delete Schema
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Cedar Schema (JSON)</CardTitle>
                            <Badge variant={schema ? "success" : "secondary"}>
                                {schema ? 'Defined' : 'Not Set'}
                            </Badge>
                        </div>
                        <CardDescription>
                            The schema defines entity types, their attributes, and valid actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editMode ? (
                            <Textarea
                                value={jsonContent}
                                onChange={(e) => setJsonContent(e.target.value)}
                                className="min-h-[400px] font-mono text-sm"
                            />
                        ) : !schema ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Database className="h-12 w-12 opacity-50" />
                                <h3 className="mt-4 font-medium">No Schema Defined</h3>
                                <p className="text-sm">Define a schema to enable type checking for your policies</p>
                            </div>
                        ) : (
                            <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                {JSON.stringify(schema, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>About Cedar Schema</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                    <p>
                        The Cedar schema defines the structure of your entity types and actions.
                        It enables type checking for your policies, helping catch errors before deployment.
                    </p>
                    <p>
                        <strong className="text-foreground">Entity Types:</strong> Define what attributes each entity type has and
                        what other entity types it can be a member of.
                    </p>
                    <p>
                        <strong className="text-foreground">Actions:</strong> Define which principal types can perform each action
                        on which resource types.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
