import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleRegister = async () => {
    // Regular expression to validate email format
    const emailRegex = /\S+@\S+\.\S+/;

    // Check if email is in a valid format
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // Check if email is already registered
      const checkResponse = await axios.post('https://crud-in-reactnative.onrender.com/check-email', { email });
      if (checkResponse.data.exists) {
        Alert.alert('Email Already Registered', 'This email address is already registered.');
        return;
      }

      // If email is valid and not registered previously, proceed with registration
      const response = await axios.post('https://crud-in-reactnative.onrender.com/signup', { email, password });
      console.log(response.data); // You may handle the response as needed
      navigation.navigate('Login'); // Redirect to login after successful registration
    } catch (error) {
      console.error(error);
      // Handle error (e.g., display error message to the user)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      <Pressable onPress={handleLoginPress}>
        <Text style={styles.loginText}>Already have an account? Login here</Text>
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
  loginText: {
    marginTop: 20,
    color: '#007bff',
  },
});

export default RegisterScreen;
