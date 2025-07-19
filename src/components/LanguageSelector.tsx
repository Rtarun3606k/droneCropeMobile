import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLanguageInfo, useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

interface LanguageSelectorProps {
  style?: any;
  buttonStyle?: any;
  modalStyle?: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  buttonStyle,
  modalStyle,
}) => {
  const { currentLanguage, availableLanguages, changeLanguage, t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentLanguageInfo = getLanguageInfo(currentLanguage);

  const handleLanguageSelect = async (language: string) => {
    await changeLanguage(language);
    setIsModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: string }) => {
    const languageInfo = getLanguageInfo(item);
    const isSelected = item === currentLanguage;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageSelect(item)}
      >
        <Text style={styles.flagText}>{languageInfo.flag}</Text>
        <View style={styles.languageTextContainer}>
          <Text style={[styles.languageName, isSelected && styles.selectedText]}>
            {languageInfo.name}
          </Text>
          <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
            {languageInfo.nativeName}
          </Text>
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.selectorButton, buttonStyle]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.flagText}>{currentLanguageInfo.flag}</Text>
        <Text style={styles.languageButtonText}>
          {currentLanguageInfo.nativeName}
        </Text>
        <Text style={styles.arrowText}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={[styles.modalContent, modalStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.selectLanguage')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  arrowText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    width: width * 0.85,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  languageList: {
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedLanguageItem: {
    backgroundColor: '#e3f2fd',
  },
  languageTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedText: {
    color: '#1976d2',
  },
  checkmark: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
});

export default LanguageSelector;
