export interface GastifyTransactionItem {
  name: string
  qty?: number
  price: number
  category?: string
  subcategory?: string
}

export interface GastifyTransaction {
  id: string
  date: string
  merchant: string
  items: GastifyTransactionItem[]
  category: string
}
