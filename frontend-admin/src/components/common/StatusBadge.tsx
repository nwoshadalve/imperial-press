import { Badge } from '@/components/ui/badge'

type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'accepted'
  | 'rejected'
  | 'published'
  | 'payment_pending'

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  draft:              { label: 'Draft',              variant: 'neutral'  },
  submitted:          { label: 'Submitted',          variant: 'info'     },
  under_review:       { label: 'Under Review',       variant: 'warning'  },
  revision_requested: { label: 'Revision Requested', variant: 'warning'  },
  accepted:           { label: 'Accepted',           variant: 'success'  },
  rejected:           { label: 'Rejected',           variant: 'error'    },
  published:          { label: 'Published',          variant: 'success'  },
  payment_pending:    { label: 'Payment Pending',    variant: 'warning'  },
}

interface Props {
  status: SubmissionStatus
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
