import { use } from 'react'
import ProductFormPage from '../../new/page'
import { SubscriptionGate } from '@/components/SubscriptionGate'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <SubscriptionGate><ProductFormPage params={Promise.resolve({ id: resolvedParams.id })} /></SubscriptionGate>
}
