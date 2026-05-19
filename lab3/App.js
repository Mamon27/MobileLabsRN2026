import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Switch, Animated, PanResponder, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const COLORS = {
    primary: '#FF6B35',
    success: '#2EC4B6',
    background: '#F7F7F7',
    text: '#1A1A2E',
    white: '#FFFFFF',
    gold: '#FFD700',
    darkBg: '#1A1A2E',
    darkText: '#F7F7F7'
};

function GameScreen({ score, setScore, quests, setQuests, darkMode, purchases }) {
    const [clickType, setClickType] = useState('tap');
    const lastTapTime = useRef(0);
    const pressStartTime = useRef(0);
    const panX = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bg = darkMode ? COLORS.darkBg : COLORS.background;
    const textColor = darkMode ? COLORS.darkText : COLORS.text;

    const updateQuest = (id, add) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && !q.done) {
                const newProgress = q.progress + add;
                return { ...q, progress: newProgress, done: newProgress >= q.target };
            }
            return q;
        }));
    };

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => { panX.setValue(0); },
        onPanResponderMove: Animated.event([null, { dx: panX }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dx > 80) { doGesture('right'); }
            else if (gestureState.dx < -80) { doGesture('left'); }
            panX.setValue(0);
        }
    })).current;

    const doGesture = (type) => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.3, duration: 50, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
        ]).start();
        
        let points = 1;
        if (type === 'double') points = purchases[0] ? 4 : 2;
        else if (type === 'long') points = 10;
        else if (type === 'pinch') points = 20;
        else if (type === 'right' || type === 'left') {
            points = purchases[1] ? 10 : 5;
            updateQuest(type === 'right' ? 7 : 8, 1);
        }

        if (purchases[2]) points *= 3;

        setScore(prev => prev + points);
        setClickType(type);

        updateQuest(1, 1);
        if (score + points >= 50) updateQuest(4, score + points);
        if (score + points >= 100) updateQuest(5, score + points);
        if (score + points >= 500) updateQuest(6, score + points);
    };

    const handlePress = () => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;
        if (timeSinceLastTap < 300) {
            doGesture('double');
            updateQuest(2, 1);
            lastTapTime.current = 0;
            return;
        }
        lastTapTime.current = now;
        setTimeout(() => {
            if (lastTapTime.current !== 0 && (Date.now() - lastTapTime.current) >= 300) {
                doGesture('tap');
            }
        }, 300);
    };

    const handleLongPress = () => {
        const pressDuration = Date.now() - pressStartTime.current;
        if (pressDuration >= 3000) {
            doGesture('long');
            updateQuest(3, 1);
        }
    };

    const handlePressIn = () => { pressStartTime.current = Date.now(); };

    const handlePressOut = () => {
        const pressDuration = Date.now() - pressStartTime.current;
        if (pressDuration >= 500 && pressDuration < 1500) {
            doGesture('pinch');
            updateQuest(9, 1);
        }
        pressStartTime.current = 0;
    };

    const getPoints = () => { 
        switch(clickType) { 
            case 'tap': return '+1'; 
            case 'double': return purchases[0] ? '+4' : '+2'; 
            case 'long': return '+10'; 
            case 'left': case 'right': return purchases[1] ? '+10' : '+5'; 
            case 'pinch': return '+20'; 
            default: return '+1'; 
        } 
    };
    
    const getEmoji = () => { 
        switch(clickType) { 
            case 'tap': return 'ТАПНИ!'; 
            case 'double': return 'x2!'; 
            case 'long': return 'ДОВГО!'; 
            case 'left': case 'right': return 'СВАЙП!'; 
            case 'pinch': return 'ZOOM!'; 
            default: return 'ТАПНИ!'; 
        } 
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
            <View style={styles.header}>
                <Text style={[styles.scoreLabel, { color: textColor }]}>ОЧКИ</Text>
                <Text style={[styles.score, { color: COLORS.primary }]}>{score}</Text>
            </View>
            <View style={styles.gameArea}>
                <Animated.View {...panResponder.panHandlers} style={[styles.coin, { transform: [{ scale: scaleAnim }, { translateX: panX }] }]}>
                    <TouchableOpacity 
                        onPress={handlePress} 
                        onLongPress={handleLongPress} 
                        onPressIn={handlePressIn} 
                        onPressOut={handlePressOut} 
                        activeOpacity={1} 
                        delayLongPress={3000} 
                        style={styles.touch}>
                        <Text style={styles.coinText}>💰</Text>
                        <Text style={styles.coinLabel}>{getEmoji()}</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Text style={styles.plusScore}>{getPoints()}</Text>
            </View>
            <View style={styles.hints}>
                <Text style={[styles.hintTitle, { color: textColor }]}>ЖЕСТИ:</Text>
                <Text style={[styles.hint, { color: textColor }]}>ТАП +1 | ПОДВІЙНИЙ +2 | ДОВГИЙ +10</Text>
                <Text style={[styles.hint, { color: textColor }]}>СВАЙП +5 | ZOOM +20</Text>
            </View>
        </SafeAreaView>
    );
}

