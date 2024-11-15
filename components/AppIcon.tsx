import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const AppIcon: React.FC = () => {
  return (
    <View style={styles.iconContainer}>
      <Image 
        source={require('../assets/images/todo-icon.png')}        // İkonun dosya yolunu güncelleyin
        style={styles.iconStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconStyle: {
    width: 80, // İkonun genişliğini ayarlayın
    height: 80, // İkonun yüksekliğini ayarlayın
  },
});

export default AppIcon;
