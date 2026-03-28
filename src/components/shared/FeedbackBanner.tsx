interface FeedbackBannerProps {
    type: 'success' | 'error';
    message: string;
}

export function FeedbackBanner({ type, message }: FeedbackBannerProps) {
    const cls = type === 'success'
        ? 'bg-success-light text-success border-success/20'
        : 'bg-error-light text-error border-error/20';

    return (
        <div className={`px-4 py-3 rounded-lg text-sm border ${cls}`}>
            {message}
        </div>
    );
}
