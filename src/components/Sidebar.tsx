'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, Home, FileText, Users, Database, CheckCircle, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const navigation = [
    {
        title: 'Dashboard',
        items: [
            { name: 'Overview', href: '/', icon: Home },
            { name: 'Scenarios', href: '/scenarios', icon: BookOpen },
        ],
    },
    {
        title: 'Authorization',
        items: [
            { name: 'Test Auth', href: '/authorize', icon: CheckCircle },
            { name: 'Policies', href: '/policies', icon: FileText },
            { name: 'Entities', href: '/entities', icon: Users },
            { name: 'Schema', href: '/schema', icon: Database },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
                    <Shield className="h-7 w-7 text-primary" />
                    <span className="text-lg font-bold text-sidebar-foreground">Cedar Auth</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 px-3 py-4">
                    {navigation.map((section) => (
                        <div key={section.title}>
                            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <Separator />

                {/* Footer */}
                <div className="p-4">
                    <div className="text-xs text-muted-foreground">Connected to</div>
                    <div className="text-sm font-mono text-sidebar-foreground">localhost:8180</div>
                </div>
            </div>
        </aside>
    );
}
