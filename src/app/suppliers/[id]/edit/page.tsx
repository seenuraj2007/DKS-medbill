import { use } from 'react'
import SupplierFormPage from '../../new/page'

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <SupplierFormPage params={Promise.resolve({ id: resolvedParams.id })} />
}
