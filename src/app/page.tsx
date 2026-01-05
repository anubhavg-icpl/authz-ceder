'use client';

import { useEffect, useState } from 'react';
import { cedarClient } from '@/lib/cedar-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Users, ArrowRight, CheckCircle, Database, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({
    policies: 0,
    entities: 0,
    healthy: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [policies, entities, health] = await Promise.all([
          cedarClient.getPolicies().catch(() => []),
          cedarClient.getEntities().catch(() => []),
          cedarClient.health().catch(() => ''),
        ]);

        setStats({
          policies: policies.length,
          entities: entities.length,
          healthy: health.includes('OK') || health.length > 0,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Cedar authorization configuration
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cedar Agent</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Badge variant={stats.healthy ? "success" : "destructive"}>
                {stats.healthy ? 'Connected' : 'Disconnected'}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '–' : stats.policies}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '–' : stats.entities}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuickAction
            title="Test Authorization"
            description="Check if a principal is allowed to perform an action on a resource"
            href="/authorize"
            icon={CheckCircle}
          />
          <QuickAction
            title="Manage Policies"
            description="Create, edit, or delete Cedar policies that define your authorization rules"
            href="/policies"
            icon={FileText}
          />
          <QuickAction
            title="View Entities"
            description="Browse and update the entities (users, resources) in your authorization model"
            href="/entities"
            icon={Users}
          />
          <QuickAction
            title="Configure Schema"
            description="Define entity types and actions for type-safe policy validation"
            href="/schema"
            icon={Database}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({ title, description, href, icon: Icon }: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
