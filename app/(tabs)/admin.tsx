import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useProducts, Product, Order, ProductSize } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminScreen() {
  const { products, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useProducts();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Coffee',
    size1Name: '',
    size1Price: '',
    size2Name: '',
    size2Price: '',
    size3Name: '',
    size3Price: '',
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Coffee',
      size1Name: '16oz',
      size1Price: '',
      size2Name: '20oz',
      size2Price: '',
      size3Name: '',
      size3Price: '',
    });
    setProductModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const sizes = product.sizes;
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      size1Name: sizes[0]?.name || '',
      size1Price: sizes[0]?.price.toString() || '',
      size2Name: sizes[1]?.name || '',
      size2Price: sizes[1]?.price.toString() || '',
      size3Name: sizes[2]?.name || '',
      size3Price: sizes[2]?.price.toString() || '',
    });
    setProductModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.size1Name || !formData.size1Price) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    const sizes: ProductSize[] = [
      { name: formData.size1Name, price: parseFloat(formData.size1Price) || 0 },
    ];
    if (formData.size2Name && formData.size2Price) {
      sizes.push({ name: formData.size2Name, price: parseFloat(formData.size2Price) });
    }
    if (formData.size3Name && formData.size3Price) {
      sizes.push({ name: formData.size3Name, price: parseFloat(formData.size3Price) });
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        sizes,
      });
    } else {
      await addProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        sizes,
        available: true,
      });
    }
    setProductModalVisible(false);
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(product.id) },
      ]
    );
  };

  const handleOrderAction = (order: Order, action: 'completed' | 'cancelled') => {
    Alert.alert(
      `${action === 'completed' ? 'Complete' : 'Cancel'} Order`,
      `Mark this order as ${action}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateOrderStatus(order.id, action) },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout },
    ]);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.sizesRow}>
          {item.sizes.map((s, i) => (
            <Text key={i} style={styles.sizeTag}>{s.name} ₱{s.price}</Text>
          ))}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{item.id.slice(-6)}</Text>
          <Text style={[
            styles.orderStatus,
            item.status === 'pending' && styles.statusPending,
            item.status === 'completed' && styles.statusCompleted,
            item.status === 'cancelled' && styles.statusCancelled,
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.orderDate}>{new Date(item.date).toLocaleString()}</Text>
        <Text style={styles.orderItems}>
          {item.items.map(i => `${i.quantity}x ${i.product.name} (${i.selectedSize.name})`).join(', ')}
        </Text>
        <Text style={styles.orderTotal}>Total: ₱{item.total}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.completeBtn} onPress={() => handleOrderAction(item, 'completed')}>
            <Text style={styles.completeBtnText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleOrderAction(item, 'cancelled')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            Products ({products.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Orders ({pendingOrders} pending)
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' && (
        <>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ Add Product</Text>
          </TouchableOpacity>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={renderProduct}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {activeTab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={productModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>

            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={t => setFormData({ ...formData, name: t })}
              placeholder="Product name"
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={t => setFormData({ ...formData, description: t })}
              placeholder="Description"
              multiline
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={t => setFormData({ ...formData, category: t })}
              placeholder="Coffee"
            />

            <Text style={styles.sectionTitle}>Sizes & Prices</Text>
            
            <Text style={styles.inputLabel}>Size 1 (required) *</Text>
            <View style={styles.sizeRow}>
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size1Name}
                onChangeText={t => setFormData({ ...formData, size1Name: t })}
                placeholder="e.g. 16oz"
              />
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size1Price}
                onChangeText={t => setFormData({ ...formData, size1Price: t })}
                placeholder="Price"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.inputLabel}>Size 2 (optional)</Text>
            <View style={styles.sizeRow}>
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size2Name}
                onChangeText={t => setFormData({ ...formData, size2Name: t })}
                placeholder="e.g. 20oz"
              />
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size2Price}
                onChangeText={t => setFormData({ ...formData, size2Price: t })}
                placeholder="Price"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.inputLabel}>Size 3 (optional)</Text>
            <View style={styles.sizeRow}>
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size3Name}
                onChangeText={t => setFormData({ ...formData, size3Name: t })}
                placeholder="e.g. 24oz"
              />
              <TextInput
                style={[styles.input, styles.sizeInput]}
                value={formData.size3Price}
                onChangeText={t => setFormData({ ...formData, size3Price: t })}
                placeholder="Price"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn2} onPress={() => setProductModalVisible(false)}>
                <Text style={styles.cancelBtn2Text}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 50, backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6F4E37' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#6F4E37' },
  addBtn: { margin: 16, marginBottom: 8, backgroundColor: '#6F4E37', padding: 14, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  list: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  cardCategory: { fontSize: 12, color: '#6F4E37', marginTop: 2 },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 4 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  sizeTag: { fontSize: 12, backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { backgroundColor: '#3498db', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ff4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  deleteBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '700', color: '#222' },
  orderStatus: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPending: { backgroundColor: '#fff3cd', color: '#856404' },
  statusCompleted: { backgroundColor: '#d4edda', color: '#155724' },
  statusCancelled: { backgroundColor: '#f8d7da', color: '#721c24' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 4 },
  orderItems: { fontSize: 13, color: '#666', marginTop: 6 },
  orderTotal: { fontSize: 16, fontWeight: '700', color: '#6F4E37', marginTop: 8 },
  completeBtn: { backgroundColor: '#28a745', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  completeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#6c757d', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  cancelBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 4 },
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeInput: { flex: 1 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 20 },
  cancelBtn2: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtn2Text: { fontSize: 16, color: '#666' },
  saveBtn: { flex: 1, backgroundColor: '#6F4E37', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
