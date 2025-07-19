import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getLanguageInfo, useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

const DropdownLanguageSelector = () => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));

  const currentLangInfo = getLanguageInfo(currentLanguage);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    {code :'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  ];

  const toggleDropdown = () => {
    if (isDropdownVisible) {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsDropdownVisible(false));
    } else {
      setIsDropdownVisible(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode);
    toggleDropdown();
  };

  const renderLanguageOption = (lang: { code: string; name: string; nativeName: string; flag: string }) => {
    const isSelected = lang.code === currentLanguage;
    
    return (
      <TouchableOpacity
        key={lang.code}
        onPress={() => handleLanguageSelect(lang.code)}
        className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
          isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{lang.flag}</Text>
          <View className="flex-1">
            <Text className={`text-base font-medium ${
              isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {lang.name}
            </Text>
            <Text className={`text-sm ${
              isSelected ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {lang.nativeName}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <View className="w-5 h-5 bg-green-600 dark:bg-green-500 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="relative">
      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={toggleDropdown}
        className="flex-row items-center justify-between bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 rounded-xl px-4 py-3 shadow-sm"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-xl mr-3">{currentLangInfo.flag}</Text>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {currentLanguage.toUpperCase()}
            </Text>
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {currentLangInfo.nativeName}
            </Text>
          </View>
        </View>
        
        <Animated.View
          style={{
            transform: [{
              rotate: dropdownAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            }],
          }}
        >
          <Text className="text-green-600 dark:text-green-400 text-lg font-bold">▼</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <View className="flex-1 justify-center items-center px-4">
            <Animated.View
              style={{
                opacity: dropdownAnimation,
                transform: [{
                  scale: dropdownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              }}
              className="w-full max-w-sm"
            >
              <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-200 dark:border-green-700 overflow-hidden">
                {/* Header */}
                <View className="bg-green-50 dark:bg-green-900/30 px-4 py-3 border-b border-green-200 dark:border-green-700">
                  <Text className="text-lg font-bold text-green-800 dark:text-green-200 text-center">
                    Select Language
                  </Text>
                </View>

                {/* Language Options */}
                <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
                  {languages.map(renderLanguageOption)}
                </ScrollView>

                {/* Footer */}
                <TouchableOpacity
                  onPress={toggleDropdown}
                  className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-gray-600 dark:text-gray-400 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DropdownLanguageSelector;
