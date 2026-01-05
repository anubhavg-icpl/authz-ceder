'use client';

import { useEffect, useState } from 'react';
import { cedarClient, type Policy } from '@/lib/cedar-client';

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
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your Cedar authorization configuration</p>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="stat-content">
            <h4>Cedar Agent</h4>
            {loading ? (
              <div className="spinner" style={{ width: 20, height: 20 }} />
            ) : (
              <span className={`badge ${stats.healthy ? 'badge-success' : 'badge-danger'}`}>
                {stats.healthy ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div className="stat-content">
            <h4>Policies</h4>
            <div className="stat-value">{loading ? '–' : stats.policies}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h4>Entities</h4>
            <div className="stat-value">{loading ? '–' : stats.entities}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Start</h3>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <QuickAction
              title="Test Authorization"
              description="Check if a principal is allowed to perform an action on a resource"
              href="/authorize"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9,12 12,15 16,10" />
                </svg>
              }
            />
            <QuickAction
              title="Manage Policies"
              description="Create, edit, or delete Cedar policies that define your authorization rules"
              href="/policies"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              }
            />
            <QuickAction
              title="View Entities"
              description="Browse and update the entities (users, resources) in your authorization model"
              href="/entities"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, description, href, icon }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
        border: '1px solid var(--border-color)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-md)',
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginLeft: 'auto' }}>
        <polyline points="9,18 15,12 9,6" />
      </svg>
    </a>
  );
}
