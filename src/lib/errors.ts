/**
 * Structured error handling for painel-medico API routes
 */

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly userMessage: string;
    public readonly technicalMessage: string;
    public readonly requestId?: string;
    public readonly originalError?: Error;

    constructor(
        userMessage: string,
        technicalMessage: string,
        statusCode = 500,
        requestId?: string,
        originalError?: Error
    ) {
        super(technicalMessage);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.userMessage = userMessage;
        this.technicalMessage = technicalMessage;
        this.requestId = requestId;
        this.originalError = originalError;
    }
}

export class ValidationError extends ApiError {
    public readonly field?: string;
    constructor(userMessage: string, field?: string, requestId?: string) {
        super(userMessage, `Validation failed: ${userMessage}`, 400, requestId);
        this.name = 'ValidationError';
        this.field = field;
    }
}

export class NotFoundError extends ApiError {
    constructor(resource: string, requestId?: string) {
        super(`${resource} não encontrado`, `Resource not found: ${resource}`, 404, requestId);
        this.name = 'NotFoundError';
    }
}

export class ForbiddenError extends ApiError {
    constructor(userMessage = 'Acesso negado', requestId?: string) {
        super(userMessage, 'Forbidden access attempt', 403, requestId);
        this.name = 'ForbiddenError';
    }
}

export function formatErrorResponse(error: ApiError) {
    return {
        error: {
            message: error.userMessage,
            ...(error instanceof ValidationError && error.field ? { field: error.field } : {}),
            ...(error.requestId ? { request_id: error.requestId } : {}),
        },
    };
}

export function logError(error: ApiError | Error, requestId?: string) {
    const timestamp = new Date().toISOString();
    if (error instanceof ApiError) {
        console.error({ timestamp, request_id: error.requestId || requestId, error_type: error.name, status_code: error.statusCode, message: error.technicalMessage });
    } else {
        console.error({ timestamp, request_id: requestId, error_type: 'UnhandledError', message: error.message });
    }
}
