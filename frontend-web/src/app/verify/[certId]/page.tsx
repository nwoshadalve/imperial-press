import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Certificate Verification' };

interface Props {
  params: Promise<{ certId: string }>;
}

interface CertVerifyResult {
  valid: boolean;
  paperTitle?: string;
  authorName?: string;
  issuedAt?: string;
}

async function verifyCertificate(certId: string): Promise<CertVerifyResult | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:8000'}/api/v1/certificates/${certId}/verify`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json() as Promise<CertVerifyResult>;
  } catch {
    return null;
  }
}

export default async function CertVerifyPage({ params }: Props) {
  const { certId } = await params;
  const result = await verifyCertificate(certId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
          Certificate Verification
        </h1>

        {result === null && (
          <div className="rounded-xl border border-[var(--color-error)] bg-[var(--color-bg)] p-6">
            <p className="text-[var(--color-error)] font-medium">
              Unable to verify this certificate.
            </p>
          </div>
        )}

        {result !== null && result.valid && (
          <div className="rounded-xl border border-[var(--color-success)] bg-[var(--color-bg)] p-6">
            <p className="text-[var(--color-success)] font-bold text-lg mb-2">Valid Certificate</p>
            {result.paperTitle && (
              <p className="text-[var(--color-text)]">{result.paperTitle}</p>
            )}
            {result.authorName && (
              <p className="text-[var(--color-muted)] text-sm mt-1">{result.authorName}</p>
            )}
          </div>
        )}

        {result !== null && !result.valid && (
          <div className="rounded-xl border border-[var(--color-error)] bg-[var(--color-bg)] p-6">
            <p className="text-[var(--color-error)] font-medium">
              This certificate is not valid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
