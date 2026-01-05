// Cedar Agent API Client
// Uses Next.js API routes to proxy requests to cedar-agent (avoids CORS issues)

// Types based on OpenAPI spec
export interface Policy {
  id: string;
  content: string;
}

export interface PolicyUpdate {
  content: string;
}

export interface Entity {
  uid: {
    type: string;
    id: string;
  };
  attrs?: Record<string, unknown>;
  parents?: Array<{ type: string; id: string }>;
}

export interface AuthorizationRequest {
  principal?: string;
  action?: string;
  resource?: string;
  context?: Record<string, unknown>;
  entities?: Entity[];
  additional_entities?: Entity[];
}

export interface AuthorizationResponse {
  decision: 'Allow' | 'Deny';
  diagnostics: {
    reason: string[];
    errors: string[];
  };
}

export interface ErrorResponse {
  reason: string;
  description: string;
  code: number;
}

// API Client class - uses local API routes that proxy to cedar-agent
class CedarClient {
  private async fetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `/api${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      }));
      throw new Error(error.error || error.description || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Health Check
  async health(): Promise<string> {
    const response = await fetch('/api/health');
    const data = await response.json();
    if (data.status === 'connected') {
      return 'OK';
    }
    throw new Error(data.error || 'Disconnected');
  }

  // Policies
  async getPolicies(): Promise<Policy[]> {
    return this.fetch<Policy[]>('/policies');
  }

  async getPolicy(id: string): Promise<Policy> {
    return this.fetch<Policy>(`/policies/${encodeURIComponent(id)}`);
  }

  async createPolicy(policy: Policy): Promise<Policy> {
    return this.fetch<Policy>('/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updatePolicy(id: string, update: PolicyUpdate): Promise<Policy> {
    return this.fetch<Policy>(`/policies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async updatePolicies(policies: Policy[]): Promise<Policy[]> {
    return this.fetch<Policy[]>('/policies', {
      method: 'PUT',
      body: JSON.stringify(policies),
    });
  }

  async deletePolicy(id: string): Promise<void> {
    return this.fetch<void>(`/policies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Entities/Data
  async getEntities(): Promise<Entity[]> {
    return this.fetch<Entity[]>('/data');
  }

  async updateEntities(entities: Entity[]): Promise<Entity[]> {
    return this.fetch<Entity[]>('/data', {
      method: 'PUT',
      body: JSON.stringify(entities),
    });
  }

  async deleteEntities(): Promise<void> {
    return this.fetch<void>('/data', {
      method: 'DELETE',
    });
  }

  // Schema
  async getSchema(): Promise<unknown> {
    return this.fetch<unknown>('/schema');
  }

  async updateSchema(schema: unknown): Promise<unknown> {
    return this.fetch<unknown>('/schema', {
      method: 'PUT',
      body: JSON.stringify(schema),
    });
  }

  async deleteSchema(): Promise<void> {
    return this.fetch<void>('/schema', {
      method: 'DELETE',
    });
  }

  // Authorization
  async isAuthorized(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    return this.fetch<AuthorizationResponse>('/authorize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const cedarClient = new CedarClient();

// Export class for custom instances
export { CedarClient };