function QuestsScreen({ quests, darkMode }) {
    const bg = darkMode ? COLORS.darkBg : COLORS.background;
    const textColor = darkMode ? COLORS.darkText : COLORS.text;
    const doneCount = quests.filter(q => q.done).length;
    
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
            <Text style={[styles.title, { color: textColor }]}>ЗАВДАННЯ ({doneCount}/10)</Text>
            {quests.map((q, i) => (
                <View key={i} style={[styles.card, { backgroundColor: darkMode ? '#2A2A3E' : COLORS.white }]}>
                    <Text style={[styles.questName, { color: q.done ? COLORS.success : textColor }]}>{q.done ? '✅ ' : '⬜ '} {q.name}</Text>
                    <Text style={[styles.questProgress, { color: q.done ? COLORS.success : textColor }]}>{q.progress}/{q.target}</Text>
                </View>
            ))}
        </SafeAreaView>
    );
}

function ShopScreen({ score, setScore, purchases, setPurchases, darkMode }) {
    const bg = darkMode ? COLORS.darkBg : COLORS.background;
    const textColor = darkMode ? COLORS.darkText : COLORS.text;
    const upgrades = [
        { id: 1, name: 'Подвійний клік x2', cost: 50, desc: 'Клік дає +2 очки', bought: purchases[0] },
        { id: 2, name: 'Бонус за свайп', cost: 100, desc: 'Свайп дає +10 очок', bought: purchases[1] },
        { id: 3, name: 'Множник x3', cost: 500, desc: 'Всі очки множаться на 3', bought: purchases[2] }
    ];
    
    const buyUpgrade = (upgrade, index) => {
        if (upgrade.bought) {
            Alert.alert('Вже куплено', 'Ви вже придбали цей товар!');
            return;
        }
        if (score >= upgrade.cost) {
            setScore(s => s - upgrade.cost);
            setPurchases(prev => { 
                const newPurchases = [...prev]; 
                newPurchases[index] = true; 
                return newPurchases; 
            });
            Alert.alert('Успіх!', 'Ви придбали: ' + upgrade.name + '!');
        } else {
            Alert.alert('Недостатньо очок', 'Потрібно ще ' + (upgrade.cost - score) + ' очок!');
        }
    };
    
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
            <Text style={[styles.title, { color: COLORS.gold }]}>МАГАЗИН</Text>
            <View style={[styles.card, { backgroundColor: darkMode ? '#2A2A3E' : COLORS.white }]}>
                <Text style={[styles.shopScore, { color: COLORS.gold }]}>Ваші монети: {score}</Text>
            </View>
            {upgrades.map((u, i) => (
                <TouchableOpacity 
                    key={i} 
                    style={[styles.card, { backgroundColor: darkMode ? '#2A2A3E' : COLORS.white }]} 
                    onPress={() => buyUpgrade(u, i)}>
                    <View>
                        <Text style={[styles.upgradeName, { color: textColor }]}>{u.bought ? '✅ ' + u.name : u.name}</Text>
                        <Text style={styles.upgradeDesc}>{u.desc}</Text>
                    </View>
                    <View style={[styles.costBadge, { backgroundColor: u.bought ? '#666' : score >= u.cost ? COLORS.success : '#999' }]}>
                        <Text style={styles.costText}>{u.bought ? 'КУПЛЕНО' : u.cost}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </SafeAreaView>
    );
}

export default function App() {
    const [score, setScore] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [purchases, setPurchases] = useState([false, false, false]);
    const [quests, setQuests] = useState([
        { id: 1, name: 'Тапни 100 разів', progress: 0, target: 100, done: false },
        { id: 2, name: 'Подвійний тап 50 разів', progress: 0, target: 50, done: false },
        { id: 3, name: 'Довге натискання 10 разів', progress: 0, target: 10, done: false },
        { id: 4, name: 'Зароби 50 очок', progress: 0, target: 50, done: false },
        { id: 5, name: 'Зароби 100 очок', progress: 0, target: 100, done: false },
        { id: 6, name: 'Зароби 500 очок', progress: 0, target: 500, done: false },
        { id: 7, name: 'Свайп вправо 20 разів', progress: 0, target: 20, done: false },
        { id: 8, name: 'Свайп вліво 20 разів', progress: 0, target: 20, done: false },
        { id: 9, name: 'ZOOM жест 10 разів', progress: 0, target: 10, done: false },
        { id: 10, name: 'Виконати всі завдання', progress: 0, target: 9, done: false },
    ]);

    const Tab = createBottomTabNavigator();

    return (
        <NavigationContainer>
            <View style={{ flex: 1, backgroundColor: darkMode ? COLORS.darkBg : COLORS.background }}>
                <View style={styles.settingsBar}>
                    <Text style={{ color: darkMode ? COLORS.darkText : COLORS.text }}>🌙</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={() => setDarkMode(!darkMode)}
                        trackColor={{ false: '#767577', true: COLORS.success }}
                    />
                </View>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarIcon: () => (
                            <Text style={{ color: route.name === 'Гра' ? COLORS.primary : 'gray', fontWeight: 'bold' }}>{route.name}</Text>
                        ),
                        tabBarStyle: { backgroundColor: darkMode ? '#2A2A3E' : COLORS.white, paddingBottom: 30 }
                    })}>
                    <Tab.Screen name="Гра">
                        {() => <GameScreen score={score} setScore={setScore} quests={quests} setQuests={setQuests} darkMode={darkMode} purchases={purchases} />}
                    </Tab.Screen>
                    <Tab.Screen name="Завдання">
                        {() => <QuestsScreen quests={quests} darkMode={darkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Магазин">
                        {() => <ShopScreen score={score} setScore={setScore} purchases={purchases} setPurchases={setPurchases} darkMode={darkMode} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    settingsBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 10, paddingTop: 50 },
    header: { alignItems: 'center', marginTop: 20 },
    scoreLabel: { fontSize: 18, fontWeight: 'bold' },
    score: { fontSize: 60, fontWeight: 'bold' },
    gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    coin: { width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    touch: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
    coinText: { fontSize: 80 },
    coinLabel: { fontSize: 20, fontWeight: 'bold', color: '#8B6000' },
    plusScore: { fontSize: 40, fontWeight: 'bold', color: COLORS.success, marginTop: 20 },
    hints: { padding: 20, alignItems: 'center' },
    hintTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    hint: { fontSize: 14, color: '#666', marginBottom: 2 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 20 },
    card: { backgroundColor: COLORS.white, margin: 10, marginHorizontal: 20, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    questName: { fontSize: 16 },
    questProgress: { fontSize: 14, color: '#666', marginTop: 5 },
    shopScore: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    upgradeName: { fontSize: 16, fontWeight: 'bold' },
    upgradeDesc: { fontSize: 12, color: '#666', marginTop: 3 },
    costBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    costText: { color: COLORS.white, fontWeight: 'bold' },
});