import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const productTypeEnum = pgEnum('product_type', ['original', 'print']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const shippingRegionEnum = pgEnum('shipping_region', ['kenya', 'international']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'success',
  'failed',
  'abandoned',
]);

export const contactSubjectEnum = pgEnum('contact_subject', [
  'originals',
  'prints',
  'interior',
  'commission',
  'general',
]);

export const emailStatusEnum = pgEnum('email_status', ['sent', 'failed']);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const artworks = pgTable('artworks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url'),
  medium: text('medium').notNull(),
  dimensions: text('dimensions'),
  year: integer('year'),
  description: text('description'),
  featured: boolean('featured').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  artworkId: uuid('artwork_id')
    .notNull()
    .references(() => artworks.id, { onDelete: 'cascade' }),
  type: productTypeEnum('type').notNull(),
  priceKes: integer('price_kes').notNull(),
  editionSize: integer('edition_size'),
  stockRemaining: integer('stock_remaining').notNull(),
  manuallyMarkedSold: boolean('manually_marked_sold').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Single-row configuration table — always queried as-is; never insert a second row.
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  heroVideoUrl: text('hero_video_url'),
  heroPosterUrl: text('hero_poster_url'),
  homeTagline: text('home_tagline').notNull().default(''),
  homeArtistStatement: text('home_artist_statement').notNull().default(''),
  aboutBio: text('about_bio').notNull().default(''),
  aboutStatementQuote: text('about_statement_quote').notNull().default(''),
  aboutPortraitUrl: text('about_portrait_url'),
  aboutStudioUrl: text('about_studio_url'),
  contactEmail: text('contact_email').notNull().default(''),
  instagramHandle: text('instagram_handle').notNull().default(''),
  pinterestHandle: text('pinterest_handle').notNull().default(''),
  mailingBannerHeading: text('mailing_banner_heading').notNull().default(''),
  mailingBannerSubheading: text('mailing_banner_subheading').notNull().default(''),
  shippingFeeKenyaKes: integer('shipping_fee_kenya_kes').notNull().default(0),
  shippingFeeInternationalKes: integer('shipping_fee_international_kes').notNull().default(0),
  usdExchangeRate: numeric('usd_exchange_rate', { precision: 10, scale: 4, mode: 'number' })
    .notNull()
    .default(130),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  shippingStreet: text('shipping_street').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingCountry: text('shipping_country').notNull(),
  shippingPostalCode: text('shipping_postal_code'),
  shippingRegion: shippingRegionEnum('shipping_region').notNull(),
  subtotalKes: integer('subtotal_kes').notNull(),
  shippingFeeKes: integer('shipping_fee_kes').notNull(),
  totalKes: integer('total_kes').notNull(),
  status: orderStatusEnum('status').notNull().default('pending_payment'),
  needsReview: boolean('needs_review').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  // nullable: if the product is later removed, snapshot data preserves history
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  titleSnapshot: text('title_snapshot').notNull(),
  priceKesSnapshot: integer('price_kes_snapshot').notNull(),
  quantity: integer('quantity').notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  paystackReference: text('paystack_reference').notNull().unique(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amountKes: integer('amount_kes').notNull(),
  channel: text('channel'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  rawPayload: jsonb('raw_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mailingListSubscribers = pgTable('mailing_list_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: contactSubjectEnum('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  read: boolean('read').notNull().default(false),
});

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailNotifications = pgTable('email_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  action: text('action').notNull(),
  status: emailStatusEnum('status').notNull(),
  resendResponse: jsonb('resend_response'),
  metadata: jsonb('metadata'),
  timeCreated: timestamp('time_created', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const artworksRelations = relations(artworks, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  artwork: one(artworks, { fields: [products.artworkId], references: [artworks.id] }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
