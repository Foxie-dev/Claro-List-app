import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const fileUri = FileSystem.documentDirectory + 'folders.json';

type TaskScreenRouteProp = RouteProp<RootStackParamList, 'Task'>;

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface TaskScreenProps {
  route: TaskScreenRouteProp;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ route }) => {
  const { folderName } = route.params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Initial state is false
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load tasks from file when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const storedData = JSON.parse(fileContent);
        const folderTasks =
          storedData.find((folder: { name: string }) => folder.name === folderName)?.tasks || [];
        setTasks(folderTasks);
      } catch (error) {
        console.log("File read error:", error);
      }
    };
    loadTasks();
  }, [folderName]);

  // Save updated tasks to the file
  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);
      const folderIndex = storedData.findIndex((folder: { name: string }) => folder.name === folderName);
      if (folderIndex !== -1) {
        storedData[folderIndex].tasks = updatedTasks;
      } else {
        storedData.push({ name: folderName, tasks: updatedTasks });
      }
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
    } catch (error) {
      console.log('File write error:', error);
    }
  };

  // Add a new task to the list
  const addTask = () => {
    if (newTaskName.trim() === '') {
      Alert.alert('Please enter a task name');
      return;
    }
    const newTask: Task = { id: Date.now().toString(), name: newTaskName, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskName('');
    setIsModalVisible(false);
    saveTasks(updatedTasks);
  };

  // Toggle the completion status of a task
  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Delete a task from the list
  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Open the modal to edit an existing task
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setNewTaskName(task.name);
    setIsEditModalVisible(true);
  };

  // Edit the selected task and save the changes
  const editTask = () => {
    if (newTaskName.trim() === '') {
      Alert.alert('Please enter a task name');
      return;
    }
    if (selectedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id ? { ...task, name: newTaskName } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setSelectedTask(null);
      setNewTaskName('');
      setIsEditModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{folderName} Tasks</Text>

      {/* Display list of tasks */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
              {item.completed && <Ionicons name="checkmark" size={28} color="white" />}
            </TouchableOpacity>
            <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>{item.name}</Text>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
              <Ionicons name="pencil" size={28} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
              <Ionicons name="trash" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.newTaskContainer}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.newTaskText}>Add New Task</Text>
      </View>

      {/* Modal to add a new task */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Task Name</Text>
            <TextInput
              placeholder="Task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={styles.input}
            />
            <TouchableOpacity onPress={addTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal to edit an existing task */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Task Name</Text>
            <TextInput
              placeholder="Task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={styles.input}
            />
            <TouchableOpacity onPress={editTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'left', marginVertical: 20 },
  newTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20, shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 4 },
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#000',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  newTaskText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
  taskContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, marginVertical: 6, borderRadius: 8, backgroundColor: '#fff',shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 4 },
    elevation: 2,},
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 12
  },
  checkboxCompleted: {
    backgroundColor: '#000'
  },
  taskText: {
    fontSize: 18,
    flex: 1,
    textAlign: 'left',
  },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  iconButton: { padding: 8 },
});

export default TaskScreen;
