import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useProducts, Product, ProductSize } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const { products, addToCart } = useProducts();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product, size: ProductSize) => {
    addToCart(product, size);
    setSelectedProduct(null);
    router.push('/cart');
  };

  const getEmoji = (category: string) => {
    switch (category) {
      case 'Coffee': return '☕';
      case 'Pastries': return '🥐';
      case 'Food': return '🍔';
      default: return '🛒';
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => setSelectedProduct(item)}
    >
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>{getEmoji(item.category)}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.productPrice}>From ₱{item.sizes?.length ? Math.min(...item.sizes.map(s => s.price)) : item.price || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Caffeine Veins</Text>
          <Text style={styles.welcome}>Hello, {user?.username}!</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
          <View style={styles.cartBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>☕ Fresh Coffee, Fast Delivery!</Text>
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryEmoji}>{getEmoji(cat)}</Text>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {selectedProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.sizeModal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
            <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
            <Text style={styles.sizeLabel}>Select Size</Text>
            <View style={styles.sizeOptions}>
              {(selectedProduct.sizes || [{ name: 'Regular', price: selectedProduct.price || 0 }]).map((size, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sizeButton}
                  onPress={() => handleAddToCart(selectedProduct, size)}
                >
                  <Text style={styles.sizeName}>{size.name}</Text>
                  <Text style={styles.sizePrice}>₱{size.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  welcome: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
  },
  banner: {
    backgroundColor: '#6F4E37',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  bannerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  categories: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryChipActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 36,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  productDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6F4E37',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sizeModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sizeOptions: {
    gap: 10,
  },
  sizeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#6F4E37',
  },
  sizeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sizePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
});
