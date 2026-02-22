import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useProducts, Order } from '@/context/ProductContext';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { orders } = useProducts();

  const userOrders = orders
    .filter(o => o.customerName === user?.username)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout },
    ]);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <Text style={styles.sectionTitle}>My Orders ({userOrders.length})</Text>

      <FlatList
        data={userOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  username: { fontSize: 14, color: '#666', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 0 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '700', color: '#222' },
  orderStatus: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPending: { backgroundColor: '#fff3cd', color: '#856404' },
  statusCompleted: { backgroundColor: '#d4edda', color: '#155724' },
  statusCancelled: { backgroundColor: '#f8d7da', color: '#721c24' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 4 },
  orderItems: { fontSize: 13, color: '#666', marginTop: 6 },
  orderTotal: { fontSize: 16, fontWeight: '700', color: '#6F4E37', marginTop: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  logoutBtn: { margin: 16, marginTop: 8, backgroundColor: '#ff4444', padding: 16, borderRadius: 10, alignItems: 'center' },
  logoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
