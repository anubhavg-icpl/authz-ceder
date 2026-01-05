import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/is_authorized`, {
            method: 'POST',
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
