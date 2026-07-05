/**
 * Reset and seed Ember Kitchen menu data via Supabase service role.
 *
 * Requires in .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:menu
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env optional if vars already exported
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing env vars. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env\n' +
      '(Service role key: Supabase Dashboard → Project Settings → API → service_role)',
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const categories = [
  { name: 'Rice & Noodles', slug: 'rice-noodles' },
  { name: 'Soups & Swallow', slug: 'soups-swallow' },
  { name: 'Grills & Proteins', slug: 'grills-proteins' },
  { name: 'Small Chops & Sides', slug: 'small-chops' },
  { name: 'Drinks & Smoothies', slug: 'drinks' },
]

const MEAL = 'https://www.themealdb.com/images/media/meals'
const DRINK = 'https://www.thecocktaildb.com/images/media/drink'

const menuItems = [
  { name: 'Jollof Rice & Chicken', description: 'Smoky party-style jollof with grilled chicken thigh', price: 3500, image_url: `${MEAL}/j8c1d51782772399.jpg`, category: 'rice-noodles' },
  { name: 'Fried Rice & Beef', description: 'Wok-style fried rice with tender beef strips', price: 3800, image_url: `${MEAL}/wuyd2h1765655837.jpg`, category: 'rice-noodles' },
  { name: 'Coconut Rice & Fish', description: 'Fragrant coconut rice with peppered tilapia', price: 4200, image_url: `${MEAL}/5r5rvx1763287943.jpg`, category: 'rice-noodles' },
  { name: 'White Rice & Stew', description: 'Steamed rice with rich tomato stew and choice protein', price: 3200, image_url: `${MEAL}/k07k271782502861.jpg`, category: 'rice-noodles' },
  { name: 'Special Fried Rice (Large)', description: 'Loaded fried rice with prawns, chicken, and veggies', price: 4500, image_url: `${MEAL}/hblwvg1763478203.jpg`, category: 'rice-noodles' },
  { name: 'Spaghetti Bolognese', description: 'Classic spaghetti in slow-cooked beef sauce', price: 3000, image_url: `${MEAL}/sutysw1468247559.jpg`, category: 'rice-noodles' },
  { name: 'Chinese Fried Rice', description: 'Nigerian-style Chinese fried rice with soy glaze', price: 3400, image_url: `${MEAL}/zry07j1763779321.jpg`, category: 'rice-noodles' },
  { name: 'Party Jollof (Family Pack)', description: 'Large tray jollof — feeds 4–5', price: 8500, image_url: `${MEAL}/j8c1d51782772399.jpg`, category: 'rice-noodles' },
  { name: 'Egusi Soup (1 wrap)', description: 'Ground melon seed soup with assorted meat', price: 2800, image_url: `${MEAL}/sqpqtp1515365614.jpg`, category: 'soups-swallow' },
  { name: 'Ogbono Soup (1 wrap)', description: 'Draw soup with stockfish and bush meat', price: 2700, image_url: `${MEAL}/mlkjeu1782775816.jpg`, category: 'soups-swallow' },
  { name: 'Afang Soup (1 wrap)', description: 'Cross River afang with periwinkle and crayfish', price: 3200, image_url: `${MEAL}/x2fw9e1560460636.jpg`, category: 'soups-swallow' },
  { name: 'Edikaikong (1 wrap)', description: 'Vegetable soup with ugu and waterleaf', price: 3000, image_url: `${MEAL}/1529446137.jpg`, category: 'soups-swallow' },
  { name: 'Pepper Soup (Goat)', description: 'Spicy goat meat pepper soup — perfect starter', price: 3500, image_url: `${MEAL}/pbzcrx1763765096.jpg`, category: 'soups-swallow' },
  { name: 'Banga Soup (1 wrap)', description: 'Palm nut soup with fresh fish and starch', price: 2900, image_url: `${MEAL}/sxxpst1468569714.jpg`, category: 'soups-swallow' },
  { name: 'Suya Platter', description: 'Spicy grilled beef suya with onions and tomatoes', price: 4000, image_url: `${MEAL}/pkopc31683207947.jpg`, category: 'grills-proteins' },
  { name: 'Grilled Chicken (Full)', description: 'Whole grilled chicken with pepper sauce', price: 5500, image_url: `${MEAL}/cj56fs1762340001.jpg`, category: 'grills-proteins' },
  { name: 'Peppered Goat Meat', description: 'Smoky goat meat in spicy pepper sauce', price: 4500, image_url: `${MEAL}/uc9qp11764796575.jpg`, category: 'grills-proteins' },
  { name: 'Asun (Spicy Goat)', description: 'Party-style diced goat in habanero glaze', price: 4800, image_url: `${MEAL}/cuio7s1555492979.jpg`, category: 'grills-proteins' },
  { name: 'Grilled Catfish', description: 'Whole catfish grilled with pepper rub', price: 5200, image_url: `${MEAL}/lpd4wy1614347943.jpg`, category: 'grills-proteins' },
  { name: 'Chicken Wings (6 pcs)', description: 'Crispy wings with choice of suya or pepper sauce', price: 3200, image_url: `${MEAL}/4hzyvq1763792564.jpg`, category: 'grills-proteins' },
  { name: 'Puff Puff (10 pcs)', description: 'Golden fried dough balls — lightly sweet', price: 800, image_url: `${MEAL}/adxcbq1619787919.jpg`, category: 'small-chops' },
  { name: 'Spring Rolls (6 pcs)', description: 'Crispy veggie spring rolls with chilli dip', price: 1500, image_url: `${MEAL}/tvvxpv1511191952.jpg`, category: 'small-chops' },
  { name: 'Samosa (4 pcs)', description: 'Spiced mince samosas with pepper sauce', price: 1200, image_url: `${MEAL}/rvtvuw1511190488.jpg`, category: 'small-chops' },
  { name: 'Fried Plantain (Dodo)', description: 'Sweet ripe plantain slices — side or snack', price: 1000, image_url: `${MEAL}/x7cbsp1779811798.jpg`, category: 'small-chops' },
  { name: 'Coleslaw Side', description: 'Creamy cabbage slaw — pairs with grills', price: 600, image_url: `${MEAL}/bqx8mc1782684286.jpg`, category: 'small-chops' },
  { name: 'Coca-Cola 50cl', description: 'Chilled Coca-Cola bottle', price: 500, image_url: `${DRINK}/yqstxr1479209367.jpg`, category: 'drinks' },
  { name: 'Fanta Orange 50cl', description: 'Chilled Fanta Orange bottle', price: 500, image_url: `${DRINK}/ytsxxw1441167732.jpg`, category: 'drinks' },
  { name: 'Sprite 50cl', description: 'Chilled Sprite bottle', price: 500, image_url: `${DRINK}/q5z4841582484168.jpg`, category: 'drinks' },
  { name: 'Chapman', description: 'Nigerian mocktail — fruity and refreshing', price: 1200, image_url: `${DRINK}/wyrsxu1441554538.jpg`, category: 'drinks' },
  { name: 'Zobo Drink', description: 'Hibiscus drink lightly sweetened', price: 800, image_url: `${DRINK}/txustu1473344310.jpg`, category: 'drinks' },
  { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 1500, image_url: `${DRINK}/su1olx1582473812.jpg`, category: 'drinks' },
  { name: 'Bottled Water 75cl', description: 'Pure table water', price: 300, image_url: `${DRINK}/nzlyc81605905755.jpg`, category: 'drinks' },
  { name: 'Malt Drink', description: 'Malta Guinness or equivalent malt', price: 600, image_url: `${DRINK}/q7w4xu1487603180.jpg`, category: 'drinks' },
]

const addonsByItem = {
  'Jollof Rice & Chicken': [
    { name: 'Extra Chicken Piece', price: 800 },
    { name: 'Fried Plantain Side', price: 500 },
    { name: 'Coleslaw Side', price: 400 },
  ],
  'Fried Rice & Beef': [
    { name: 'Extra Beef Portion', price: 900 },
    { name: 'Fried Plantain Side', price: 500 },
  ],
  'Grilled Chicken (Full)': [
    { name: 'Extra Pepper Sauce', price: 200 },
    { name: 'Jollof Rice Side', price: 1200 },
    { name: 'Fried Plantain Side', price: 500 },
  ],
  'Suya Platter': [
    { name: 'Extra Suya Spice', price: 150 },
    { name: 'Extra Onions & Tomatoes', price: 200 },
  ],
  'Pepper Soup (Goat)': [{ name: 'Extra Goat Portion', price: 1000 }],
  'Spaghetti Bolognese': [{ name: 'Garlic Bread Side', price: 600 }],
  Chapman: [{ name: 'Extra Fruit Slice', price: 300 }],
}

async function deleteAll(table, column = 'id') {
  const { error } = await supabase.from(table).delete().neq(column, '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(`${table} delete: ${error.message}`)
}

async function main() {
  console.log('Clearing existing menu and order data…')
  await deleteAll('order_status_events')
  await deleteAll('order_items')
  await deleteAll('orders')
  await deleteAll('menu_addons')
  await deleteAll('menu_items')
  await deleteAll('categories')

  console.log('Inserting categories…')
  const { data: insertedCategories, error: catError } = await supabase
    .from('categories')
    .insert(categories)
    .select()
  if (catError) throw catError

  const categoryBySlug = Object.fromEntries(insertedCategories.map(c => [c.slug, c.id]))

  console.log('Inserting menu items…')
  const rows = menuItems.map(item => ({
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    is_available: true,
    category_id: categoryBySlug[item.category],
  }))

  const { data: insertedItems, error: itemError } = await supabase.from('menu_items').insert(rows).select('id, name')
  if (itemError) throw itemError

  const itemIdByName = Object.fromEntries(insertedItems.map(i => [i.name, i.id]))

  console.log('Inserting add-ons…')
  const addonRows = []
  for (const [itemName, addons] of Object.entries(addonsByItem)) {
    const menuItemId = itemIdByName[itemName]
    if (!menuItemId) continue
    for (const addon of addons) {
      addonRows.push({ menu_item_id: menuItemId, name: addon.name, price: addon.price, is_available: true })
    }
  }

  if (addonRows.length) {
    const { error: addonError } = await supabase.from('menu_addons').insert(addonRows)
    if (addonError) throw addonError
  }

  console.log(`Done. Seeded ${insertedCategories.length} categories, ${insertedItems.length} menu items, ${addonRows.length} add-ons.`)
}

main().catch(err => {
  console.error(err.message ?? err)
  process.exit(1)
})
