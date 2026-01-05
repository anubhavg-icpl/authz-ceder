import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { env } from '@/lib/env';

// Types for Cedar Agent
const PolicySchema = t.Object({
    id: t.String(),
    content: t.String(),
});

const PolicyUpdateSchema = t.Object({
    content: t.String(),
});

const EntitySchema = t.Object({
    uid: t.Object({
        type: t.String(),
        id: t.String(),
    }),
    attrs: t.Optional(t.Record(t.String(), t.Unknown())),
    parents: t.Optional(t.Array(t.Object({
        type: t.String(),
        id: t.String(),
    }))),
});

const AuthorizationRequestSchema = t.Object({
    principal: t.Optional(t.String()),
    action: t.Optional(t.String()),
    resource: t.Optional(t.String()),
    context: t.Optional(t.Record(t.String(), t.Unknown())),
    entities: t.Optional(t.Array(EntitySchema)),
    additional_entities: t.Optional(t.Array(EntitySchema)),
});

const AuthorizationResponseSchema = t.Object({
    decision: t.Union([t.Literal('Allow'), t.Literal('Deny')]),
    diagnostics: t.Object({
        reason: t.Array(t.String()),
        errors: t.Array(t.String()),
    }),
});

// Cedar Agent proxy helper
async function cedarFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${env.CEDAR_AGENT_URL}/v1${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text().catch(() => 'Unknown error');
        throw new Error(error);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// Create Elysia app with all Cedar Agent routes
export const app = new Elysia({ prefix: '/api' })
    .use(swagger({
        path: '/docs',
        documentation: {
            info: {
                title: 'Cedar Authorization API',
                version: '1.0.0',
                description: 'API for managing Cedar policies, entities, and authorization checks',
            },
            tags: [
                { name: 'Health', description: 'Health check endpoints' },
                { name: 'Policies', description: 'Policy management' },
                { name: 'Entities', description: 'Entity/data management' },
                { name: 'Schema', description: 'Schema management' },
                { name: 'Authorization', description: 'Authorization checks' },
            ],
        },
    }))

    // Health Check
    .get('/health', async () => {
        try {
            const response = await fetch(`${env.CEDAR_AGENT_URL}/v1/`);
            const text = await response.text();
            return { status: 'connected', message: text };
        } catch (error) {
            return { status: 'disconnected', error: String(error) };
        }
    }, {
        detail: { tags: ['Health'], summary: 'Check Cedar Agent connection' },
    })

    // Policies
    .get('/policies', async () => {
        return cedarFetch<unknown[]>('/policies');
    }, {
        detail: { tags: ['Policies'], summary: 'Get all policies' },
    })

    .post('/policies', async ({ body }) => {
        return cedarFetch('/policies', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }, {
        body: PolicySchema,
        detail: { tags: ['Policies'], summary: 'Create a new policy' },
    })

    .put('/policies', async ({ body }) => {
        return cedarFetch('/policies', {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }, {
        body: t.Array(PolicySchema),
        detail: { tags: ['Policies'], summary: 'Replace all policies' },
    })

    .get('/policies/:id', async ({ params: { id } }) => {
        return cedarFetch(`/policies/${encodeURIComponent(id)}`);
    }, {
        params: t.Object({ id: t.String() }),
        detail: { tags: ['Policies'], summary: 'Get a policy by ID' },
    })

    .put('/policies/:id', async ({ params: { id }, body }) => {
        return cedarFetch(`/policies/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }, {
        params: t.Object({ id: t.String() }),
        body: PolicyUpdateSchema,
        detail: { tags: ['Policies'], summary: 'Update a policy' },
    })

    .delete('/policies/:id', async ({ params: { id } }) => {
        await cedarFetch(`/policies/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        return { success: true };
    }, {
        params: t.Object({ id: t.String() }),
        detail: { tags: ['Policies'], summary: 'Delete a policy' },
    })

    // Entities/Data
    .get('/data', async () => {
        return cedarFetch<unknown[]>('/data');
    }, {
        detail: { tags: ['Entities'], summary: 'Get all entities' },
    })

    .put('/data', async ({ body }) => {
        return cedarFetch('/data', {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }, {
        body: t.Array(EntitySchema),
        detail: { tags: ['Entities'], summary: 'Replace all entities' },
    })

    .delete('/data', async () => {
        await cedarFetch('/data', { method: 'DELETE' });
        return { success: true };
    }, {
        detail: { tags: ['Entities'], summary: 'Delete all entities' },
    })

    // Schema
    .get('/schema', async () => {
        try {
            return await cedarFetch('/schema');
        } catch {
            return null;
        }
    }, {
        detail: { tags: ['Schema'], summary: 'Get the current schema' },
    })

    .put('/schema', async ({ body }) => {
        return cedarFetch('/schema', {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }, {
        body: t.Unknown(),
        detail: { tags: ['Schema'], summary: 'Update the schema' },
    })

    .delete('/schema', async () => {
        await cedarFetch('/schema', { method: 'DELETE' });
        return { success: true };
    }, {
        detail: { tags: ['Schema'], summary: 'Delete the schema' },
    })

    // Authorization
    .post('/authorize', async ({ body }) => {
        return cedarFetch<{ decision: 'Allow' | 'Deny'; diagnostics: { reason: string[]; errors: string[] } }>('/is_authorized', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }, {
        body: AuthorizationRequestSchema,
        response: AuthorizationResponseSchema,
        detail: { tags: ['Authorization'], summary: 'Check if an action is authorized' },
    });

// Export the app type for Eden client
export type App = typeof app;
