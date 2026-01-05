'use client';

import { useEffect, useState } from 'react';
import { cedarClient, type Policy } from '@/lib/cedar-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Pencil, Trash2, FileText, Loader2 } from 'lucide-react';

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
                <p className="text-muted-foreground">
                    Manage Cedar policies that define your authorization rules
                </p>
            </div>

            <div className="flex gap-3">
                <Button onClick={openCreateForm}>
                    <Plus className="h-4 w-4" />
                    Create Policy
                </Button>
                <Button variant="outline" onClick={loadPolicies} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            )}

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingPolicy ? `Edit Policy: ${editingPolicy.id}` : 'Create New Policy'}
                        </CardTitle>
                        <CardDescription>
                            Write your Cedar policy using the Cedar policy language
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingPolicy && (
                                <div className="space-y-2">
                                    <Label htmlFor="policyId">Policy ID</Label>
                                    <Input
                                        id="policyId"
                                        value={formId}
                                        onChange={(e) => setFormId(e.target.value)}
                                        placeholder="my-policy"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="policyContent">Policy Content (Cedar)</Label>
                                <Textarea
                                    id="policyContent"
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="permit (principal, action, resource);"
                                    className="min-h-[250px] font-mono text-sm"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingPolicy ? 'Update Policy' : 'Create Policy'
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : policies.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 font-medium">No Policies</h3>
                        <p className="text-sm text-muted-foreground">
                            Create your first Cedar policy to define authorization rules
                        </p>
                        <Button className="mt-4" onClick={openCreateForm}>
                            <Plus className="h-4 w-4" />
                            Create Policy
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {policies.map((policy) => (
                        <Card key={policy.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="font-mono text-primary">{policy.id}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditForm(policy)}>
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(policy.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <pre className="max-h-[120px] overflow-hidden rounded-lg bg-muted p-4 font-mono text-sm">
                                    {policy.content}
                                </pre>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
