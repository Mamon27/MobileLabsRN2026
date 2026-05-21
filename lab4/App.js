import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
    primary: '#FF6B35',
    success: '#2EC4B6',
    background: '#F7F7F7',
    text: '#1A1A2E',
    white: '#FFFFFF'
};

const FILES_KEY = '@file_manager_data';

export default function App() {
    const [currentPath, setCurrentPath] = useState('/');
    const [history, setHistory] = useState(['/']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [modalCreateFolderVisible, setModalCreateFolderVisible] = useState(false);
    const [modalCreateFileVisible, setModalCreateFileVisible] = useState(false);
    const [modalEditFileVisible, setModalEditFileVisible] = useState(false);
    const [modalInfoVisible, setModalInfoVisible] = useState(false);
    
    const [newFolderName, setNewFolderName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState([]);
    const [editFileContent, setEditFileContent] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);

    useEffect(() => {
        loadFiles();
    }, [currentPath]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await AsyncStorage.getItem(FILES_KEY);
            const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
            
            const currentFilesList = allData.files[currentPath] || [];
            const currentFoldersList = allData.folders[currentPath] || [];
            
            // Виправлено: використовуємо concat для об'єднання масивів
            const fileList = [
                ...currentFoldersList.map(name => ({ 
                    name: name, 
                    isDirectory: true, 
                    size: 0, 
                    modificationTime: Date.now() 
                })),
                ...currentFilesList.map(name => ({ 
                    name: name, 
                    isDirectory: false, 
                    size: (allData.contents && allData.contents[currentPath + name] ? allData.contents[currentPath + name].length : 0), 
                    modificationTime: Date.now() 
                }))
            ];
            
            setFiles(fileList);
        } catch (error) {
            console.log('Error:', error);
        }
        setLoading(false);
    };

    const saveData = async (newData) => {
        await AsyncStorage.setItem(FILES_KEY, JSON.stringify(newData));
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = () => {
        return new Date().toLocaleDateString();
    };

    const navigateToFolder = (folderName) => {
        const newPath = currentPath + folderName + '/';
        setCurrentPath(newPath);
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newPath);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const navigateUp = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentPath(history[newIndex]);
        }
    };

    const navigateForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentPath(history[newIndex]);
        }
    };

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;

    const createFolder = async () => {
        if (!newFolderName.trim()) {
            Alert.alert('Помилка', 'Введіть назву папки');
            return;
        }
        try {
            const data = await AsyncStorage.getItem(FILES_KEY);
            const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
            
            if (!allData.folders[currentPath]) {
                allData.folders[currentPath] = [];
            }
            
            if (!allData.folders[currentPath].includes(newFolderName)) {
                allData.folders[currentPath].push(newFolderName);
            }
            
            await saveData(allData);
            setModalCreateFolderVisible(false);
            setNewFolderName('');
            loadFiles();
            Alert.alert('Успіх', 'Папку створено');
        } catch (error) {
            Alert.alert('Помилка', 'Не вдалося створити папку');
        }
    };

    const createFile = async () => {
        if (!newFileName.trim()) {
            Alert.alert('Помилка', 'Введіть назву файлу');
            return;
        }
        try {
            let fileName = newFileName.trim();
            if (!fileName.endsWith('.txt')) {
                fileName = fileName + '.txt';
            }
            
            const data = await AsyncStorage.getItem(FILES_KEY);
            const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
            
            if (!allData.files[currentPath]) {
                allData.files[currentPath] = [];
            }
            
            if (!allData.files[currentPath].includes(fileName)) {
                allData.files[currentPath].push(fileName);
                if (!allData.contents) allData.contents = {};
                allData.contents[currentPath + fileName] = newFileContent || '';
            }
            
            await saveData(allData);
            setModalCreateFileVisible(false);
            setNewFileName('');
            setNewFileContent('');
            loadFiles();
            Alert.alert('Успіх', 'Файл створено');
        } catch (error) {
            Alert.alert('Помилка', 'Не вдалося створити файл');
        }
    };

    const openFile = async (item) => {
        try {
            const data = await AsyncStorage.getItem(FILES_KEY);
            const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
            const content = (allData.contents && allData.contents[currentPath + item.name]) || '';
            setSelectedItem(item);
            setEditFileContent(content);
            setModalEditFileVisible(true);
        } catch (error) {
            Alert.alert('Помилка', 'Не вдалося відкрити файл');
        }
    };

    const saveFile = async () => {
        try {
            const data = await AsyncStorage.getItem(FILES_KEY);
            const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
            if (!allData.contents) allData.contents = {};
            allData.contents[currentPath + selectedItem.name] = editFileContent;
            await saveData(allData);
            setModalEditFileVisible(false);
            loadFiles();
            Alert.alert('Успіх', 'Файл збережено');
        } catch (error) {
            Alert.alert('Помилка', 'Не вдалося зберегти файл');
        }
    };

    const deleteItem = (item) => {
        Alert.alert('Підтвердження', `Видалити ${item.isDirectory ? 'папку' : 'файл'} "${item.name}"?`, [
            { text: 'Скасувати', style: 'cancel' },
            { text: 'Видалити', style: 'destructive', onPress: async () => {
                try {
                    const data = await AsyncStorage.getItem(FILES_KEY);
                    const allData = data ? JSON.parse(data) : { folders: {}, files: {}, contents: {} };
                    
                    if (item.isDirectory) {
                        allData.folders[currentPath] = allData.folders[currentPath].filter(f => f !== item.name);
                    } else {
                        allData.files[currentPath] = allData.files[currentPath].filter(f => f !== item.name);
                        if (allData.contents) delete allData.contents[currentPath + item.name];
                    }
                    
                    await saveData(allData);
                    loadFiles();
                    Alert.alert('Успіх', 'Видалено');
                } catch (error) {
                    Alert.alert('Помилка', 'Не вдалося видалити');
                }
            }}
        ]);
    };

    const showInfo = (item) => {
        setFileInfo({
            name: item.name,
            type: item.isDirectory ? 'Папка' : 'txt',
            size: formatSize(item.size),
            modified: formatDate()
        });
        setSelectedItem(item);
        setModalInfoVisible(true);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.fileItem} onPress={() => item.isDirectory ? navigateToFolder(item.name) : openFile(item)}
            onLongPress={() => Alert.alert('Дії', `Оберіть дію для "${item.name}"`, [
                { text: 'Інформація', onPress: () => showInfo(item) },
                { text: 'Видалити', style: 'destructive', onPress: () => deleteItem(item) },
                { text: 'Скасувати', style: 'cancel' }
            ])}>
            <Text style={styles.icon}>{item.isDirectory ? '📁' : '📄'}</Text>
            <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.fileSize}>{item.isDirectory ? 'Папка' : formatSize(item.size)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>СТАТИСТИКА ПАМ'ЯТІ</Text>
            <View style={styles.statRow}><Text style={styles.statLabel}>Всього:</Text><Text style={styles.statValue}>64 GB</Text></View>
            <View style={styles.statRow}><Text style={styles.statLabel}>Вільно:</Text><Text style={[styles.statValue, { color: COLORS.success }]}>32 GB</Text></View>
            <View style={styles.statRow}><Text style={styles.statLabel}>Зайнято:</Text><Text style={[styles.statValue, { color: COLORS.primary }]}>32 GB</Text></View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={navigateUp} disabled={!canGoBack}>
                    <Text style={{ fontSize: 24, opacity: canGoBack ? 1 : 0.3 }}>⬅️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateForward} disabled={!canGoForward}>
                    <Text style={{ fontSize: 24, opacity: canGoForward ? 1 : 0.3 }}>➡️</Text>
                </TouchableOpacity>
                <Text style={styles.pathText} numberOfLines={1}>{currentPath}</Text>
                <TouchableOpacity onPress={() => setModalCreateFolderVisible(true)}>
                    <Text style={{ fontSize: 24 }}>📁+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalCreateFileVisible(true)}>
                    <Text style={{ fontSize: 24 }}>📄+</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
                <FlatList data={files} renderItem={renderItem} keyExtractor={(item) => item.name} ListHeaderComponent={renderHeader} ListEmptyComponent={<Text style={styles.emptyText}>Папка порожня</Text>} />
            )}

            <Modal visible={modalCreateFolderVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Створити папку</Text>
                        <TextInput style={styles.input} placeholder="Назва папки" value={newFolderName} onChangeText={setNewFolderName} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => { setModalCreateFolderVisible(false); setNewFolderName(''); }}>
                                <Text style={styles.modalButtonText}>Скасувати</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.success }]} onPress={createFolder}>
                                <Text style={styles.modalButtonText}>Створити</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalCreateFileVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Створити файл</Text>
                        <TextInput style={styles.input} placeholder="Ім'я файлу (file.txt)" value={newFileName} onChangeText={setNewFileName} />
                        <TextInput style={[styles.input, { height: 100 }]} placeholder="Вміст файлу" value={newFileContent} onChangeText={setNewFileContent} multiline />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => { setModalCreateFileVisible(false); setNewFileName(''); setNewFileContent(''); }}>
                                <Text style={styles.modalButtonText}>Скасувати</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.success }]} onPress={createFile}>
                                <Text style={styles.modalButtonText}>Створити</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalEditFileVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%' }]}>
                        <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                        <TextInput style={[styles.input, { flex: 1 }]} value={editFileContent} onChangeText={setEditFileContent} multiline textAlignVertical="top" />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setModalEditFileVisible(false)}>
                                <Text style={styles.modalButtonText}>Скасувати</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primary }]} onPress={saveFile}>
                                <Text style={styles.modalButtonText}>Зберегти</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalInfoVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Інформація про файл</Text>
                        {fileInfo && (
                            <View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Назва:</Text><Text style={styles.infoValue}>{fileInfo.name}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Тип:</Text><Text style={styles.infoValue}>{fileInfo.type}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Розмір:</Text><Text style={styles.infoValue}>{fileInfo.size}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Змінено:</Text><Text style={styles.infoValue}>{fileInfo.modified}</Text></View>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primary }]} onPress={() => setModalInfoVisible(false)}>
                            <Text style={styles.modalButtonText}>Закрити</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
    pathText: { flex: 1, marginHorizontal: 10, fontSize: 14, color: COLORS.text },
    statsContainer: { backgroundColor: COLORS.white, padding: 15, margin: 10, borderRadius: 10 },
    statsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    statLabel: { color: '#666' },
    statValue: { fontWeight: 'bold' },
    fileItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: COLORS.white, marginHorizontal: 10, marginTop: 5, borderRadius: 10 },
    icon: { fontSize: 30 },
    fileInfo: { marginLeft: 15, flex: 1 },
    fileName: { fontSize: 16, color: COLORS.text },
    fileSize: { fontSize: 12, color: '#666' },
    emptyText: { textAlign: 'center', color: '#666', marginTop: 50 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: COLORS.white, padding: 20, borderRadius: 10, width: '85%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.text },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoLabel: { color: '#666' },
    infoValue: { fontWeight: 'bold', maxWidth: '60%' }
});