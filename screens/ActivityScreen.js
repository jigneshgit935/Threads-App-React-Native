import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { useState } from 'react';
import { useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { UserType } from '../UserContext';
import User from '../components/User';

const ActivityScreen = () => {
  const [selectedButton, setSelectedButton] = useState('people');
  const [content, setContent] = useState('People Content');
  const [users, setUsers] = useState([]);
  const { userId, setUserId } = useContext(UserType);

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodeToken = jwt_decode(token);
      const userId = decodeToken.userId;
      setUserId(userId);

      axios
        .get(`http://locahost:3000/user/${userId}`)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.log('Error', error);
        });
    };
    fetchUsers();
  }, []);

  console.log('users', users);
  return (
    <ScrollView style={{ marginTop: 50 }}>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Activity</Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => handleButtonClick('people')}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'white',
                borderColor: '#d0d0d0',
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === 'people' ? { backgroundColor: 'black' } : null,
            ]}
          >
            <Text
              style={[
                { textAlign: 'center', fontWeight: 'bold' },
                selectedButton === 'people'
                  ? { color: 'white' }
                  : { color: 'black' },
              ]}
            >
              People
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleButtonClick('all')}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'white',
                borderColor: '#d0d0d0',
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === 'all' ? { backgroundColor: 'black' } : null,
            ]}
          >
            <Text
              style={[
                { textAlign: 'center', fontWeight: 'bold' },
                selectedButton === 'all'
                  ? { color: 'white' }
                  : { color: 'black' },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleButtonClick('request')}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'white',
                borderColor: '#d0d0d0',
                borderRadius: 6,
                borderWidth: 0.7,
              },
              selectedButton === 'request'
                ? { backgroundColor: 'black' }
                : null,
            ]}
          >
            <Text
              style={[
                { textAlign: 'center', fontWeight: 'bold' },
                selectedButton === 'request'
                  ? { color: 'white' }
                  : { color: 'black' },
              ]}
            >
              Request
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {selectedButton === 'people' && (
            <View style={{ marginTop: 20 }}>
              {users?.map((item, index) => (
                <User key={index} item={item} />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({});
