// mobile/app/(tabs)/messages.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Badge,
  IconButton,
  Searchbar,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useMessagesStore } from '../../src/stores/messagesStore';
import socketService from '../../src/services/socket';
import { Conversation } from '../../src/services/messages';

export default function MessagesScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    conversations,
    isLoading,
    error,
    unreadCount,
    fetchConversations,
    initializeSocketListeners,
    cleanupSocketListeners,
  } = useMessagesStore();

  useEffect(() => {
    loadConversations();
    initializeSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const loadConversations = async () => {
    await fetchConversations(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: '/messages/conversation/[id]',
      params: { id: conversation.user.id },
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';

    const { type, content, senderId } = conversation.lastMessage;
    const isSentByMe = senderId === 'me'; // TODO: Get actual user ID from auth store

    const prefix = isSentByMe ? 'You: ' : '';

    switch (type) {
      case 'text':
        return prefix + content;
      case 'image':
        return prefix + '📷 Photo';
      case 'video':
        return prefix + '🎥 Video';
      case 'audio':
        return prefix + '🎵 Audio';
      case 'gif':
        return prefix + '🎬 GIF';
      default:
        return prefix + content;
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity onPress={() => handleConversationPress(item)}>
      <Surface style={styles.conversationCard} elevation={0}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={56}
            source={
              item.user.avatar
                ? { uri: item.user.avatar }
                : require('../../assets/default-avatar.png')
            }
          />
          {item.user.isOnline && <Badge style={styles.onlineBadge} size={16} />}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.userName} numberOfLines={1}>
              {item.user.fullName}
            </Text>
            {item.lastMessage && (
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatTimestamp(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text
              variant="bodyMedium"
              numberOfLines={1}
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage,
              ]}
            >
              {getLastMessagePreview(item)}
            </Text>
            {item.unreadCount > 0 && (
              <Badge style={styles.unreadBadge}>{item.unreadCount}</Badge>
            )}
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="message-outline" size={64} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Messages Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Start a conversation with your friends!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Messages
        </Text>

        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {isLoading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading conversations...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#4CAF50',
  },
  conversationInfo: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    flex: 1,
    fontWeight: '600',
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    color: '#666',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#6200EE',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
});
