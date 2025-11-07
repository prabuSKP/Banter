// mobile/app/friends/search.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  IconButton,
  Searchbar,
  Button,
  ActivityIndicator,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useFriendsStore } from '../../src/stores/friendsStore';
import { UserProfile } from '../../src/types';

export default function SearchFriendsScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  const {
    searchResults,
    suggestions,
    isLoading,
    searchUsers,
    fetchSuggestions,
    sendFriendRequest,
    clearSearchResults,
  } = useFriendsStore();

  useEffect(() => {
    // Load suggestions on mount
    fetchSuggestions(1);

    return () => {
      clearSearchResults();
    };
  }, []);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      Alert.alert('Invalid Search', 'Please enter at least 2 characters');
      return;
    }
    await searchUsers(query.trim());
  };

  const handleSendRequest = async (userId: string, userName: string) => {
    try {
      await sendFriendRequest(userId);
      Alert.alert('Success', `Friend request sent to ${userName}!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send friend request');
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <Surface style={styles.userCard} elevation={1}>
      <View style={styles.userInfo}>
        <Avatar.Image
          size={56}
          source={
            item.avatar
              ? { uri: item.avatar }
              : require('../../assets/default-avatar.png')
          }
        />

        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.fullName}
            </Text>
            {item.isPremium && (
              <IconButton
                icon="crown"
                size={16}
                iconColor="#FFD700"
                style={styles.premiumIcon}
              />
            )}
          </View>

          <Text variant="bodySmall" style={styles.username}>
            @{item.username}
          </Text>

          {item.bio && (
            <Text variant="bodySmall" numberOfLines={2} style={styles.bio}>
              {item.bio}
            </Text>
          )}

          {item.interests && item.interests.length > 0 && (
            <View style={styles.interests}>
              {item.interests.slice(0, 3).map((interest, index) => (
                <Chip key={index} compact style={styles.interestChip}>
                  {interest}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.userActions}>
        <Button
          mode="outlined"
          icon="account"
          onPress={() => router.push(`/friends/profile/${item.id}`)}
          style={styles.viewButton}
        >
          View
        </Button>
        <Button
          mode="contained"
          icon="account-plus"
          onPress={() => handleSendRequest(item.id, item.fullName)}
          style={styles.addButton}
        >
          Add Friend
        </Button>
      </View>
    </Surface>
  );

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Searching...
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && query.trim().length > 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account-search" size={64} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Results Found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Try searching with a different name or username
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  const renderSuggestions = () => {
    if (isLoading && suggestions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading suggestions...
          </Text>
        </View>
      );
    }

    if (suggestions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="lightbulb-outline" size={64} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Suggestions
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            We'll suggest people you might know
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={suggestions}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={styles.title}>
          Add Friends
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search by name or username..."
          onChangeText={setQuery}
          value={query}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />
      </View>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          {
            value: 'search',
            label: 'Search',
            icon: 'magnify',
          },
          {
            value: 'suggestions',
            label: 'Suggestions',
            icon: 'lightbulb-outline',
          },
        ]}
        style={styles.tabs}
      />

      {activeTab === 'search' ? renderSearchResults() : renderSuggestions()}
    </View>
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
    elevation: 2,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    margin: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
  },
  premiumIcon: {
    margin: 0,
    padding: 0,
  },
  username: {
    color: '#666',
  },
  bio: {
    color: '#888',
    marginTop: 4,
  },
  interests: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  interestChip: {
    height: 24,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
  },
  addButton: {
    flex: 2,
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
    paddingHorizontal: 32,
  },
});
