-- Hotel Tukuche Peak — seed data (idempotent: only seeds tables that are empty).
-- pgcrypto's crypt(..., gen_salt('bf')) produces $2a$ bcrypt hashes that bcryptjs can verify.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================ ROOMS ============================
INSERT INTO rooms (slug, name, description, long_description, price, capacity, total_units, size_sqm, beds, amenities, images, featured, sort)
SELECT * FROM (VALUES
  (
    'glacier-panorama-suite',
    'Glacier Panorama Suite',
    'Our crown jewel — a glass-walled suite framing the full Dhaulagiri massif from a private soaking tub.',
    'The Glacier Panorama Suite is the finest address in Tukuche. Floor-to-ceiling glass wraps two walls, opening onto an uninterrupted view of the Dhaulagiri massif. A freestanding stone soaking tub sits beside the window, heated slate floors warm bare feet at dawn, and a private terrace catches the first alpenglow. Hand-loomed alpine linen, brushed-brass fittings, and a pillow menu complete the sanctuary.',
    480, 3, 2, 62, '1 King + 1 Single',
    '["Panoramic mountain view","Private terrace","Stone soaking tub","Heated floors","Espresso machine","Rain shower","Smart TV","Minibar","Free Wi-Fi","Butler service"]'::jsonb,
    '["/images/rooms/glacier-suite-1.png","/images/rooms/glacier-suite-2.png"]'::jsonb,
    TRUE, 1
  ),
  (
    'summit-deluxe-king',
    'Summit Deluxe King',
    'A refined king room with a picture window over the orchards and peaks beyond.',
    'The Summit Deluxe King balances warmth and grandeur. A generous king bed dressed in highland wool faces a picture window that frames Tukuche village and the peaks above. Expect a walk-in rain shower, a reading nook, and the same brushed-brass detailing found throughout the hotel.',
    320, 2, 4, 42, '1 King',
    '["Mountain view","Rain shower","Heated floors","Espresso machine","Smart TV","Minibar","Free Wi-Fi","Work desk"]'::jsonb,
    '["/images/rooms/summit-deluxe-1.png","/images/rooms/summit-deluxe-2.png"]'::jsonb,
    TRUE, 2
  ),
  (
    'heritage-family-loft',
    'Heritage Family Loft',
    'A two-level loft for families, blending Thakali heritage craft with modern comfort.',
    'The Heritage Family Loft spans two levels, sleeping up to four. Reclaimed timber beams and traditional Thakali textiles meet underfloor heating and a spacious bathroom. The mezzanine is perfect for children, while parents enjoy the lower lounge and mountain-facing window seat.',
    380, 4, 3, 55, '1 King + 2 Singles',
    '["Mountain view","Two levels","Heated floors","Family lounge","Smart TV","Minibar","Free Wi-Fi","Tea station"]'::jsonb,
    '["/images/rooms/heritage-family-1.png","/images/rooms/heritage-family-2.png"]'::jsonb,
    FALSE, 3
  ),
  (
    'alpine-twin',
    'Alpine Twin',
    'An intimate twin room for friends and trekkers, warm and light-filled.',
    'The Alpine Twin is our most intimate room — two plush single beds, a sunlit corner window, and all the warmth of heated floors and alpine linen. A favourite of trekking companions and friends exploring the Kali Gandaki.',
    220, 2, 6, 28, '2 Singles',
    '["Village view","Heated floors","Rain shower","Smart TV","Free Wi-Fi","Tea station"]'::jsonb,
    '["/images/rooms/alpine-twin-1.png","/images/rooms/alpine-twin-2.png"]'::jsonb,
    FALSE, 4
  )
) AS v(slug, name, description, long_description, price, capacity, total_units, size_sqm, beds, amenities, images, featured, sort)
WHERE NOT EXISTS (SELECT 1 FROM rooms LIMIT 1);

