// mobile/app/messages/conversation/[id].tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Avatar,
  IconButton,
  TextInput,
  ActivityIndicator,
  useTheme,
  Surface,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useMessagesStore } from '../../../src/stores/messagesStore';
import socketService from '../../../src/services/socket';
import { Message } from '../../../src/services/messages';
import * as ImagePicker from 'expo-image-picker';

export default function ConversationScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    typingUsers,
    isLoading,
    fetchMessages,
    sendMessage,
    setActiveConversation,
  } = useMessagesStore();

  const conversationMessages = messages[userId || ''] || [];

  useEffect(() => {
    if (userId) {
      loadMessages();
      setActiveConversation(userId);
      loadUserInfo();
    }

    return () => {
      setActiveConversation(null);
      if (userId) {
        socketService.emitTypingStop(userId);
      }
    };
  }, [userId]);

  const loadMessages = async () => {
    if (userId) {
      await fetchMessages(userId, 1);
    }
  };

  const loadUserInfo = async () => {
    // TODO: Fetch user info from API or friends store
    setUserInfo({
      fullName: 'User Name',
      avatar: null,
      isOnline: false,
    });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      await sendMessage({
        receiverId: userId,
        content: text,
        type: 'text',
      });

      // Stop typing indicator
      socketService.emitTypingStop(userId);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(text);
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);

    if (!userId) return;

    // Handle typing indicator
    if (text.trim() && !isTyping) {
      setIsTyping(true);
      socketService.emitTypingStart(userId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emitTypingStop(userId);
    }, 2000);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to share images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && userId) {
      // TODO: Upload image and send message
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isSentByMe = item.senderId !== userId;
    const nextMessage = conversationMessages[index + 1];
    const showAvatar = !nextMessage || nextMessage.senderId !== item.senderId;

    return (
      <View
        style={[
          styles.messageContainer,
          isSentByMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isSentByMe && showAvatar && (
          <Avatar.Image
            size={32}
            source={
              userInfo?.avatar
                ? { uri: userInfo.avatar }
                : require('../../../assets/default-avatar.png')
            }
            style={styles.messageAvatar}
          />
        )}
        {!isSentByMe && !showAvatar && <View style={{ width: 32 }} />}

        <View
          style={[
            styles.messageBubble,
            isSentByMe ? styles.myMessage : styles.theirMessage,
          ]}
        >
          {item.type === 'text' && (
            <Text style={isSentByMe ? styles.myMessageText : styles.theirMessageText}>
              {item.content}
            </Text>
          )}

          {item.type === 'image' && item.metadata?.thumbnailUrl && (
            <Image
              source={{ uri: item.metadata.thumbnailUrl }}
              style={styles.imageMessage}
              resizeMode="cover"
            />
          )}

          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
            {isSentByMe && (
              <IconButton
                icon={item.isRead ? 'check-all' : 'check'}
                size={14}
                iconColor={item.isRead ? theme.colors.primary : '#999'}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!userId || !typingUsers[userId]) return null;

    return (
      <View style={styles.typingContainer}>
        <Avatar.Image
          size={32}
          source={
            userInfo?.avatar
              ? { uri: userInfo.avatar }
              : require('../../../assets/default-avatar.png')
          }
          style={styles.messageAvatar}
        />
        <Surface style={styles.typingBubble} elevation={1}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />

        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => router.push(`/friends/profile/${userId}`)}
        >
          <Avatar.Image
            size={40}
            source={
              userInfo?.avatar
                ? { uri: userInfo.avatar }
                : require('../../../assets/default-avatar.png')
            }
          />
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.headerName}>
              {userInfo?.fullName || 'Loading...'}
            </Text>
            <Text variant="bodySmall" style={styles.headerStatus}>
              {userInfo?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <IconButton icon="phone" size={24} onPress={() => {}} />
        <IconButton icon="video" size={24} onPress={() => {}} />
      </Surface>

      {/* Messages List */}
      {isLoading && conversationMessages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderTypingIndicator}
        />
      )}

      {/* Input */}
      <Surface style={styles.inputContainer} elevation={4}>
        <IconButton
          icon="image"
          size={24}
          onPress={handlePickImage}
        />

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          mode="outlined"
          outlineStyle={{ borderRadius: 24 }}
        />

        <IconButton
          icon={messageText.trim() ? 'send' : 'microphone'}
          size={24}
          iconColor={messageText.trim() ? theme.colors.primary : '#666'}
          onPress={messageText.trim() ? handleSendMessage : () => {}}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontWeight: '600',
  },
  headerStatus: {
    color: '#666',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#6200EE',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  myMessageText: {
    color: 'white',
    fontSize: 15,
  },
  theirMessageText: {
    color: '#000',
    fontSize: 15,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  readIcon: {
    margin: 0,
    padding: 0,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  typingDot1: {
    // Animation will be added via CSS or React Native Animated
  },
  typingDot2: {
    // Animation will be added via CSS or React Native Animated
  },
  typingDot3: {
    // Animation will be added via CSS or React Native Animated
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: 'white',
  },
});
