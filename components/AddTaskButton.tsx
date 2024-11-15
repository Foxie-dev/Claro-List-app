import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AddTaskButtonProps {
  onPress: () => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Add Task</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { padding: 10, backgroundColor: '#3498db', borderRadius: 5 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

export default AddTaskButton;
