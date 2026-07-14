import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  title: string
}

export default function PlaceholderPage({ title }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 pt-16 text-neutral-400">
        <Clock className="h-10 w-10" />
        <h2 className="text-lg font-semibold text-neutral-500 dark:text-neutral-300">{title}</h2>
        <p className="text-sm text-neutral-400">This page is under construction.</p>
      </CardContent>
    </Card>
  )
}