-- ============================ RESTAURANT ============================
INSERT INTO menu_categories (name, sort)
SELECT * FROM (VALUES
  ('Breakfast', 1),
  ('Thakali Classics', 2),
  ('From the Highland Grill', 3),
  ('Desserts', 4),
  ('Beverages', 5)
) AS v(name, sort)
WHERE NOT EXISTS (SELECT 1 FROM menu_categories LIMIT 1);

INSERT INTO menu_items (category_id, name, description, price, image, dietary, featured, sort)
SELECT c.id, i.name, i.description, i.price, i.image, i.dietary, i.featured, i.sort
FROM (VALUES
  ('Thakali Classics', 'Tukuche Thakali Dal Bhat', 'The definitive Thakali set — steamed rice, black lentil dal, seasonal tarkari, gundruk, and house pickle.', 16, '/images/dish-thakali.png', '["Vegetarian"]'::jsonb, TRUE, 1),
  ('Thakali Classics', 'Buckwheat Dhido', 'Highland buckwheat dhido with local ghee, greens, and fermented radish.', 12, NULL, '["Vegetarian","Gluten-free"]'::jsonb, FALSE, 2),
  ('From the Highland Grill', 'Pan-Seared Kali Gandaki Trout', 'Line-caught river trout, brown butter, capers, and highland herbs.', 24, NULL, '[]'::jsonb, TRUE, 1),
  ('From the Highland Grill', 'Mustang Marpha Apple-Glazed Pork', 'Slow-cooked pork glazed with Marpha apple cider, roasted root vegetables.', 22, NULL, '[]'::jsonb, TRUE, 2),
  ('Breakfast', 'Himalayan Sunrise Breakfast', 'Eggs your way, buckwheat pancakes, seasonal fruit, and Marpha apple compote.', 14, NULL, '["Vegetarian"]'::jsonb, TRUE, 1),
  ('Breakfast', 'Tibetan Butter Tea & Tsampa', 'Traditional churned butter tea with roasted barley tsampa.', 8, NULL, '["Vegetarian"]'::jsonb, FALSE, 2),
  ('Desserts', 'Sea Buckthorn Panna Cotta', 'Silky panna cotta with a tart highland sea-buckthorn coulis.', 9, NULL, '["Vegetarian"]'::jsonb, FALSE, 1),
  ('Beverages', 'Marpha Apple Brandy', 'The famed local apple brandy, served neat.', 7, NULL, '[]'::jsonb, FALSE, 1),
  ('Beverages', 'Himalayan Herbal Infusion', 'A warming blend of local mountain herbs.', 5, NULL, '["Vegetarian","Vegan"]'::jsonb, FALSE, 2)
) AS i(cat, name, description, price, image, dietary, featured, sort)
JOIN menu_categories c ON c.name = i.cat
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);

-- ============================ OFFERS ============================
INSERT INTO offers (title, description, category, discount_pct, code, image, active)
SELECT * FROM (VALUES
  ('Himalayan Honeymoon', 'Three nights in a Glacier Panorama Suite with champagne, a private candlelit dinner, and a sunrise excursion.', 'romance', 20, 'HONEYMOON20', '/images/rooms/glacier-suite-1.png', TRUE),
  ('Trekker''s Basecamp', 'Rest and refuel before the Annapurna Circuit — includes hearty breakfasts and a packed trail lunch.', 'adventure', 15, 'TREK15', '/images/experiences.png', TRUE),
  ('Long-Stay Serenity', 'Stay seven nights or more and enjoy a complimentary night plus daily spa access.', 'seasonal', 25, 'STAY7', '/images/gallery/spa.png', TRUE),
  ('Family Orchard Getaway', 'A Heritage Family Loft with a guided Marpha orchard tour and apple-pressing for the little ones.', 'family', 18, 'FAMILY18', '/images/rooms/heritage-family-1.png', TRUE)
) AS v(title, description, category, discount_pct, code, image, active)
WHERE NOT EXISTS (SELECT 1 FROM offers LIMIT 1);

