import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { useContext } from 'react';
import { UserType } from '../UserContext';
const HomeScreen = () => {
  const { userId, setUserId } = useContext(UserType);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodeToken = jwt_decode(token);
      const userId = decodeToken.userId;
      setUserId(userId);
    };
    fetchUsers();
  }, []);
  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
