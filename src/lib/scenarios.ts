
import { Policy, Entity } from './cedar-client';

export interface Scenario {
    id: string;
    name: string;
    description: string;
    schema: unknown;
    policies: Policy[];
    entities: Entity[];
}

export const SCENARIOS: Scenario[] = [
    {
        id: 'rbac',
        name: 'Role-Based Access Control (RBAC)',
        description: 'Classic RBAC with Admin, Editor, and Viewer roles. Demonstrates role hierarchies and permission inheritance.',
        schema: {
            "": {
                "entityTypes": {
                    "User": {
                        "memberOfTypes": ["Role"]
                    },
                    "Role": {
                        "memberOfTypes": ["Role"]
                    },
                    "Document": {
                        "memberOfTypes": []
                    }
                },
                "actions": {
                    "view": {
                        "appliesTo": {
                            "principalTypes": ["Role", "User"],
                            "resourceTypes": ["Document"]
                        }
                    },
                    "edit": {
                        "appliesTo": {
                            "principalTypes": ["Role", "User"],
                            "resourceTypes": ["Document"]
                        }
                    },
                    "delete": {
                        "appliesTo": {
                            "principalTypes": ["Role", "User"],
                            "resourceTypes": ["Document"]
                        }
                    }
                }
            }
        },
        entities: [
            {
                uid: { type: "Role", id: "viewer" },
                parents: []
            },
            {
                uid: { type: "Role", id: "editor" },
                parents: [{ type: "Role", id: "viewer" }]
            },
            {
                uid: { type: "Role", id: "admin" },
                parents: [{ type: "Role", id: "editor" }]
            },
            {
                uid: { type: "User", id: "alice" },
                parents: [{ type: "Role", id: "admin" }]
            },
            {
                uid: { type: "User", id: "bob" },
                parents: [{ type: "Role", id: "viewer" }]
            },
            {
                uid: { type: "Document", id: "doc1" },
                parents: []
            }
        ],
        policies: [
            {
                id: "role-permissions",
                content: `
// Viewers can view documents
permit(
    principal in Role::"viewer",
    action == Action::"view",
    resource
);

// Editors can also edit documents (inherits view from viewer)
permit(
    principal in Role::"editor",
    action == Action::"edit",
    resource
);

// Admins can do everything (inherits edit from editor)
permit(
    principal in Role::"admin",
    action,
    resource
);`
            }
        ]
    },
    {
        id: 'abac',
        name: 'Attribute-Based Access Control (ABAC)',
        description: 'Access based on attributes like "department" or "security_level". Demonstrates conditions and attribute evaluation.',
        schema: {
            "": {
                "entityTypes": {
                    "User": {
                        "shape": {
                            "type": "Record",
                            "attributes": {
                                "department": { "type": "String" },
                                "clearance_level": { "type": "Long" }
                            }
                        }
                    },
                    "Document": {
                        "shape": {
                            "type": "Record",
                            "attributes": {
                                "owner": { "type": "Entity", "name": "User" },
                                "classification_level": { "type": "Long" },
                                "department": { "type": "String" }
                            }
                        }
                    }
                },
                "actions": {
                    "read": {
                        "appliesTo": {
                            "principalTypes": ["User"],
                            "resourceTypes": ["Document"]
                        }
                    }
                }
            }
        },
        entities: [
            {
                uid: { type: "User", id: "alice" },
                attrs: {
                    department: "engineering",
                    clearance_level: 3
                }
            },
            {
                uid: { type: "User", id: "bob" },
                attrs: {
                    department: "sales",
                    clearance_level: 1
                }
            },
            {
                uid: { type: "Document", id: "design_doc" },
                attrs: {
                    owner: { type: "User", id: "alice" },
                    classification_level: 2,
                    department: "engineering"
                }
            }
        ],
        policies: [
            {
                id: "department-match",
                content: `
// Users can only read documents in their own department
permit(
    principal,
    action == Action::"read",
    resource
)
when {
    principal.department == resource.department
};`
            },
            {
                id: "clearance-level",
                content: `
// Users must have sufficient clearance
permit(
    principal,
    action == Action::"read",
    resource
)
when {
    principal.clearance_level >= resource.classification_level
};`
            }
        ]
    },
    {
        id: 'doc-share',
        name: 'Document Sharing (Google Drive Style)',
        description: 'Owner, Editor, and Viewer permissions on individual resources. Demonstrates direct resource relationships.',
        schema: {
            "": {
                "entityTypes": {
                    "User": {},
                    "Document": {}
                },
                "actions": {
                    "view": {
                        "appliesTo": {
                            "principalTypes": ["User"],
                            "resourceTypes": ["Document"]
                        }
                    },
                    "edit": {
                        "appliesTo": {
                            "principalTypes": ["User"],
                            "resourceTypes": ["Document"]
                        }
                    },
                    "delete": {
                        "appliesTo": {
                            "principalTypes": ["User"],
                            "resourceTypes": ["Document"]
                        }
                    }
                }
            }
        },
        entities: [
            {
                uid: { type: "User", id: "owner" },
                parents: []
            },
            {
                uid: { type: "User", id: "collaborator" },
                parents: []
            },
            {
                uid: { type: "User", id: "stranger" },
                parents: []
            },
            {
                uid: { type: "Document", id: "shared_doc" },
                parents: []
            }
        ],
        policies: [
            {
                id: "owner-full-access",
                content: `
// Owner has full access to their specific document
permit(
    principal == User::"owner",
    action,
    resource == Document::"shared_doc"
);`
            },
            {
                id: "collaborator-access",
                content: `
// Collaborator can view and edit the specific document
permit(
    principal == User::"collaborator",
    action in [Action::"view", Action::"edit"],
    resource == Document::"shared_doc"
);`
            }
        ]
    }
];
