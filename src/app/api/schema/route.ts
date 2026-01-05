import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
    try {
        const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/schema`);
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(null);
            }
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/schema`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/schema`, {
            method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
