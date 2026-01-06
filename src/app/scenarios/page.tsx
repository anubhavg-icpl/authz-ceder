'use client';

import { useState } from 'react';
import { SCENARIOS, Scenario } from '@/lib/scenarios';
import { cedarClient } from '@/lib/cedar-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, CheckCircle, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ScenariosPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadScenario(scenario: Scenario) {
        if (!confirm(`Are you sure you want to load "${scenario.name}"? This will overwrite your current policies, entities, and schema.`)) {
            return;
        }

        setLoading(scenario.id);
        setError(null);
        setActiveScenario(null);

        try {
            // 1. Delete everything
            // Clean slate:
            const existingPolicies = await cedarClient.getPolicies();
            await Promise.all(existingPolicies.map(async (p) => {
                try {
                    await cedarClient.deletePolicy(p.id);
                } catch (e) {
                    // Ignore 404s if policy is already gone
                    console.warn(`Failed to delete policy ${p.id}:`, e);
                }
            }));

            await cedarClient.deleteEntities();
            await cedarClient.deleteSchema();

            // 2. Load new Schema
            await cedarClient.updateSchema(scenario.schema);

            // 3. Load new Entities
            await cedarClient.updateEntities(scenario.entities);

            // 4. Load new Policies
            await cedarClient.updatePolicies(scenario.policies);

            setActiveScenario(scenario.id);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load scenario');
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Use Case Scenarios</h1>
                <p className="text-muted-foreground">
                    Load pre-defined Cedar environments to understand advanced patterns like RBAC and ABAC.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {activeScenario && (
                <div className="rounded-lg border border-green-500 bg-green-500/10 p-4 text-green-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Scenario Loaded Successfully!</span>
                    </div>
                    <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500/20" asChild>
                        <Link href="/authorize">Test Authorization <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {SCENARIOS.map((scenario) => (
                    <Card key={scenario.id} className={activeScenario === scenario.id ? "border-primary" : ""}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    {scenario.name}
                                </CardTitle>
                                {activeScenario === scenario.id && <Badge className="bg-green-500">Active</Badge>}
                            </div>
                            <CardDescription>{scenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-md bg-muted p-2">
                                    <p className="font-medium mb-1">Entities</p>
                                    <p className="text-muted-foreground">{scenario.entities.length} entities</p>
                                </div>
                                <div className="rounded-md bg-muted p-2">
                                    <p className="font-medium mb-1">Policies</p>
                                    <p className="text-muted-foreground">{scenario.policies.length} policies</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="text-xs text-muted-foreground">
                                <p className="font-mono bg-muted/50 p-2 rounded">
                                    {scenario.policies[0].content.trim().split('\n').slice(0, 3).join('\n')}...
                                </p>
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => loadScenario(scenario)}
                                disabled={loading !== null}
                            >
                                {loading === scenario.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading Scenario...
                                    </>
                                ) : (
                                    "Load Scenario"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
