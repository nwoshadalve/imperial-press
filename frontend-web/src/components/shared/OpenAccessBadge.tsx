import { Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function OpenAccessBadge() {
  return (
    <Badge variant="success">
      <Unlock size={10} />
      Open Access
    </Badge>
  );
}
