import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TaskItemProps {
  task: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{task}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, borderRadius: 5, backgroundColor: 'red', marginVertical: 5 },
  text: { color: 'black' },
});

export default TaskItem;
