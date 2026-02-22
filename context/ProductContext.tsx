import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  sizes: ProductSize[];
  available: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  customerName: string;
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (product: Product, size: ProductSize) => void;
  removeFromCart: (productId: string, sizePrice: number) => void;
  updateQuantity: (productId: string, sizePrice: number, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
};

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Iced Milk Coffee',
    description: 'Best seller creamy iced coffee',
    category: 'coffee',
    image: 'iced-milk-coffee',
    available: true,
    sizes: [
      { name: '12oz', price: 90 },
      { name: '16oz', price: 110 },
      { name: '22oz', price: 130 },
    ],
  },
  {
    id: '2',
    name: 'Iced Salted Cream Coffee',
    description: 'Sweet and salty cream coffee',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 120 },
      { name: '22oz', price: 140 },
    ],
  },
  {
    id: '3',
    name: 'Iced Egg Cream Coffee',
    description: 'Classic egg cream soda',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 120 },
    ],
  },
  {
    id: '4',
    name: 'Hot Milk Coffee',
    description: 'Warm creamy milk coffee',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 115 },
    ],
  },
  {
    id: '5',
    name: 'Hot Salted Cream Coffee',
    description: 'Warm salty cream coffee',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 115 },
    ],
  },
  {
    id: '6',
    name: 'Hot Egg Cream Coffee',
    description: 'Warm classic egg cream',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 115 },
    ],
  },
  {
    id: '7',
    name: 'Iced Americano',
    description: 'Espresso with ice',
    category: 'coffee',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 135 },
    ],
  },
  {
    id: '8',
    name: 'Matcha Latte',
    description: 'Japanese green tea latte',
    category: 'tea',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 80 },
    ],
  },
  {
    id: '9',
    name: 'Salted Cream Matcha Latte',
    description: 'Matcha with salted cream',
    category: 'tea',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 90 },
    ],
  },
  {
    id: '10',
    name: 'Dirty Matcha',
    description: 'Matcha with espresso',
    category: 'tea',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 130 },
    ],
  },
  {
    id: '11',
    name: 'Tropical Fruit Tea',
    description: 'Fresh fruit infused tea',
    category: 'tea',
    image: '',
    available: true,
    sizes: [
      { name: '16oz', price: 100 },
    ],
  },
  {
    id: '12',
    name: 'Bánh Mì',
    description: 'Vietnamese sandwich',
    category: 'meal',
    image: '',
    available: true,
    sizes: [
      { name: '1 sandwich', price: 125 },
    ],
  },
  {
    id: '13',
    name: 'Chicken and Crab Soup',
    description: 'Savory soup with chicken and crab',
    category: 'meal',
    image: '',
    available: true,
    sizes: [
      { name: '1 bowl', price: 125 },
    ],
  },
  {
    id: '14',
    name: 'Chicken Vermicelli Bowl',
    description: 'Rice vermicelli with chicken',
    category: 'meal',
    image: '',
    available: true,
    sizes: [
      { name: '1 bowl', price: 125 },
    ],
  },
  {
    id: '15',
    name: 'Chicken Adobo',
    description: 'Filipino style chicken adobo',
    category: 'meal',
    image: '',
    available: true,
    sizes: [
      { name: '1 bowl', price: 125 },
    ],
  },
  {
    id: '16',
    name: 'Fresh Spring Rolls',
    description: 'Fresh vegetable spring rolls',
    category: 'meal',
    image: '',
    available: true,
    sizes: [
      { name: '3 rolls', price: 125 },
    ],
  },
  {
    id: '17',
    name: 'Tiramisu',
    description: 'Italian coffee dessert',
    category: 'dessert',
    image: '',
    available: true,
    sizes: [
      { name: '1 slice', price: 125 },
    ],
  },
  {
    id: '18',
    name: 'Panna Cotta',
    description: 'Italian cream dessert',
    category: 'dessert',
    image: '',
    available: true,
    sizes: [
      { name: '1 cup', price: 125 },
    ],
  },
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const migrateProducts = (products: Product[]): Product[] => {
    return products.map(p => {
      if (!p.sizes || p.sizes.length === 0) {
        return {
          ...p,
          sizes: [{ name: 'Regular', price: p.price || 0 }],
        };
      }
      return p;
    });
  };

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
      ]);

      if (productsData) {
        const parsed = JSON.parse(productsData);
        const migrated = migrateProducts(parsed);
        setProducts(migrated);
        if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
          await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(migrated));
        }
      } else {
        setProducts(defaultProducts);
        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      }

      if (ordersData) {
        setOrders(JSON.parse(ordersData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts(defaultProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    await saveProducts([...products, newProduct]);
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const newProducts = products.map(p => p.id === id ? { ...p, ...updated } : p);
    await saveProducts(newProducts);
  };

  const deleteProduct = async (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    await saveProducts(newProducts);
  };

  const addToCart = (product: Product, size: ProductSize) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize.price === size.price
      );
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { product, selectedSize: size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, sizePrice: number) => {
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.selectedSize.price === sizePrice)
    ));
  };

  const updateQuantity = (productId: string, sizePrice: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizePrice);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedSize.price === sizePrice
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (customerName: string) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.selectedSize.price * item.quantity, 0),
      status: 'pending',
      date: new Date().toISOString(),
      customerName,
    };
    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    clearCart();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const newOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(newOrders);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        cart,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
}
