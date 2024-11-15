import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Dimensions,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Folder and Task interface definitions for type safety
interface Folder {
  id: string;
  name: string;
  tasks: Task[];
}
interface Task {
  id: string;
  name: string;
  completed: boolean;
}
// Navigation types for screen transitions
type RootStackParamList = {
  Task: { folderName: string };
  Home: undefined;
};
// File path for storing folders data
const fileUri = FileSystem.documentDirectory + "folders.json";
const HomeScreen: React.FC = () => {
  // Navigation hook for navigating between screens
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // State to store folders list
  const [folders, setFolders] = useState<Folder[]>([]);
  // State for folder name input
  const [folderNameInput, setFolderNameInput] = useState<string>("");
  // State for folder modal visibility
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  // State for task modal visibility
  const [isTaskModalVisible, setIsTaskModalVisible] = useState<boolean>(false);
  // State to keep track of the selected folder for editing or task adding
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  // State for new task name input
  const [newTaskName, setNewTaskName] = useState<string>("");
  // Load folders data from file storage when the component mounts
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const savedFolders = JSON.parse(fileContent) as Folder[];
        setFolders(savedFolders); // Update state with saved folders
      } catch (error) {
        console.log("File read error or file does not exist:", error);

        const newFolder1: Folder = {
          id: Date.now().toString(),
          name: "Not Important",
          tasks: [],
        };
        const newFolder2: Folder = {
          id: Date.now().toString(),
          name: "Important",
          tasks: [],
        };
        const newFolder3: Folder = {
          id: Date.now().toString(),
          name: "Not Urgent",
          tasks: [],
        };
        const newFolder4: Folder = {
          id: Date.now().toString(),
          name: "Urgent",
          tasks: [],
        };

        const updatedFolders = [newFolder1, newFolder2, newFolder3, newFolder4];

        setFolders(updatedFolders);
        saveFolders(updatedFolders);
      }
    };
    loadFolders();
  }, []);
  // Save folders data to file storage
  const saveFolders = async (foldersToSave: Folder[]) => {
    try {
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(foldersToSave)
      );
    } catch (error) {
      console.log("File write error:", error);
    }
  };
  // Function to add or edit a folder
  const addOrEditFolder = () => {
    if (folderNameInput.trim() === "") {
      Alert.alert("Please enter a folder name"); // Alert if input is empty
      return;
    }
    if (selectedFolder) {
      // Update the folder if it already exists
      const updatedFolders = folders.map((folder) =>
        folder.id === selectedFolder.id
          ? { ...folder, name: folderNameInput }
          : folder
      );
      setFolders(updatedFolders);
      saveFolders(updatedFolders);
    } else {
      // Create a new folder if it doesn't exist
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: folderNameInput,
        tasks: [],
      };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      saveFolders(updatedFolders);
    }
    // Reset input and close modal
    setFolderNameInput("");
    setSelectedFolder(null);
    setIsModalVisible(false);
  };
  // Function to delete a folder by its ID
  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders); // Save updated folder list after deletion
  };
  // Navigate to the Task screen for a specific folder
  const openFolder = (folderName: string) => {
    navigation.navigate("Task", { folderName });
  };
  // Open edit modal with the selected folder's name
  const openEditModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setFolderNameInput(folder.name);
    setIsModalVisible(true);
  };
  // Add a task to the currently selected folder
  const addTaskToSelectedFolder = () => {
    if (!selectedFolder || newTaskName.trim() === "") {
      Alert.alert("Please enter a task name"); // Alert if task name is empty
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      name: newTaskName,
      completed: false,
    };
    const updatedFolders = folders.map((folder) =>
      folder.id === selectedFolder.id
        ? { ...folder, tasks: [...folder.tasks, newTask] }
        : folder
    );
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
    setNewTaskName("");
    setSelectedFolder(null);
    setIsTaskModalVisible(false); // Close modal after adding the task
  };
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      {/* List of folders displayed as a grid */}

      <View style={{ flexDirection: "row" }}>
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.folderContainer,
                { backgroundColor: getStableColor(index) },
              ]}
            >
              {/* Navigate to Task screen when folder name is clicked */}
              <TouchableOpacity
                onPress={() => openFolder(item.name)}
                style={{ flex: 1 }}
              >
                <Text style={styles.folderText}>{item.name}</Text>
              </TouchableOpacity>

              {/* Först vill vi sätta in dessa 3 knapparna i en view på en rad */}

              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {/* Edit button on the top right, now we change to the bottom right */}

                <TouchableOpacity
                  style={[styles.iconButton, styles.dotsButton]}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>

                {/* Add Task Button */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.plusButton]}
                  onPress={() => {
                    setSelectedFolder(item); // Set selected folder for adding task
                    setIsTaskModalVisible(true); // Open modal to add task
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>

                {/* Delete Folder Button */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.deleteButton]}
                  onPress={() => deleteFolder(item.id)}
                >
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>

      {/* Add New Folder section at the bottom */}
      <View style={styles.newFolderContainer}>
        <TouchableOpacity
          onPress={() => {
            setIsModalVisible(true);
            setSelectedFolder(null);
          }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.newFolderText}>New Folder</Text>
      </View>
      {/* Modal for adding a new task */}
      <Modal
        visible={isTaskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Add Task to {selectedFolder?.name}
            </Text>
            <TextInput
              placeholder="Task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={addTaskToSelectedFolder}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsTaskModalVisible(false);
                setNewTaskName("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal for editing folder name */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedFolder ? "Change Folder Name" : "Enter Folder Name"}
            </Text>
            <TextInput
              placeholder="Folder name"
              value={folderNameInput}
              onChangeText={setFolderNameInput}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={addOrEditFolder}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {selectedFolder ? "Save Changes" : "Add Folder"}
              </Text>
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
    </View>
  );
};
// Function to provide stable colors to folders based on their index
const getStableColor = (index: number) => {
  const colors = [
    "#FFD700",
    "#E41515",
    "#000000",
    "#0B45A7",
    "#04560E",
    "#FF4500",
    "#4B0082",
    "#DC143C",
    "#4682B4",
  ];
  return colors[index % colors.length];
};
// Define styles for components in the screen
const windowWidth = Dimensions.get("window").width;
const folderSize = (windowWidth - 80) / 2;
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderRadius: 8,
    width: "100%",
  },
  newFolderContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: "#000",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  newFolderText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  folderContainer: {
    width: folderSize,
    height: folderSize * 1.2,
    padding: 15,
    borderRadius: 20,
    margin: 10,
    alignItems: "flex-start",
    position: "relative",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#000",
  },
  folderText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    alignSelf: "flex-start",
    position: "absolute",
    top: 0,
    left: 0,
  },

  dotsButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {},
  deleteButton: {},
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  },
});
export default HomeScreen;
