import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONV_KEY = 'chat_conversations_v1';
const MSG_KEY_PREFIX = 'chat_messages_v1_';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatScreen({ route, navigation }) {
  const { conversationId, title } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MSG_KEY_PREFIX + conversationId);
        if (raw) setMessages(JSON.parse(raw));
      } catch (e) {
        // no-op
      }
    })();
  }, [conversationId]);

  const saveMessages = async (items) => {
    setMessages(items);
    try {
      await AsyncStorage.setItem(MSG_KEY_PREFIX + conversationId, JSON.stringify(items));
    } catch (e) {
      // no-op
    }
  };

  const appendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg = { id: generateId(), text: trimmed, createdAt: Date.now(), sender: 'me' };
    const next = [newMsg, ...messages];
    await saveMessages(next);
    setInput('');
    try {
      const rawConvs = await AsyncStorage.getItem(CONV_KEY);
      const convs = rawConvs ? JSON.parse(rawConvs) : [];
      const updated = convs.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: trimmed, updatedAt: Date.now() } : c
      );
      await AsyncStorage.setItem(CONV_KEY, JSON.stringify(updated));
    } catch (e) {
      // no-op
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther]}>
      <Text style={styles.bubbleText}>{item.text}</Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={messages.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={<Text style={styles.emptyText}>Напишіть перше повідомлення</Text>}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Повідомлення"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={appendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={appendMessage}>
            <Text style={styles.sendBtnText}>Надіслати</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f0f6f8' },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e6eef1',
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d8e3e8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '600' },
  bubble: {
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#d8f3ff',
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  bubbleText: { fontSize: 16, color: '#222' },
  time: { fontSize: 11, color: '#6b7b85', marginTop: 4, alignSelf: 'flex-end' },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#7a8b94' },
});