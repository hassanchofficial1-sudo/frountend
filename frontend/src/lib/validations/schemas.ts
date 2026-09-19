import { z } from 'zod'

// Auth
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginForm = z.infer<typeof loginSchema>

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Customer
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Pakistan'),
  notes: z.string().optional(),
})

// Product
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
})

export const productVariantSchema = z.object({
  productId: z.string(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().optional(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  stockQuantity: z.number().int().min(0).default(0),
  minStockLevel: z.number().int().min(0).default(10),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
})

// Category
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
})

// Order
export const orderItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
})

export const orderSchema = z.object({
  customerId: z.string(),
  source: z.enum(['SHOPIFY', 'WHATSAPP', 'MANUAL']).default('MANUAL'),
  status: z.enum(['NEW', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED', 'ON_HOLD']).default('NEW'),
  paymentType: z.enum(['ADVANCE', 'COD', 'FULL_PAYMENT', 'PARTIAL']).default('COD'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  shippingFee: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  advanceAmount: z.number().min(0).default(0),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().default('Pakistan'),
  courierId: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

// Payment
export const paymentSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  type: z.enum(['ADVANCE', 'COD', 'FULL_PAYMENT', 'PARTIAL']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_WALLET', 'CHEQUE', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

// Supplier
export const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Pakistan'),
  taxNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
})

// Purchase
export const purchaseItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1),
  unitCost: z.number().min(0),
})

export const purchaseSchema = z.object({
  invoiceNumber: z.string().min(3, 'Invoice number is required'),
  supplierId: z.string(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  purchaseDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

// Return
export const returnItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  condition: z.enum(['SELLABLE', 'DAMAGED']).default('SELLABLE'),
  notes: z.string().optional(),
})

export const returnSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  reason: z.enum(['CUSTOMER_REJECTED', 'WRONG_PRODUCT', 'WRONG_SIZE', 'DAMAGED', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'OTHER']),
  items: z.array(returnItemSchema).min(1, 'At least one item is required'),
  refundAmount: z.number().min(0).default(0),
  courierId: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

// Expense
export const expenseSchema = z.object({
  category: z.enum([
    'FACEBOOK_ADS', 'INSTAGRAM_ADS', 'GOOGLE_ADS', 'MARKETING',
    'TAX', 'ELECTRICITY', 'COURIER', 'PACKAGING',
    'SALARIES', 'RENT', 'SOFTWARE', 'MAINTENANCE', 'OFFICE', 'OTHER'
  ]),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().datetime(),
  description: z.string().min(3, 'Description is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_WALLET', 'CHEQUE', 'OTHER']).default('CASH'),
  reference: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
})

// Marketing Expense
export const marketingExpenseSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'OTHER']),
  campaignName: z.string().optional(),
  adSetName: z.string().optional(),
  adName: z.string().optional(),
  date: z.string().datetime(),
  amount: z.number().min(0.01),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  cpm: z.number().min(0).optional(),
  cpc: z.number().min(0).optional(),
  cpa: z.number().min(0).optional(),
  roas: z.number().min(0).optional(),
  notes: z.string().optional(),
  externalId: z.string().optional(),
})

// Electricity Bill
export const electricityBillSchema = z.object({
  meterNumber: z.string().min(3, 'Meter number is required'),
  previousReading: z.number().int().min(0),
  currentReading: z.number().int().min(0),
  billAmount: z.number().min(0.01),
  billDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_WALLET', 'CHEQUE', 'OTHER']).optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
}).refine((data) => data.currentReading >= data.previousReading, {
  message: 'Current reading must be greater than or equal to previous reading',
  path: ['currentReading'],
})

// Tax Record
export const taxRecordSchema = z.object({
  taxType: z.string().min(2, 'Tax type is required'),
  period: z.string().min(3, 'Period is required'),
  amount: z.number().min(0.01),
  dueDate: z.string().datetime(),
  paidDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
  reference: z.string().optional(),
  challanNo: z.string().optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
})

// Courier
export const courierSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').toUpperCase(),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  webhookSecret: z.string().optional(),
  supportsCOD: z.boolean().default(true),
  supportsTracking: z.boolean().default(true),
  settings: z.record(z.unknown()).optional(),
})

// Settings
export const businessSettingsSchema = z.object({
  businessName: z.string().min(2),
  logo: z.string().url().optional(),
  currency: z.string().length(3).default('PKR'),
  currencySymbol: z.string().min(1).default('Rs.'),
  timezone: z.string().default('Asia/Karachi'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  taxNumber: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
})

// User
export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'ORDER_MANAGER', 'STOCK_MANAGER']),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
})

// Date range
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Search
export const searchSchema = z.object({
  query: z.string().optional(),
  ...paginationSchema.shape,
  ...dateRangeSchema.shape,
})