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

  // Simple React Native bar chart component (works in Expo Go)
  const SimpleBarChart = ({ data, labels, yAxisSuffix }: any) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data);
    const chartHeight = 200;

    return (
      <View className="gap-4">
        {/* Chart area */}
        <View
          className="flex-row items-flex-end justify-center gap-2 p-4 bg-surface rounded-lg border border-border"
          style={{ height: chartHeight + 60 }}
        >
          {data.map((value: number, i: number) => {
            const barHeight = (value / maxValue) * chartHeight;
            return (
              <View key={`bar-${i}`} className="items-center gap-1 flex-1">
                {/* Bar */}
                <View
                  className="w-full bg-primary rounded-t"
                  style={{
                    height: barHeight,
                    minHeight: 5,
                  }}
                />
                {/* Value label */}
                <Text className="text-xs font-bold text-foreground">
                  {value.toFixed(1)}
                </Text>
                {/* Session label */}
                <Text className="text-xs text-muted">
                  {labels[i]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="flex-row justify-between px-4">
          <Text className="text-xs text-muted">Min: {Math.min(...data).toFixed(1)}</Text>
          <Text className="text-xs text-muted">Max: {Math.max(...data).toFixed(1)}</Text>
        </View>
      </View>
    );
  };

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
                  <SimpleBarChart
                    data={chartData.datasets[0].data}
                    labels={chartData.labels}
                    yAxisLabel=""
                    yAxisSuffix=" kg"
                  />
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
                  <SimpleBarChart
                    data={boxJumpChartData.datasets[0].data}
                    labels={boxJumpChartData.labels}
                    yAxisLabel=""
                    yAxisSuffix='" '
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