-- ============================ EXPERIENCES ============================
INSERT INTO experiences (title, description, image, duration, difficulty, price, sort)
SELECT * FROM (VALUES
  ('Dhaulagiri Sunrise Summit Walk', 'A guided pre-dawn walk to a private viewpoint for first light on the world''s seventh-highest peak.', '/images/experiences.png', '3 hours', 'Moderate', 45, 1),
  ('Thakali Culinary Journey', 'Cook alongside our chef and learn the secrets of an authentic Thakali kitchen, then feast on your creations.', '/images/dish-thakali.png', '4 hours', 'Easy', 60, 2),
  ('Marpha Orchard & Distillery Tour', 'Wander the famed apple orchards of Marpha and taste the local brandy at a family distillery.', '/images/gallery/valley.png', 'Half day', 'Easy', 55, 3),
  ('Kali Gandaki Gorge Hike', 'Descend into the deepest gorge on earth with an expert naturalist guide.', '/images/hero-himalaya.png', 'Full day', 'Challenging', 90, 4),
  ('Heritage Village Walk', 'Explore Tukuche''s trading-era mansions and Buddhist heritage with a local historian.', '/images/gallery/exterior-dusk.png', '2 hours', 'Easy', 30, 5),
  ('Himalayan Spa Ritual', 'A restorative treatment using local herbs and hot stones, overlooking the peaks.', '/images/gallery/spa.png', '90 minutes', 'Easy', 70, 6)
) AS v(title, description, image, duration, difficulty, price, sort)
WHERE NOT EXISTS (SELECT 1 FROM experiences LIMIT 1);

-- ============================ ATTRACTIONS ============================
INSERT INTO attractions (title, description, image, distance, sort)
SELECT * FROM (VALUES
  ('Marpha Village', 'The whitewashed apple capital of Mustang, famed for orchards and brandy.', '/images/gallery/valley.png', '8 km', 1),
  ('Dhaulagiri Icefall Viewpoint', 'A dramatic vantage of the Dhaulagiri icefall and glacier.', '/images/hero-himalaya.png', '12 km', 2),
  ('Kali Gandaki Gorge', 'The deepest river gorge on earth, carving between two 8,000m giants.', '/images/gallery/terrace.png', '2 km', 3)
) AS v(title, description, image, distance, sort)
WHERE NOT EXISTS (SELECT 1 FROM attractions LIMIT 1);

-- ============================ GALLERY ============================
INSERT INTO gallery (url, caption, category, sort)
SELECT * FROM (VALUES
  ('/images/gallery/exterior-dusk.png', 'The hotel at dusk beneath the peaks', 'Exterior', 1),
  ('/images/gallery/lounge.png', 'The glass lounge and fireplace', 'Interior', 2),
  ('/images/gallery/dining.png', 'Alpine dining room', 'Dining', 3),
  ('/images/gallery/spa.png', 'The Himalayan spa', 'Spa', 4),
  ('/images/gallery/terrace.png', 'Sunset terrace', 'Exterior', 5),
  ('/images/gallery/valley.png', 'The Kali Gandaki valley', 'Landscape', 6),
  ('/images/gallery-1.png', 'Golden hour over the massif', 'Landscape', 7)
) AS v(url, caption, category, sort)
WHERE NOT EXISTS (SELECT 1 FROM gallery LIMIT 1);

-- ============================ FAQS ============================
INSERT INTO faqs (question, answer, sort)
SELECT * FROM (VALUES
  ('What are the check-in and check-out times?', 'Check-in is from 2:00 PM and check-out is by 11:00 AM. Early check-in and late check-out can be arranged on request.', 1),
  ('How do I get to Hotel Tukuche Peak?', 'Tukuche is reachable by road from Pokhara (approx. 7 hours) or by a short flight to Jomsom followed by a 40-minute drive. We can arrange private transfers.', 2),
  ('Is Wi-Fi available?', 'Yes, complimentary Wi-Fi is available throughout the hotel.', 3),
  ('Do you accommodate dietary requirements?', 'Absolutely. Our kitchen offers vegetarian, vegan, and gluten-free options — just let us know in your booking notes.', 4),
  ('What is your cancellation policy?', 'Reservations can be cancelled free of charge up to 72 hours before check-in.', 5),
  ('Is the hotel suitable for children?', 'Yes. The Heritage Family Loft is designed for families, and we can arrange child-friendly meals and activities.', 6)
) AS v(question, answer, sort)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);

