import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chat_conversations_v1';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatListScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setConversations(JSON.parse(raw));
      }
    } catch (e) {
      // no-op
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadConversations);
    loadConversations();
    return unsubscribe;
  }, [navigation, loadConversations]);

  const saveConversations = async (items) => {
    setConversations(items);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // no-op
    }
  };

  const onCreateChat = async () => {
    const title = newTitle.trim() || 'New Chat';
    const id = generateId();
    const newConversation = { id, title, lastMessage: '', updatedAt: Date.now() };
    const next = [newConversation, ...conversations];
    await saveConversations(next);
    setNewTitle('');
    navigation.navigate('Chat', { conversationId: id, title });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: item.title })}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.lastMessage ? (
        <Text style={styles.itemSubtitle} numberOfLines={1}>{item.lastMessage}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.newRow}>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Назва чату"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={onCreateChat}
        />
        <TouchableOpacity style={styles.addBtn} onPress={onCreateChat}>
          <Text style={styles.addBtnText}>Створити</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations.sort((a, b) => b.updatedAt - a.updatedAt)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={<Text style={styles.emptyText}>Немає чатів. Додайте новий.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  newRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  addBtn: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  item: { paddingVertical: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemSubtitle: { color: '#666' },
  separator: { height: 1, backgroundColor: '#eee' },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999' },
});