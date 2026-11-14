const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Duck Cosmetics database...');

  // 1. Admin User
  const passwordHash = await bcrypt.hash('DuckAdmin2026!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@duckcosmetics.com' },
    update: {
      passwordHash,
      role: 'ADMIN',
      name: 'Duck Executive Admin',
    },
    create: {
      email: 'admin@duckcosmetics.com',
      passwordHash,
      role: 'ADMIN',
      name: 'Duck Executive Admin',
    },
  });
  console.log('✓ Admin user verified:', admin.email);

  // 2. Site Settings
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      heroHeadline: 'REDEFINE YOUR GLOW',
      heroSubheadline: 'Unveiling premium, playful & sophisticated beauty.',
      heroImageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
      announcementBarText: 'Free Shipping Over $50 | 100% Cruelty-Free',
    },
    create: {
      id: 'default',
      heroHeadline: 'REDEFINE YOUR GLOW',
      heroSubheadline: 'Unveiling premium, playful & sophisticated beauty.',
      heroImageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
      announcementBarText: 'Free Shipping Over $50 | 100% Cruelty-Free',
    },
  });
  console.log('✓ Site settings seeded');

  // 3. Categories
  const skincare = await prisma.category.upsert({
    where: { slug: 'skincare' },
    update: { name: 'Skincare' },
    create: { name: 'Skincare', slug: 'skincare' },
  });

  const cosmetics = await prisma.category.upsert({
    where: { slug: 'cosmetics' },
    update: { name: 'Cosmetics' },
    create: { name: 'Cosmetics', slug: 'cosmetics' },
  });

  const serums = await prisma.category.upsert({
    where: { slug: 'serums-oils' },
    update: { name: 'Serums & Oils', parentCategoryId: skincare.id },
    create: { name: 'Serums & Oils', slug: 'serums-oils', parentCategoryId: skincare.id },
  });

  const cleansers = await prisma.category.upsert({
    where: { slug: 'cleansers' },
    update: { name: 'Cleansers', parentCategoryId: skincare.id },
    create: { name: 'Cleansers', slug: 'cleansers', parentCategoryId: skincare.id },
  });

  const lips = await prisma.category.upsert({
    where: { slug: 'lip-cheek' },
    update: { name: 'Lip & Cheek', parentCategoryId: cosmetics.id },
    create: { name: 'Lip & Cheek', slug: 'lip-cheek', parentCategoryId: cosmetics.id },
  });

  const glow = await prisma.category.upsert({
    where: { slug: 'sun-glow' },
    update: { name: 'Sun & Glow', parentCategoryId: cosmetics.id },
    create: { name: 'Sun & Glow', slug: 'sun-glow', parentCategoryId: cosmetics.id },
  });

  console.log('✓ Categories seeded');

  // 4. Products
  const seedProducts = [
    {
      title: 'Luminous Dew Veil Serum',
      description: 'Silky peptide-infused elixir for glass-like radiance, cellular renewal, and all-day hydration.',
      price: 48.00,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900&auto=format&fit=crop',
      categoryId: serums.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Silk Velvet Cushion Tint',
      description: 'Weightless buildable color wash with hyaluronic spheres for soft-focus editorial perfection.',
      price: 36.00,
      imageUrl: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?q=80&w=900&auto=format&fit=crop',
      categoryId: lips.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Botanical Cloud Melting Cleanser',
      description: 'Nourishing balm-to-milk cleanser that lifts impurities while protecting skin barrier integrity.',
      price: 34.00,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=900&auto=format&fit=crop',
      categoryId: cleansers.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Aura Golden Nectar Oil',
      description: 'Hand-blended botanical luxury oil with cold-pressed marula, squalane, and golden sea buckthorn.',
      price: 52.00,
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-0524ef78c660?q=80&w=900&auto=format&fit=crop',
      categoryId: serums.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Rose Petal Glaze Balm',
      description: 'Conditioning high-shine glossy tint infused with organic shea butter and antioxidant berry extract.',
      price: 28.00,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=900&auto=format&fit=crop',
      categoryId: lips.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Ethereal Pearl Radiance Primer',
      description: 'Micro-fine light reflecting fluid that preps skin and creates a seamless lit-from-within glow.',
      price: 42.00,
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=900&auto=format&fit=crop',
      categoryId: glow.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Whipped Cashmere Moisture Soufflé',
      description: 'Ultra-plush yet weightless ceramides cream that restores elasticity and seals moisture overnight.',
      price: 46.00,
      imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=900&auto=format&fit=crop',
      categoryId: skincare.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
    {
      title: 'Solar Shield Mineral Glow Drops SPF 40',
      description: 'Invisible broad-spectrum defense infused with clarifying niacinamide and antioxidant vitamin E.',
      price: 38.00,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop',
      categoryId: glow.id,
      status: 'COMING_SOON',
      isFeatured: true,
    },
  ];

  for (const p of seedProducts) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }
  console.log(`✓ Seeded ${seedProducts.length} high-fashion products`);

  // 5. Initial sample waitlist members
  const waitlistSeeds = [
    { email: 'charlotte.v@voguemag.com', source: 'Hero CTA' },
    { email: 'elena.stylist@paris.fr', source: 'Product Modal: Luminous Dew Veil Serum' },
    { email: 'harper.beauty@harpersbazaar.com', source: 'Hero CTA' },
  ];

  for (const w of waitlistSeeds) {
    await prisma.waitlist.upsert({
      where: { email: w.email },
      update: {},
      create: w,
    });
  }
  console.log('✓ Seeded waitlist members');

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
