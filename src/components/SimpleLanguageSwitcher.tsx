import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const SimpleLanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'hi', name: 'HI', flag: '🇮🇳' },
    { code: 'ml', name: 'ML', flag: '🇮🇳' },
    { code: 'te', name: 'TE', flag: '🇮🇳' },
    { code: 'ta', name: 'TA', flag: '🇮🇳' },
    { code: 'kn', name: 'KN', flag: '🇮🇳' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.activeLanguageButton
          ]}
          onPress={() => changeLanguage(lang.code)}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          <Text style={[
            styles.languageText,
            currentLanguage === lang.code && styles.activeLanguageText
          ]}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
  },
  flag: {
    fontSize: 16,
    marginRight: 4,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
  },
});

export default SimpleLanguageSwitcher;
