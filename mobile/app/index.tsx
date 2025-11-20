import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold text-primary-500">
        StudyMaster
      </Text>
      <Text className="text-lg text-neutral-600 mt-4">
        AI-Powered Flashcards
      </Text>
      <Text className="text-sm text-neutral-500 mt-2">
        Phase 1: Setup Complete ✅
      </Text>
    </View>
  );
}
