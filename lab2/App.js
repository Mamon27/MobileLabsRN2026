import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SectionList, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const COLORS = { primary: '#007AFF', background: '#fff', text: '#333', textSecondary: '#666', textTertiary: '#999', separator: '#eee', headerBg: '#f5f5f5' };
const SCREEN_OPTIONS = { headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' };

const generateNewsData = (count) => {
    const news = [];
    for (let i = 1; i <= count; i++) {
        news.push({
            id: String(i),
            title: `Новина #${i}`,
            description: `Детальний опис новини номер ${i}.`,
            date: '2024-01-' + String(i).padStart(2, '0'),
            category: i % 2 === 0 ? 'Спорт' : 'Технології',
        });
    }
    return news;
};

const CONTACTS_DATA = [
    {
        title: 'Викладачі',
        data: [
            { id: '1', name: 'Іванов Іван Іванович', position: 'Доцент кафедри ІПЗ', phone: '+380 123 456 789' },
            { id: '2', name: 'Петренко Петро Петрович', position: 'Професор', phone: '+380 234 567 890' },
        ],
    },
    {
        title: 'Студенти старости',
        data: [
            { id: '3', name: 'Сидоренко Сидір Сидорович', position: 'Староста групи ІПЗ-22', phone: '+380 345 678 901' },
            { id: '4', name: 'Коваленко Коваль Ковальович', position: 'Староста групи ВТ-22', phone: '+380 456 789 012' },
        ],
    },
];

function MainScreen({ navigation }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadNews = useCallback((pageNum = 1, refresh = false) => {
        setLoading(true);
        setTimeout(() => {
            const newNews = generateNewsData(pageNum * 5);
            if (refresh) { setNews(newNews); setPage(1); }
            else { setNews(prev => pageNum === 1 ? newNews : [...prev, ...newNews]); }
            setHasMore(pageNum < 5);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => { loadNews(1); }, [loadNews]);

    const onRefresh = () => { if (!loading) loadNews(1, true); };

    const onEndReached = () => { if (!loading && hasMore) { loadNews(page + 1); setPage(prev => prev + 1); } };

    const renderNewsItem = ({ item }) => (
        <TouchableOpacity style={styles.newsItem} onPress={() => navigation.navigate('Details', { news: item })}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsDescription} numberOfLines={2}>{item.description}</Text>
            <View style={styles.newsMeta}>
                <Text style={styles.newsCategory}>{item.category}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={news}
                renderItem={renderNewsItem}
                keyExtractor={item => item.id}
                refreshing={loading}
                onRefresh={onRefresh}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={<View style={styles.listHeader}><Text style={styles.listHeaderText}>📰 Список новин</Text></View>}
                ListFooterComponent={loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : null}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
        </SafeAreaView>
    );
}

function DetailsScreen({ route, navigation }) {
    const { news } = route.params;
    useEffect(() => { navigation.setOptions({ title: news.title, ...SCREEN_OPTIONS }); }, [navigation, news.title]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.detailsContent}>
                <Text style={styles.detailsTitle}>{news.title}</Text>
                <View style={styles.detailsMeta}>
                    <Text style={styles.detailsCategory}>{news.category}</Text>
                    <Text style={styles.detailsDate}>{news.date}</Text>
                </View>
                <Text style={styles.detailsDescription}>{news.description}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

function ContactsScreen() {
    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text></View>
    );

    const renderContactItem = ({ item }) => (
        <View style={styles.contactItem}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPosition}>{item.position}</Text>
            <Text style={styles.contactPhone}>📞 {item.phone}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <SectionList
                sections={CONTACTS_DATA}
                renderItem={renderContactItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={item => item.id}
                ListHeaderComponent={<View style={styles.listHeader}><Text style={styles.listHeaderText}>📞 Контакти</Text></View>}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
        </SafeAreaView>
    );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function NewsStack() {
    return (
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
            <Stack.Screen name="Main" component={MainScreen} options={{ title: 'Головна' }} />
            <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={({ route }) => ({
                tabBarIcon: () => <Text style={{ fontSize: 24 }}>{route.name === 'News' ? '📰' : '📞'}</Text>,
                ...SCREEN_OPTIONS,
            })}>
                <Tab.Screen name="News" component={NewsStack} options={{ title: 'Новини' }} />
                <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Контакти' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    listHeader: { padding: 20, backgroundColor: COLORS.headerBg, alignItems: 'center' },
    listHeaderText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    listFooter: { padding: 20, alignItems: 'center' },
    itemSeparator: { height: 1, backgroundColor: COLORS.separator },
    newsItem: { padding: 15 },
    newsTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    newsDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 5 },
    newsMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    newsCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    newsDate: { fontSize: 12, color: COLORS.textTertiary },
    detailsContent: { padding: 20 },
    detailsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    detailsMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    detailsCategory: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
    detailsDate: { fontSize: 14, color: COLORS.textTertiary },
    detailsDescription: { fontSize: 16, lineHeight: 24 },
    sectionHeader: { backgroundColor: COLORS.headerBg, padding: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },
    contactItem: { padding: 15 },
    contactName: { fontSize: 16, fontWeight: 'bold' },
    contactPosition: { fontSize: 14, color: COLORS.textSecondary },
    contactPhone: { fontSize: 14, color: COLORS.primary },
});