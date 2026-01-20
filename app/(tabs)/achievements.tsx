import { ScrollView, Text, View, ActivityIndicator, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllBadges, Badge } from "@/lib/badges";
import { getUnlockedBadges, UnlockedBadge, getBadgeProgress } from "@/lib/badge-tracker";
import { getAllSessions } from "@/lib/workout-utils";

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
      consistency: 'Consistency Streaks',
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
  const categories = ['sessions', 'strength', 'plyometric', 'consistency'];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
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
