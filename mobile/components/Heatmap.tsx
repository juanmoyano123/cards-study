/**
 * Heatmap Component - GitHub-style contribution calendar
 * Shows daily study activity over the last 90 days
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../constants';

interface HeatmapDay {
  date: string;
  count: number;
}

interface HeatmapProps {
  data: HeatmapDay[];
  onDayPress?: (day: HeatmapDay) => void;
}

// Color intensity levels (similar to GitHub)
const getColorForCount = (count: number): string => {
  if (count === 0) return colors.neutral[100];
  if (count <= 5) return colors.success[200];
  if (count <= 15) return colors.success[400];
  if (count <= 30) return colors.success[600];
  return colors.success[700];
};

// Format date to day of week (M, T, W, T, F, S, S)
const getDayOfWeek = (date: Date): number => {
  return date.getDay(); // 0 = Sunday, 6 = Saturday
};

// Get week number within the displayed range
const getWeekNumber = (date: Date, startDate: Date): number => {
  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

export const Heatmap: React.FC<HeatmapProps> = ({ data, onDayPress }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="body" color="secondary" align="center">
          No activity data yet. Start studying to see your progress!
        </Text>
      </View>
    );
  }

  // Parse dates and organize by week/day
  const parsedData = data.map((day) => ({
    ...day,
    dateObj: new Date(day.date),
  }));

  const startDate = parsedData[0].dateObj;
  const endDate = parsedData[parsedData.length - 1].dateObj;

  // Calculate number of weeks to display (13 weeks for ~90 days)
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const weeks = Math.min(totalWeeks, 13); // Cap at 13 weeks

  // Create 2D array: [week][day]
  const grid: (HeatmapDay & { dateObj: Date })[][] = Array.from({ length: weeks }, () => []);

  parsedData.forEach((day) => {
    const weekIndex = getWeekNumber(day.dateObj, startDate);
    const dayIndex = getDayOfWeek(day.dateObj);

    if (weekIndex >= 0 && weekIndex < weeks) {
      if (!grid[weekIndex][dayIndex]) {
        grid[weekIndex][dayIndex] = day;
      }
    }
  });

  // Month labels
  const monthLabels: string[] = [];
  let currentMonth = '';

  for (let week = 0; week < weeks; week++) {
    const firstDay = grid[week].find((d) => d !== undefined);
    if (firstDay) {
      const monthName = firstDay.dateObj.toLocaleString('default', { month: 'short' });
      if (monthName !== currentMonth) {
        monthLabels[week] = monthName;
        currentMonth = monthName;
      } else {
        monthLabels[week] = '';
      }
    } else {
      monthLabels[week] = '';
    }
  }

  // Day labels (M, W, F only to save space)
  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="label" style={styles.title}>
          Activity
        </Text>
        <View style={styles.legend}>
          <Text variant="caption" color="secondary" style={styles.legendLabel}>
            Less
          </Text>
          <View style={[styles.legendBox, { backgroundColor: colors.neutral[100] }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.success[200] }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.success[400] }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.success[600] }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.success[700] }]} />
          <Text variant="caption" color="secondary" style={styles.legendLabel}>
            More
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.heatmapContainer}>
          {/* Month labels */}
          <View style={styles.monthLabels}>
            <View style={{ width: 20 }} />
            {monthLabels.map((label, index) => (
              <Text
                key={index}
                variant="caption"
                color="secondary"
                style={[styles.monthLabel, { width: 12 }] as any}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {/* Day labels */}
            <View style={styles.dayLabels}>
              {dayLabels.map((label, index) => (
                <Text key={index} variant="caption" color="secondary" style={styles.dayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Heatmap grid */}
            {grid.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week[dayIndex];
                  const color = day ? getColorForCount(day.count) : colors.neutral[100];

                  return (
                    <Pressable
                      key={dayIndex}
                      style={[styles.day, { backgroundColor: color }]}
                      onPress={() => {
                        if (day && onDayPress) {
                          onDayPress(day);
                        }
                      }}
                      disabled={!day}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[4],
  },
  title: {
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  legendLabel: {
    fontSize: 10,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  scrollView: {
    marginHorizontal: spacing[4],
  },
  heatmapContainer: {
    flexDirection: 'column',
  },
  monthLabels: {
    flexDirection: 'row',
    marginBottom: spacing[1],
  },
  monthLabel: {
    fontSize: 10,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
  },
  dayLabels: {
    flexDirection: 'column',
    marginRight: spacing[1],
    justifyContent: 'space-around',
  },
  dayLabel: {
    height: 12,
    fontSize: 9,
    textAlign: 'right',
    width: 15,
  },
  week: {
    flexDirection: 'column',
    gap: 3,
    marginRight: 3,
  },
  day: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
