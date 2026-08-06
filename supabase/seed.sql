-- SubStore seed data
-- schema.sql chalane ke BAAD ye run karein (SQL Editor mein paste karke).
-- Dobara chalane pe duplicate na ho isliye pehle purana data hataya jaata hai.

truncate table public.products restart identity;
truncate table public.daily_offers restart identity;

-- ── products (21) ────────────────────────────────────────────
insert into public.products
  (title, subtitle, description, category, price, duration, tag, tag_color,
   color, icon, image_url, variants, sort_order)
values
  ('Prime Video', '6 Months Access', 'Unlimited movies, TV shows & Amazon Originals. Stream anytime, anywhere.', 'Streaming', 250, '6 Months', 'Best Value', '#10b981', '#00a8e0', 'Tv', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 1),
  ('SonyLIV', '3 Months Access', 'Premium sports, movies, web series & live TV — all in one place.', 'Streaming', 250, '3 Months', 'Hot', '#e50914', '#e50914', 'Tv', '/assets/business_course_professional_dark.jpg', '[]'::jsonb, 2),
  ('YouTube Premium', 'Multiple Plans', 'Ad-free YouTube, background play, YouTube Music, and offline downloads.', 'Streaming', 50, '1 Month', 'From Rs.50', '#ff0000', '#ff0000', 'Play', '/assets/coding_course_laptop_dark.jpg', '[{"label": "1 Month", "price": 50}, {"label": "3 Months", "price": 230}, {"label": "6 Months", "price": 450}]'::jsonb, 3),
  ('Spotify', '3 Months Premium', 'Listen to any song, podcast, or audiobook. No ads. Download for offline.', 'Music', 250, '3 Months', 'Popular', '#1db954', '#1db954', 'Music', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 4),
  ('Jio Hotstar', '3 Months Access', 'Live cricket, blockbuster movies, Disney content & top TV shows.', 'Streaming', 250, '3 Months', 'Trending', '#1f80e0', '#1f80e0', 'Tv', '/assets/design_course_creative_dark.jpg', '[]'::jsonb, 5),
  ('Netflix', '1 Month Premium 4K UHD', 'Stream Netflix originals, movies & series in stunning 4K Ultra HD on 4 screens.', 'Streaming', 299, '1 Month', '4K UHD', '#e50914', '#e50914', 'Tv', '/assets/business_course_professional_dark.jpg', '[{"label": "1 Month Basic", "price": 250}, {"label": "1 Month 4K UHD", "price": 299}]'::jsonb, 6),
  ('Coursera Plus', '1 Year Full Access', 'Unlimited access to 7,000+ world-class courses, professional certificates & degrees.', 'Learning', 999, '1 Year', 'Bestseller', '#0056d2', '#0056d2', 'BookOpen', '/assets/coding_course_laptop_dark.jpg', '[]'::jsonb, 7),
  ('NordVPN', 'On your mail · 3 Months', 'Military-grade encryption, no-logs policy, 5,000+ servers in 60 countries.', 'VPN & Security', 499, '3 Months', 'Secure', '#4687ff', '#4687ff', 'Shield', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 8),
  ('Amazon Prime', '6 Months Access', 'Free delivery, Prime Video, Prime Music, exclusive deals & more.', 'Streaming', 200, '6 Months', 'Best Value', '#ff9900', '#ff9900', 'ShoppingBag', '/assets/business_course_professional_dark.jpg', '[]'::jsonb, 9),
  ('LinkedIn Premium Career', '3 Months Plan', 'InMail credits, who viewed your profile, LinkedIn Learning & career insights.', 'Productivity', 777, '3 Months', 'Career Boost', '#0077b5', '#0077b5', 'Briefcase', '/assets/design_course_creative_dark.jpg', '[]'::jsonb, 10),
  ('ChatGPT Plus', '1 Month Subscription', 'GPT-4o access, faster responses, image generation & advanced data analysis.', 'AI Tools', 999, '1 Month', 'AI Power', '#10b981', '#10b981', 'Brain', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 11),
  ('GitHub Student Pack', '2 Years Access', 'Free access to 100+ developer tools — GitHub Pro, Copilot, domains & cloud credits.', 'Developer Tools', 2200, '2 Years', 'Dev Essential', '#6e7681', '#6e7681', 'Code2', '/assets/coding_course_laptop_dark.jpg', '[]'::jsonb, 12),
  ('Autodesk All Apps', '1 Year License', 'AutoCAD, Revit, 3ds Max, Maya & 100+ Autodesk apps for design & engineering.', 'Design', 999, '1 Year', 'Pro Suite', '#ec4899', '#ec4899', 'Palette', '/assets/design_course_creative_dark.jpg', '[]'::jsonb, 13),
  ('Microsoft 365', 'Lifetime / 1 Year Family', 'Word, Excel, PowerPoint, Teams, OneDrive & more — for work and home.', 'Productivity', 499, 'Lifetime', 'Lifetime Deal', '#0078d4', '#0078d4', 'Briefcase', '/assets/business_course_professional_dark.jpg', '[{"label": "Lifetime 100GB", "price": 499}, {"label": "1 Year Family 1TB", "price": 499}]'::jsonb, 14),
  ('edX Full Access', '1 Year Subscription', 'Unlimited verified certificates from MIT, Harvard, Stanford & 160+ top universities.', 'Learning', 999, '1 Year', 'Top Rated', '#06b6d4', '#06b6d4', 'BookOpen', '/assets/coding_course_laptop_dark.jpg', '[]'::jsonb, 15),
  ('Canva Pro', '1 Year Subscription', 'Unlimited premium templates, brand kit, background remover & 100M+ assets.', 'Design', 150, '1 Year', 'Lowest Price', '#7d2ae8', '#7d2ae8', 'Palette', '/assets/design_course_creative_dark.jpg', '[]'::jsonb, 16),
  ('ExpressVPN', '1 Month Account', 'Ultra-fast servers in 105 countries, TrustedServer tech & 24/7 live support.', 'VPN & Security', 299, '1 Month', 'Fastest', '#DA3940', '#DA3940', 'Shield', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 17),
  ('Proton VPN', 'Direct account · 1 Year', 'Swiss privacy, Secure Core routing & a strict no-logs policy. Direct account access.', 'VPN & Security', 1299, '1 Year', 'Direct Account', '#6D4AFF', '#6D4AFF', 'Shield', '/assets/coding_course_laptop_dark.jpg', '[]'::jsonb, 18),
  ('IPVanish', 'Single device · 1 Year', 'Owned-and-operated servers in 75+ locations with unlimited bandwidth.', 'VPN & Security', 599, '1 Year', 'Single Device', '#70BB43', '#70BB43', 'Shield', '/assets/business_course_professional_dark.jpg', '[]'::jsonb, 19),
  ('Private Internet Access', '12 Months Subscription', 'PIA VPN with open-source apps, MACE ad blocker & unlimited device connections.', 'VPN & Security', 1199, '12 Months', 'Unlimited Devices', '#2E9E4E', '#2E9E4E', 'Shield', '/assets/design_course_creative_dark.jpg', '[]'::jsonb, 20),
  ('HMA Pro VPN', '1 Month Account', 'HideMyAss servers across 210+ countries with lightning-fast connection speeds.', 'VPN & Security', 299, '1 Month', 'Global Reach', '#F5A623', '#F5A623', 'Shield', '/assets/abstract_purple_blue_gradient_dark.jpg', '[]'::jsonb, 21);

-- ── daily offers (4) ───────────────────────────────────────
-- expires_at yahan set nahi kiya — admin panel se date pick karein.
insert into public.daily_offers
  (emoji, title, subtitle, description, original_price, deal_price,
   tag, tag_color, slots_total, slots_left)
values
  ('🔥', 'Today', 'Netflix 4K + Amazon Prime Bundle', 'Get both streaming giants together at a special combined price. Valid today only.', 549, 399, 'BUNDLE', '#e50914', 5, 2),
  ('⚡', 'Lightning Deal', 'YouTube Premium 3 Months', 'Ad-free YouTube for 3 months at a price lower than a single month officially.', 319, 230, 'HOT', '#ff0000', 10, 7),
  ('🎓', 'Student Special', 'Coursera Plus + edX Bundle', 'Two of the best learning platforms together — certificates from MIT, Harvard, Stanford and more.', 1878, 1499, 'LEARNING', '#0056d2', 8, 3),
  ('🎨', 'Creator Bundle', 'Canva Pro + Autodesk All Apps', 'Everything a design or engineering student needs — all in one deal.', 1149, 899, 'DESIGN', '#7d2ae8', 6, 4);

-- proofs aur leads khaali rehte hain — dono admin panel se bharte hain.
