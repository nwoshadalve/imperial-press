interface Props {
  doi: string;
}

export function DOILink({ doi }: Props) {
  return (
    <a
      href={`https://doi.org/${doi}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] hover:underline text-sm font-mono"
    >
      {doi}
    </a>
  );
}
