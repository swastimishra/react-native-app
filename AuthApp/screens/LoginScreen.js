import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable, Alert } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleLogin = async () => {
    try {
        handleCheckEmail()
      const response = await axios.post('https://crud-in-reactnative.onrender.com/signin', { email, password });
      console.log(response.data); // You may handle the response as needed
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      // Handle error (e.g., display error message to the user)
    }
  };

  const handleCheckEmail = async () => {
    try {
      // Check if email is already registered
      const checkResponse = await axios.post('https://crud-in-reactnative.onrender.com/check-email', { email });
      if (checkResponse.data.exists) {
        
      } else {
        Alert.alert('Email Not Registered', 'please register.');
      }
    } catch (error) {
      console.error(error);
      // Handle error (e.g., display error message to the user)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Pressable onPress={handleRegisterPress}>
        <Text style={styles.registerText}>Not registered yet? Register here</Text>
      </Pressable>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  registerText: {
    marginTop: 20,
    color: '#007bff',
  },
});

export default LoginScreen;
