// Prisma enums are now strings - define as const types

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ACCOUNTS' | 'ORDER_MANAGER' | 'STOCK_MANAGER'
export type OrderSource = 'SHOPIFY' | 'WHATSAPP' | 'MANUAL'
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'ON_HOLD'
export type PaymentType = 'ADVANCE' | 'COD' | 'FULL_PAYMENT' | 'PARTIAL'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'ADVANCE_RECEIVED' | 'COD_PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
export type ShipmentStatus = 'BOOKED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'FAILED'
export type CODStatus = 'PENDING' | 'COLLECTED' | 'SETTLED' | 'PARTIAL' | 'FAILED'
export type InventoryMovementType = 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT' | 'INITIAL_STOCK'
export type StockCondition = 'SELLABLE' | 'DAMAGED'
export type ReturnReason = 'CUSTOMER_REJECTED' | 'WRONG_PRODUCT' | 'WRONG_SIZE' | 'DAMAGED' | 'DEFECTIVE' | 'NOT_AS_DESCRIBED' | 'OTHER'
export type ExpenseCategory = 'FACEBOOK_ADS' | 'INSTAGRAM_ADS' | 'GOOGLE_ADS' | 'MARKETING' | 'TAX' | 'ELECTRICITY' | 'COURIER' | 'PACKAGING' | 'SALARIES' | 'RENT' | 'SOFTWARE' | 'MAINTENANCE' | 'OFFICE' | 'OTHER'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_WALLET' | 'CHEQUE' | 'OTHER'
export type TaxStatus = 'PENDING' | 'PAID' | 'OVERDUE'
export type ElectricityBillStatus = 'PENDING' | 'PAID' | 'OVERDUE'
export type SyncStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'PENDING'
export type IntegrationType = 'SHOPIFY' | 'WHATSAPP' | 'COURIER' | 'META_ADS'

export interface DashboardMetrics {
  orders: {
    total: number
    shopify: number
    whatsapp: number
    manual: number
    new: number
    confirmed: number
    packed: number
    dispatched: number
    inTransit: number
    outForDelivery: number
    delivered: number
    returned: number
    cancelled: number
  }
  payments: {
    totalSales: number
    advanceReceived: number
    codReceived: number
    codPending: number
    refunds: number
    totalOutstanding: number
  }
  inventory: {
    totalProducts: number
    totalUnits: number
    lowStock: number
    outOfStock: number
    inventoryValue: number
  }
  expenses: {
    total: number
    facebookAds: number
    tax: number
    electricity: number
    courier: number
    packaging: number
    other: number
  }
  financial: {
    totalRevenue: number
    totalReceived: number
    totalPending: number
    totalExpenses: number
    totalPurchases: number
    netProfitLoss: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    fill?: boolean
  }[]
}

export interface DateRangeOption {
  value: string
  label: string
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export interface SelectOption {
  value: string
  label: string
}

export const ORDER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ON_HOLD', label: 'On Hold' },
]

export const ORDER_SOURCE_OPTIONS: SelectOption[] = [
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'MANUAL', label: 'Manual' },
]

export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'ADVANCE_RECEIVED', label: 'Advance Received' },
  { value: 'COD_PENDING', label: 'COD Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
]

export const PAYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'ADVANCE', label: 'Advance' },
  { value: 'COD', label: 'COD' },
  { value: 'FULL_PAYMENT', label: 'Full Payment' },
  { value: 'PARTIAL', label: 'Partial' },
]

export const SHIPMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'BOOKED', label: 'Booked' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
]

export const COD_STATUS_OPTIONS: SelectOption[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COLLECTED', label: 'Collected' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'FAILED', label: 'Failed' },
]

export const EXPENSE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'FACEBOOK_ADS', label: 'Facebook Ads' },
  { value: 'INSTAGRAM_ADS', label: 'Instagram Ads' },
  { value: 'GOOGLE_ADS', label: 'Google Ads' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'TAX', label: 'Tax' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'COURIER', label: 'Courier' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'RENT', label: 'Rent' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'OTHER', label: 'Other' },
]

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ACCOUNTS', label: 'Accounts' },
  { value: 'ORDER_MANAGER', label: 'Order Manager' },
  { value: 'STOCK_MANAGER', label: 'Stock Manager' },
]

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE_WALLET', label: 'Mobile Wallet' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
]

export const RETURN_REASON_OPTIONS: SelectOption[] = [
  { value: 'CUSTOMER_REJECTED', label: 'Customer Rejected' },
  { value: 'WRONG_PRODUCT', label: 'Wrong Product' },
  { value: 'WRONG_SIZE', label: 'Wrong Size' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'DEFECTIVE', label: 'Defective' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as Described' },
  { value: 'OTHER', label: 'Other' },
]

export const TAX_STATUS_OPTIONS: SelectOption[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
]

export const ELECTRICITY_BILL_STATUS_OPTIONS: SelectOption[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
]

export const INTEGRATION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'COURIER', label: 'Courier' },
  { value: 'META_ADS', label: 'Meta Ads' },
]

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}