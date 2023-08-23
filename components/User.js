import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const User = ({ item }) => {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginVertical: 6,
        }}
      >
        <Image
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            resizeMode: 'contain',
          }}
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/149/149071.png',
          }}
        />
        <Text style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>
          {item?.name}
        </Text>

        <Pressable
          style={{
            borderColor: '#d0d0d0',
            borderWidth: 1,
            padding: 10,
            marginLeft: 10,
            width: 100,
            borderRadius: 7,
          }}
        >
          <Text
            style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold' }}
          >
            Follow
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({});
