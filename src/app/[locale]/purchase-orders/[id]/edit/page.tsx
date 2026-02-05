import { use } from 'react'
import PurchaseOrderFormPage from '../../new/page'

export default function EditPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <PurchaseOrderFormPage params={Promise.resolve({ id: resolvedParams.id })} />
}
