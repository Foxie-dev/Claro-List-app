
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Button } from 'react-native';

interface FolderItemProps {
  name: string;
  color: string;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ name, color, onPress, onEdit, onDelete }) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <TouchableOpacity onPress={onPress} style={styles.textContainer}>
        <Text style={styles.text}>{name}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={onEdit} />
        <Button title="Delete" onPress={onDelete} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default FolderItem;