-- ============================ REVIEWS ============================
INSERT INTO reviews (room_id, guest_name, rating, title, body, status, reply)
SELECT r.id, v.guest_name, v.rating, v.title, v.body, v.status, v.reply
FROM (VALUES
  ('glacier-panorama-suite', 'Amelia R.', 5, 'The view is unreal', 'Waking up to the Dhaulagiri massif from bed is something I''ll never forget. The soaking tub by the window sealed it. Faultless service.', 'approved', 'Thank you, Amelia — we are so glad the Glacier Suite lived up to the dream. Come back for the autumn skies!'),
  ('summit-deluxe-king', 'David & Priya', 5, 'Warm, refined, unforgettable', 'Heated floors after a long trek felt like heaven. The staff remembered our names and our tea preferences.', 'approved', NULL),
  ('alpine-twin', 'Sofia M.', 4, 'Perfect for trekkers', 'Cozy, spotless, and the breakfast fuelled our whole day on the trail. Would happily return.', 'approved', NULL),
  ('heritage-family-loft', 'The Karki Family', 5, 'The kids loved the loft', 'The mezzanine was a hit with our two children and the orchard tour was the highlight of the trip.', 'approved', 'What a joy to host your family — the orchard misses you already!'),
  ('glacier-panorama-suite', 'Henrik L.', 5, 'Quiet luxury done right', 'Every detail considered. The brushed brass, the linen, the silence. A rare place.', 'approved', NULL),
  ('summit-deluxe-king', 'Yuki T.', 4, 'Beautiful stay', 'Loved the picture window and the dal bhat at dinner. Only wish we''d stayed longer.', 'approved', NULL)
) AS v(slug, guest_name, rating, title, body, status, reply)
JOIN rooms r ON r.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM reviews LIMIT 1);

-- ============================ CMS CONTENT ============================
INSERT INTO cms_content (key, value)
SELECT * FROM (VALUES
  ('hero', '{"eyebrow":"Tukuche · Mustang · Nepal","title":"Luxury in the heart of the Himalayas","subtitle":"A boutique retreat where glass-walled suites open onto the Dhaulagiri massif, and every stay is measured in sunrises."}'::jsonb),
  ('about', '{"title":"Where the mountains meet quiet luxury","body":"Perched in the historic trading village of Tukuche, our hotel blends refined boutique hospitality with authentic Himalayan warmth."}'::jsonb),
  ('settings', '{"name":"Hotel Tukuche Peak","email":"hotelsonam@gmail.com","phone":"+977 985-1019065","whatsapp":"+977 985-1019065","address":"Tukuche, Mustang, Nepal","checkIn":"2:00 PM","checkOut":"11:00 AM","taxRate":13}'::jsonb)
) AS v(key, value)
WHERE NOT EXISTS (SELECT 1 FROM cms_content LIMIT 1);

-- ============================ BOOTSTRAP SUPER ADMIN ============================
-- Default credentials (CHANGE THE PASSWORD after first login):
--   email:    admin@hoteltukuchepeak.com
--   password: ChangeMe!2025
INSERT INTO users (name, email, email_norm, password_hash, email_verified, role, loyalty_tier)
SELECT 'Hotel Administrator', 'admin@hoteltukuchepeak.com', 'admin@hoteltukuchepeak.com',
       crypt('ChangeMe!2025', gen_salt('bf', 10)), TRUE, 'SUPER_ADMIN', 'Platinum'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'SUPER_ADMIN');
