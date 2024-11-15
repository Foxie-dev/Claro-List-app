import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';

// Path to the JSON file where folder data is stored
const fileUri = FileSystem.documentDirectory + 'folders.json';

// Define Task interface for TypeScript (each task has an id, name, completion status, and belongs to a folder)
interface Task {
  id: string;
  name: string;
  completed: boolean;
  folderId: string;
}

export default function AllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]); // State to store all tasks

  // Function to load tasks from the file
  const loadTasks = async () => {
    try {
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);

      // Combine all tasks from each folder into a single array with folder reference
      const allTasks = storedData.reduce((acc: Task[], folder: any) => {
        const folderTasks = (folder.tasks || []).map((task: any) => ({
          ...task,
          folderId: folder.id, // Add folder ID to each task
        }));
        return acc.concat(folderTasks);
      }, []);

      setTasks(allTasks);
    } catch (error) {
      console.log('File read error:', error);
    }
  };

  // Reload tasks whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  // Function to toggle task completion status
  const toggleTaskCompletion = async (taskId: string, folderId: string) => {
    // Update completion status in tasks state
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    // Update task completion status in the file
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);
      const folderIndex = storedData.findIndex((folder: any) => folder.id === folderId);

      if (folderIndex !== -1) {
        // Find and toggle completion status for the task in the file data
        const folderTasks = storedData[folderIndex].tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        storedData[folderIndex].tasks = folderTasks;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
      }
    } catch (error) {
      console.log('Error updating task completion:', error);
    }
  };

  // Function to delete a task
  const deleteTask = (taskId: string, folderId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Update tasks state by removing the specified task
          const updatedTasks = tasks.filter(task => task.id !== taskId);
          setTasks(updatedTasks);

          // Delete the task in the file by folder
          try {
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const storedData = JSON.parse(fileContent);
            const folderIndex = storedData.findIndex((folder: any) => folder.id === folderId);
            if (folderIndex !== -1) {
              const folderTasks = storedData[folderIndex].tasks.filter((task: any) => task.id !== taskId);
              storedData[folderIndex].tasks = folderTasks;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
            }
          } catch (error) {
            console.log('Error deleting task:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>All Tasks</ThemedText>

        {/* Show message if no tasks are found, otherwise show task list */}
        {tasks.length === 0 ? (
          <ThemedText style={styles.noTasksText}>No tasks found</ThemedText>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskContainer}>
                {/* Checkbox to toggle task completion */}
                <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.folderId)} style={[styles.checkbox, item.completed && styles.completedCheckbox]}>
                  {item.completed && <Ionicons name="checkmark" size={28} color="white" />}
                </TouchableOpacity>
                
                {/* Task name, styled to show as completed if necessary */}
                <ThemedText style={[styles.taskText, item.completed && styles.completedTaskText]}>
                  {item.name}
                </ThemedText>

                {/* Button to delete task */}
                <TouchableOpacity onPress={() => deleteTask(item.id, item.folderId)} style={styles.iconButton}>
                  <Ionicons name="trash" size={28} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 20,
    color: '#000',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 4 },
    elevation: 2,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  completedCheckbox: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  iconButton: {
    padding: 8,
  },
  noTasksText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    padding: 10,
  },
});
