import { use } from 'react'
import StockTransferFormPage from '../../new/page'

export default function EditStockTransferPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <StockTransferFormPage params={Promise.resolve({ id: resolvedParams.id })} />
}
