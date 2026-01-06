'use client';

import { useState, useEffect } from 'react';
import { cedarClient, type AuthorizationResponse, type Entity } from '@/lib/cedar-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthorizePage() {
    const [principal, setPrincipal] = useState('');
    const [action, setAction] = useState('');
    const [resource, setResource] = useState('');
    const [context, setContext] = useState('{}');
    const [result, setResult] = useState<AuthorizationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [entities, setEntities] = useState<Entity[]>([]);

    // Fetch entities on mount to show available options
    useEffect(() => {
        cedarClient.getEntities().then(setEntities).catch(console.error);
    }, []);

    // Helper to format entity UID
    const formatEntityUid = (entity: Entity) => `${entity.uid.type}::"${entity.uid.id}"`;

    // Get unique entity types for suggestions
    const principals = entities.filter(e => e.uid.type === 'User' || e.uid.type === 'Role');
    const resources = entities.filter(e => e.uid.type !== 'User' && e.uid.type !== 'Role');

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Test Authorization</h1>
                <p className="text-muted-foreground">
                    Check if a principal is allowed to perform an action on a resource
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Authorization Request</CardTitle>
                        <CardDescription>Enter the details for your authorization check</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="principal">Principal</Label>
                                <Input
                                    id="principal"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                    placeholder='User::"alice"'
                                />
                                {principals.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {principals.map((e) => (
                                            <Badge
                                                key={formatEntityUid(e)}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                                                onClick={() => setPrincipal(formatEntityUid(e))}
                                            >
                                                {formatEntityUid(e)}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Format: Type::&quot;id&quot; (e.g., User::&quot;alice&quot;)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="action">Action</Label>
                                <Input
                                    id="action"
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    placeholder='Action::"view"'
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: Action::&quot;name&quot; (e.g., Action::&quot;view&quot;, Action::&quot;edit&quot;, Action::&quot;delete&quot;)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resource">Resource</Label>
                                <Input
                                    id="resource"
                                    value={resource}
                                    onChange={(e) => setResource(e.target.value)}
                                    placeholder='Document::"doc1"'
                                />
                                {resources.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {resources.map((e) => (
                                            <Badge
                                                key={formatEntityUid(e)}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                                                onClick={() => setResource(formatEntityUid(e))}
                                            >
                                                {formatEntityUid(e)}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Format: Type::&quot;id&quot; (e.g., Document::&quot;doc1&quot;)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="context">Context (JSON)</Label>
                                <Textarea
                                    id="context"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="{}"
                                    className="min-h-[100px]"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        Check Authorization
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                        <CardDescription>Authorization decision and diagnostics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                <div className={`flex flex-col items-center justify-center rounded-xl p-8 ${result.decision === 'Allow'
                                    ? 'border-2 border-green-500 bg-green-500/10'
                                    : 'border-2 border-destructive bg-destructive/10'
                                    }`}>
                                    {result.decision === 'Allow' ? (
                                        <CheckCircle className="h-16 w-16 text-green-500" />
                                    ) : (
                                        <XCircle className="h-16 w-16 text-destructive" />
                                    )}
                                    <span className={`mt-4 text-2xl font-bold ${result.decision === 'Allow' ? 'text-green-500' : 'text-destructive'
                                        }`}>
                                        {result.decision}
                                    </span>
                                </div>

                                {result.diagnostics.reason.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                            Policies Applied:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.diagnostics.reason.map((policyId, i) => (
                                                <Badge key={i} variant="secondary" className="font-mono">
                                                    {policyId}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.diagnostics.errors.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-destructive">Errors:</h4>
                                        {result.diagnostics.errors.map((err, i) => (
                                            <div key={i} className="rounded-lg bg-destructive/10 p-3 text-sm">
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && !error && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Shield className="h-12 w-12 opacity-50" />
                                <h3 className="mt-4 font-medium">No Result Yet</h3>
                                <p className="text-sm">Fill in the form and click &quot;Check Authorization&quot;</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
