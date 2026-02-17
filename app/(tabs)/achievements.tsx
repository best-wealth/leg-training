import { ScrollView, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Alert, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllBadges, Badge } from "@/lib/badges";
import { getUnlockedBadges, UnlockedBadge, getBadgeProgress, unlockBadge } from "@/lib/badge-tracker";
import { getAllSessions } from "@/lib/workout-utils";
import { generateBadgeShareMessage, shareNatively } from "@/lib/social-share";


export default function AchievementsScreen() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const badges = getAllBadges();
      const unlocked = await getUnlockedBadges();
      const allSessions = await getAllSessions();

      setAllBadges(badges);
      setUnlockedBadges(unlocked);
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBadgeUnlocked = (badgeId: string): boolean => {
    return unlockedBadges.some(b => b.id === badgeId);
  };

  const handleTestUnlock = async () => {
    try {
      console.log('Testing badge unlock...');
      const result = await unlockBadge('first_session');
      console.log('Unlock result:', result);
      await loadData();
    } catch (error) {
      console.error('Test unlock error:', error);
    }
  };

  const handleShareBadge = async (badge: Badge) => {
    try {
      const message = generateBadgeShareMessage(badge.name, badge.description);
      await shareNatively({
        title: 'Share Achievement',
        message: message,
      });
    } catch (error) {
      console.error('Error sharing badge:', error);
      Alert.alert('Share Error', 'Failed to share achievement');
    }
  };

  const getUnlockDate = (badgeId: string): string | undefined => {
    const badge = unlockedBadges.find(b => b.id === badgeId);
    if (badge) {
      return new Date(badge.unlockedAt).toLocaleDateString();
    }
    return undefined;
  };

  const renderBadgeCategory = (category: string, badges: Badge[]) => {
    const categoryBadges = badges.filter(b => b.category === category);
    if (categoryBadges.length === 0) return null;

    const categoryNames: Record<string, string> = {
      sessions: 'Session Milestones',
      strength: 'Strength Achievements',
      plyometric: 'Plyometric Achievements',
    };

    return (
      <View key={category} className="gap-3 mb-6">
        <Text className="text-lg font-bold text-foreground">
          {categoryNames[category]}
        </Text>
        <View className="gap-2">
          {categoryBadges.map((badge) => {
            const isUnlocked = isBadgeUnlocked(badge.id);
            const unlockDate = getUnlockDate(badge.id);

            return (
              <View
                key={badge.id}
                className={`rounded-xl p-4 border ${
                  isUnlocked
                    ? 'bg-surface border-primary'
                    : 'bg-surface border-border opacity-50'
                }`}
              >
                <View className="flex-row items-start gap-3">
                  <Text className="text-4xl">{badge.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {badge.name}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {badge.description}
                    </Text>
                    {isUnlocked && unlockDate && (
                      <Text className="text-xs text-primary font-semibold mt-2">
                        ✓ Unlocked on {unlockDate}
                      </Text>
                    )}
                    {!isUnlocked && (
                      <Text className="text-xs text-muted mt-2">
                        🔒 Locked
                      </Text>
                    )}
                  </View>
                  {isUnlocked && (
                    <TouchableOpacity
                      onPress={() => handleShareBadge(badge)}
                      className="ml-2 p-2"
                    >
                      <Text className="text-xl">📤</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  const unlockedCount = unlockedBadges.length;
  const totalCount = allBadges.length;
  const categories = ['sessions', 'strength', 'plyometric'];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Test Button */}
          <Pressable
            onPress={handleTestUnlock}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-yellow-500 rounded-lg p-3"
          >
            <Text className="text-center font-bold text-black">Test Unlock Badge</Text>
          </Pressable>

          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Achievements</Text>
            <Text className="text-sm text-muted">
              {unlockedCount} of {totalCount} badges unlocked
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="gap-2">
            <View className="h-3 bg-surface rounded-full overflow-hidden border border-border">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </View>
            <Text className="text-xs text-muted text-center">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </Text>
          </View>

          {/* Badges by Category */}
          {categories.map((category) => renderBadgeCategory(category, allBadges))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
