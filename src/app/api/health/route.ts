import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
    try {
        const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/`);
        const text = await response.text();
        return NextResponse.json({ status: 'connected', message: text });
    } catch (error) {
        return NextResponse.json(
            { status: 'disconnected', error: String(error) },
            { status: 503 }
        );
    }
}
