'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <Button variant="outline" onClick={() => router.back()} className={className}>
      <ArrowLeft className="w-4 h-4 mr-2" />Back
    </Button>
  )
}