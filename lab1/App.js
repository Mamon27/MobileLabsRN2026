import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';

const PRODUCTS = [
  { id: '1', name: 'Ноутбук MacBook', price: 45000 },
  { id: '2', name: 'Телефон iPhone', price: 35000 },
  { id: '3', name: 'Навушники AirPods', price: 5500 },
  { id: '4', name: 'Смарт годинник', price: 8000 },
  { id: '5', name: 'Планшет iPad', price: 18000 },
  { id: '6', name: 'Камера GoPro', price: 12000 },
];

export default function App() {
  const [screen, setScreen] = useState('home'); // home, products, cart, profile
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('Володимир');
  const [email, setEmail] = useState('zipz221_yavv@student.ztu.edu.ua');


  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() }]);
    Alert.alert('Успіх!', `Товар "${product.name}" додано до кошика`);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  if (screen === 'home') return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🏪 Вітаємо!</Text>
      <Text style={styles.subtitle}>Ласкаво просимо до магазину</Text>
      
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Акція дня!</Text>
        <Text style={styles.bannerSubtext}>Знижка 20% на ноутбуки</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => setScreen('products')}>
        <Text style={styles.btnText}>Переглянути товари</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.btnOutline} onPress={() => setScreen('profile')}>
        <Text style={styles.btnOutlineText}>Мій профіль</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text>🚚 Безкоштовна доставка</Text>
        <Text>✅ Гарантія якості</Text>
        <Text>💬 Підтримка 24/7</Text>
      </View>
    </SafeAreaView>
  );

  if (screen === 'products') return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
        <Text>← Назад</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Каталог</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardPrice}>{item.price} грн</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
              <Text style={styles.addBtnText}>У кошик</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );

  if (screen === 'cart') return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => setScreen('products')} style={styles.backBtn}>
        <Text>← Назад до товарів</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🛒 Кошик</Text>
      
      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Кошик порожній</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.cartId.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text>{item.name}</Text>
                <View style={styles.cartItemRight}>
                  <Text style={styles.cartPrice}>{item.price} грн</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.cartId)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.total}>
            <Text style={styles.totalText}>Разом: {totalPrice} грн</Text>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>Оформити</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );


  if (screen === 'profile') return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
        <Text>← Назад</Text>
      </TouchableOpacity>
      <Text style={styles.title}>👤 Профіль</Text>
      
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👨</Text>
      </View>

      <Text style={styles.label}>Ім'я</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Збережено!')}>
        <Text style={styles.btnText}>Зберегти</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  
  banner: { backgroundColor: '#FF3B30', padding: 20, borderRadius: 10, marginBottom: 20 },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerSubtext: { color: '#fff', marginTop: 5 },
  
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  btnOutline: { borderWidth: 1, borderColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  btnOutlineText: { color: '#007AFF', fontSize: 16 },
  
  features: { marginTop: 20 },
  features: { fontSize: 16, marginBottom: 10 },
  
  backBtn: { marginBottom: 10 },
  
  card: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  cardPrice: { fontSize: 16, color: '#007AFF', marginRight: 10 },
  addBtn: { backgroundColor: '#34C759', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666' },
  
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 10 },
  cartItemRight: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { backgroundColor: '#FF3B30', width: 25, height: 25, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  deleteBtnText: { color: '#fff', fontWeight: 'bold' },
  
  total: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15, marginTop: 10 },
  totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  checkoutBtn: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  avatar: { alignItems: 'center', marginBottom: 20 },
  avatarText: { fontSize: 80 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
});