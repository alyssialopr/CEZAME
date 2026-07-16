import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CATEGORIES } from '@/constants/categories';

type CategoryContextType = {
  activeCategory: Category;
  setActiveCategoryId: (id: string) => Promise<void>;
  isInitialized: boolean;
};

// Default to finance if nothing else is set
const defaultCategory = CATEGORIES.find(c => c.id === 'finance') || CATEGORIES[1];

const CategoryContext = createContext<CategoryContextType>({
  activeCategory: defaultCategory,
  setActiveCategoryId: async () => {},
  isInitialized: false,
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [activeCategoryId, setActiveCategoryState] = useState<string>(defaultCategory.id);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('@active_category').then(stored => {
      if (stored && CATEGORIES.some(c => c.id === stored)) {
        setActiveCategoryState(stored);
      }
      setIsInitialized(true);
    });
  }, []);

  const setActiveCategoryId = async (id: string) => {
    setActiveCategoryState(id);
    await AsyncStorage.setItem('@active_category', id);
  };

  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId) || defaultCategory;

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategoryId, isInitialized }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useActiveCategory = () => useContext(CategoryContext);
