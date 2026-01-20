import { ScrollView, Text, View, ActivityIndicator, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import {
  calculatePersonalRecords,
  getExerciseProgression,
  getBoxJumpProgression,
} from "@/lib/workout-utils";
import { getUniqueStrengthExercises } from "@/lib/exercises";
import { PersonalRecord } from "@/lib/types";
import { BarChart } from "react-native-chart-kit";
import { useColors } from "@/hooks/use-colors";

export default function StatsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [progressionData, setProgressionData] = useState<{
    sessionNumber: number;
    date: string;
    maxWeightKg: number;
    maxWeightLb: number;
  }[]>([]);
  const [boxJumpData, setBoxJumpData] = useState<{
    sessionNumber: number;
    date: string;
    maxHeightInches: number;
  }[]>([]);

  const exercises = getUniqueStrengthExercises();
  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const prs = await calculatePersonalRecords();
      setPersonalRecords(prs);

      if (prs.length > 0 && !selectedExercise) {
        setSelectedExercise(prs[0].exerciseName);
        await loadProgressionData(prs[0].exerciseName);
      } else if (selectedExercise) {
        await loadProgressionData(selectedExercise);
      }

      const boxData = await getBoxJumpProgression();
      setBoxJumpData(boxData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressionData = async (exerciseName: string) => {
    try {
      const progression = await getExerciseProgression(exerciseName);
      setProgressionData(progression);
    } catch (error) {
      console.error('Error loading progression:', error);
    }
  };

  const handleExerciseChange = async (exerciseName: string) => {
    setSelectedExercise(exerciseName);
    await loadProgressionData(exerciseName);
  };

  const getCurrentPR = (): PersonalRecord | undefined => {
    return personalRecords.find(pr => pr.exerciseName === selectedExercise);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </ScreenContainer>
    );
  }

  const currentPR = getCurrentPR();

  // Prepare chart data
  const chartData = progressionData.length > 0 ? {
    labels: progressionData.map(d => `#${d.sessionNumber}`),
    datasets: [{
      data: progressionData.map(d => d.maxWeightKg),
    }],
  } : null;

  const boxJumpChartData = boxJumpData.length > 0 ? {
    labels: boxJumpData.map(d => `#${d.sessionNumber}`),
    datasets: [{
      data: boxJumpData.map(d => d.maxHeightInches),
    }],
  } : null;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Stats</Text>
            <Text className="text-sm text-muted mt-1">Track your progress</Text>
          </View>

          {personalRecords.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg text-muted text-center">
                No completed workouts yet.{'\n'}Complete a session to see your stats!
              </Text>
            </View>
          ) : (
            <>
              {/* Exercise Selector */}
              <View className="bg-surface rounded-xl border border-border overflow-hidden">
                <Text className="text-sm text-muted px-4 pt-3 pb-1">Select Exercise</Text>
                <Picker
                  selectedValue={selectedExercise}
                  onValueChange={handleExerciseChange}
                  style={{
                    color: colors.foreground,
                    backgroundColor: 'transparent',
                  }}
                >
                  {exercises.map(ex => (
                    <Picker.Item
                      key={ex.id}
                      label={ex.name}
                      value={ex.name}
                    />
                  ))}
                </Picker>
              </View>

              {/* Personal Record Card */}
              {currentPR && (
                <View className="bg-primary rounded-2xl p-6">
                  <Text className="text-white text-sm font-semibold mb-2">
                    PERSONAL RECORD 🏆
                  </Text>
                  <Text className="text-white text-4xl font-bold mb-1">
                    {currentPR.maxWeightKg} kg
                  </Text>
                  <Text className="text-white opacity-80 text-lg">
                    ({currentPR.maxWeightLb.toFixed(2)} lb)
                  </Text>
                  <Text className="text-white opacity-70 text-sm mt-3">
                    Session #{currentPR.sessionNumber} • {new Date(currentPR.achievedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {/* Weight Progression Chart */}
              {chartData && chartData.datasets[0].data.length > 0 && (
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-lg font-semibold text-foreground mb-4">
                    Weight Progression
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={chartData}
                      width={Math.max(screenWidth - 80, chartData.labels.length * 60)}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=" kg"
                      chartConfig={{
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                        labelColor: (opacity = 1) => colors.muted,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '',
                          stroke: colors.border,
                          strokeWidth: 1,
                        },
                      }}
                      style={{
                        borderRadius: 16,
                      }}
                      showValuesOnTopOfBars
                      fromZero
                    />
                  </ScrollView>
                </View>
              )}

              {/* Box Jump Progression */}
              {boxJumpChartData && boxJumpChartData.datasets[0].data.length > 0 && (
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    Box Jump Progression
                  </Text>
                  <Text className="text-sm text-muted mb-4">
                    Max Height: {Math.max(...boxJumpData.map(d => d.maxHeightInches))} inches
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={boxJumpChartData}
                      width={Math.max(screenWidth - 80, boxJumpChartData.labels.length * 60)}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix='"'
                      chartConfig={{
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                        labelColor: (opacity = 1) => colors.muted,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '',
                          stroke: colors.border,
                          strokeWidth: 1,
                        },
                      }}
                      style={{
                        borderRadius: 16,
                      }}
                      showValuesOnTopOfBars
                      fromZero
                    />
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
