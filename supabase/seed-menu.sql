-- Ember Kitchen — reset menu data and seed ~30 products
-- Run in Supabase Dashboard → SQL Editor
-- Images use TheMealDB / TheCocktailDB stable CDNs (all verified reachable).

-- Clear transactional menu data
delete from order_status_events;
delete from order_items;
delete from orders;
delete from menu_addons;
delete from menu_items;
delete from categories;

-- Categories
insert into categories (name, slug) values
  ('Rice & Noodles', 'rice-noodles'),
  ('Soups & Swallow', 'soups-swallow'),
  ('Grills & Proteins', 'grills-proteins'),
  ('Small Chops & Sides', 'small-chops'),
  ('Drinks & Smoothies', 'drinks');

-- Menu items (prices in NGN)
with cats as (
  select slug, id from categories
)
insert into menu_items (name, description, price, image_url, is_available, category_id)
select v.name, v.description, v.price, v.image_url, true, c.id
from (values
  -- Rice & Noodles
  ('Jollof Rice & Chicken', 'Smoky party-style jollof with grilled chicken thigh', 3500, 'https://www.themealdb.com/images/media/meals/j8c1d51782772399.jpg', 'rice-noodles'),
  ('Fried Rice & Beef', 'Wok-style fried rice with tender beef strips', 3800, 'https://www.themealdb.com/images/media/meals/wuyd2h1765655837.jpg', 'rice-noodles'),
  ('Coconut Rice & Fish', 'Fragrant coconut rice with peppered tilapia', 4200, 'https://www.themealdb.com/images/media/meals/5r5rvx1763287943.jpg', 'rice-noodles'),
  ('White Rice & Stew', 'Steamed rice with rich tomato stew and choice protein', 3200, 'https://www.themealdb.com/images/media/meals/k07k271782502861.jpg', 'rice-noodles'),
  ('Special Fried Rice (Large)', 'Loaded fried rice with prawns, chicken, and veggies', 4500, 'https://www.themealdb.com/images/media/meals/hblwvg1763478203.jpg', 'rice-noodles'),
  ('Spaghetti Bolognese', 'Classic spaghetti in slow-cooked beef sauce', 3000, 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg', 'rice-noodles'),
  ('Chinese Fried Rice', 'Nigerian-style Chinese fried rice with soy glaze', 3400, 'https://www.themealdb.com/images/media/meals/zry07j1763779321.jpg', 'rice-noodles'),
  ('Party Jollof (Family Pack)', 'Large tray jollof — feeds 4–5', 8500, 'https://www.themealdb.com/images/media/meals/j8c1d51782772399.jpg', 'rice-noodles'),

  -- Soups & Swallow
  ('Egusi Soup (1 wrap)', 'Ground melon seed soup with assorted meat', 2800, 'https://www.themealdb.com/images/media/meals/sqpqtp1515365614.jpg', 'soups-swallow'),
  ('Ogbono Soup (1 wrap)', 'Draw soup with stockfish and bush meat', 2700, 'https://www.themealdb.com/images/media/meals/mlkjeu1782775816.jpg', 'soups-swallow'),
  ('Afang Soup (1 wrap)', 'Cross River afang with periwinkle and crayfish', 3200, 'https://www.themealdb.com/images/media/meals/x2fw9e1560460636.jpg', 'soups-swallow'),
  ('Edikaikong (1 wrap)', 'Vegetable soup with ugu and waterleaf', 3000, 'https://www.themealdb.com/images/media/meals/1529446137.jpg', 'soups-swallow'),
  ('Pepper Soup (Goat)', 'Spicy goat meat pepper soup — perfect starter', 3500, 'https://www.themealdb.com/images/media/meals/pbzcrx1763765096.jpg', 'soups-swallow'),
  ('Banga Soup (1 wrap)', 'Palm nut soup with fresh fish and starch', 2900, 'https://www.themealdb.com/images/media/meals/sxxpst1468569714.jpg', 'soups-swallow'),

  -- Grills & Proteins
  ('Suya Platter', 'Spicy grilled beef suya with onions and tomatoes', 4000, 'https://www.themealdb.com/images/media/meals/pkopc31683207947.jpg', 'grills-proteins'),
  ('Grilled Chicken (Full)', 'Whole grilled chicken with pepper sauce', 5500, 'https://www.themealdb.com/images/media/meals/cj56fs1762340001.jpg', 'grills-proteins'),
  ('Peppered Goat Meat', 'Smoky goat meat in spicy pepper sauce', 4500, 'https://www.themealdb.com/images/media/meals/uc9qp11764796575.jpg', 'grills-proteins'),
  ('Asun (Spicy Goat)', 'Party-style diced goat in habanero glaze', 4800, 'https://www.themealdb.com/images/media/meals/cuio7s1555492979.jpg', 'grills-proteins'),
  ('Grilled Catfish', 'Whole catfish grilled with pepper rub', 5200, 'https://www.themealdb.com/images/media/meals/lpd4wy1614347943.jpg', 'grills-proteins'),
  ('Chicken Wings (6 pcs)', 'Crispy wings with choice of suya or pepper sauce', 3200, 'https://www.themealdb.com/images/media/meals/4hzyvq1763792564.jpg', 'grills-proteins'),

  -- Small Chops & Sides
  ('Puff Puff (10 pcs)', 'Golden fried dough balls — lightly sweet', 800, 'https://www.themealdb.com/images/media/meals/adxcbq1619787919.jpg', 'small-chops'),
  ('Spring Rolls (6 pcs)', 'Crispy veggie spring rolls with chilli dip', 1500, 'https://www.themealdb.com/images/media/meals/tvvxpv1511191952.jpg', 'small-chops'),
  ('Samosa (4 pcs)', 'Spiced mince samosas with pepper sauce', 1200, 'https://www.themealdb.com/images/media/meals/rvtvuw1511190488.jpg', 'small-chops'),
  ('Fried Plantain (Dodo)', 'Sweet ripe plantain slices — side or snack', 1000, 'https://www.themealdb.com/images/media/meals/x7cbsp1779811798.jpg', 'small-chops'),
  ('Coleslaw Side', 'Creamy cabbage slaw — pairs with grills', 600, 'https://www.themealdb.com/images/media/meals/bqx8mc1782684286.jpg', 'small-chops'),

  -- Drinks & Smoothies
  ('Coca-Cola 50cl', 'Chilled Coca-Cola bottle', 500, 'https://www.thecocktaildb.com/images/media/drink/yqstxr1479209367.jpg', 'drinks'),
  ('Fanta Orange 50cl', 'Chilled Fanta Orange bottle', 500, 'https://www.thecocktaildb.com/images/media/drink/ytsxxw1441167732.jpg', 'drinks'),
  ('Sprite 50cl', 'Chilled Sprite bottle', 500, 'https://www.thecocktaildb.com/images/media/drink/q5z4841582484168.jpg', 'drinks'),
  ('Chapman', 'Nigerian mocktail — fruity and refreshing', 1200, 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg', 'drinks'),
  ('Zobo Drink', 'Hibiscus drink lightly sweetened', 800, 'https://www.thecocktaildb.com/images/media/drink/txustu1473344310.jpg', 'drinks'),
  ('Fresh Orange Juice', 'Freshly squeezed orange juice', 1500, 'https://www.thecocktaildb.com/images/media/drink/su1olx1582473812.jpg', 'drinks'),
  ('Bottled Water 75cl', 'Pure table water', 300, 'https://www.thecocktaildb.com/images/media/drink/nzlyc81605905755.jpg', 'drinks'),
  ('Malt Drink', 'Malta Guinness or equivalent malt', 600, 'https://www.thecocktaildb.com/images/media/drink/q7w4xu1487603180.jpg', 'drinks')
) as v(name, description, price, image_url, slug)
join cats c on c.slug = v.slug;

-- Add-ons for selected items
insert into menu_addons (menu_item_id, name, price, is_available)
select m.id, a.name, a.price, true
from menu_items m
join (values
  ('Jollof Rice & Chicken', 'Extra Chicken Piece', 800),
  ('Jollof Rice & Chicken', 'Fried Plantain Side', 500),
  ('Jollof Rice & Chicken', 'Coleslaw Side', 400),
  ('Fried Rice & Beef', 'Extra Beef Portion', 900),
  ('Fried Rice & Beef', 'Fried Plantain Side', 500),
  ('Grilled Chicken (Full)', 'Extra Pepper Sauce', 200),
  ('Grilled Chicken (Full)', 'Jollof Rice Side', 1200),
  ('Grilled Chicken (Full)', 'Fried Plantain Side', 500),
  ('Suya Platter', 'Extra Suya Spice', 150),
  ('Suya Platter', 'Extra Onions & Tomatoes', 200),
  ('Pepper Soup (Goat)', 'Extra Goat Portion', 1000),
  ('Spaghetti Bolognese', 'Garlic Bread Side', 600),
  ('Chapman', 'Extra Fruit Slice', 300)
) as a(item_name, name, price) on m.name = a.item_name;
