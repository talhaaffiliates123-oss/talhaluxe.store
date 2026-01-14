export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    public readonly context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `FirestoreError: Missing or insufficient permissions. The request was denied by security rules.\nContext: ${JSON.stringify(context, null, 2)}`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;

        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
