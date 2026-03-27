// backend/src/database/seeds/products.seed.ts
import { DataSource } from 'typeorm';
import { Product } from '../../modules/products/entities/product.entity';

const INITIAL_PRODUCTS = [
  { name: 'Nata', category: 'Toppings', price: 90, stock: 50, image: '🫧' },
  { name: 'Pearl', category: 'Toppings', price: 90, stock: 50, image: '⚫' },
  { name: 'Graham', category: 'Dry Goods', price: 55, stock: 80, image: '🍪' },
  { name: 'Mango', category: 'Fruits', price: 120, stock: 90, image: '🥭' },
  { name: 'Milk', category: 'Dairy', price: 80, stock: 60, image: '🥛' },
  { name: 'Cups', category: 'Packaging', price: 3, stock: 500, image: '🥤' },
  { name: 'Lids', category: 'Packaging', price: 2, stock: 500, image: '🔵' },
  {
    name: 'Double Plastic',
    category: 'Packaging',
    price: 2,
    stock: 200,
    image: '🛍️',
  },
  {
    name: 'Single Straw',
    category: 'Packaging',
    price: 1,
    stock: 500,
    image: '🥤',
  },
  { name: 'Oreo', category: 'Toppings', price: 65, stock: 45, image: '🍫' },
];

function computeStatus(
  stock: number,
): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
}

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Product);

  for (const p of INITIAL_PRODUCTS) {
    const exists = await repo.findOne({ where: { name: p.name } });
    if (!exists) {
      await repo.save(
        repo.create({
          ...p,
          status: computeStatus(p.stock),
          sales: 0,
          isActive: true,
        }),
      );
      console.log(`✅ Seeded product: ${p.name}`);
    }
  }
}
