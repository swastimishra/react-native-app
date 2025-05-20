import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomePage = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    mobilenumber: '',
    age: ''
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    // Calculate total pages based on userDetails length
    const totalPagesCount = Math.ceil(userDetails.length / 5);
    setTotalPages(totalPagesCount);
  }, [userDetails]);

  const fetchUserDetails = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('https://crud-in-reactnative.onrender.com/show-details', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setUserDetails(response.data);
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddData = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        await axios.post('https://crud-in-reactnative.onrender.com/add-details', newUserData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // After successful addition, fetch user details again
        fetchUserDetails();
        setModalVisible(false);
        setNewUserData({
            name: '',
            email: '',
            mobilenumber: '',
            age: ''
        });
    } catch (error) {
        Alert.alert('Error', 'Failed to add new member. Please try again.');
        console.error('Error adding new member:', error);
    }
};


  const handleUpdateData = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        await axios.put(`https://crud-in-reactnative.onrender.com/modify-details/${selectedUserId}`, newUserData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // After successful update, fetch user details again
        fetchUserDetails();
        setModalVisible(false);
        setNewUserData({
            name: '',
            email: '',
            mobilenumber: '',
            age: ''
        });
    } catch (error) {
        Alert.alert('Error', 'Failed to update member details. Please try again.');
        console.error('Error updating member details:', error);
    }
};


  const handleDeleteData = async (userId) => {
    try {
        const token = await AsyncStorage.getItem('token');
        await axios.delete(`https://crud-in-reactnative.onrender.com/delete-details/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // After successful deletion, fetch user details again
        fetchUserDetails();
    } catch (error) {
        Alert.alert('Error', 'Failed to delete member. Please try again.');
        console.error('Error deleting member:', error);
    }
};


  const handleEdit = (user) => {
    setNewUserData(user);
    setSelectedUserId(user._id);
    setModalVisible(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate the start index and end index for slicing userDetails
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const displayedUsers = userDetails.slice(startIndex, endIndex);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRUD</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.centeredButton}>
            <Button title="Add Data" onPress={() => setModalVisible(true)} />
          </View>
          <View style={styles.logoutButton}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {displayedUsers.map((user, index) => (
          <View key={index} style={styles.userContainer}>
            <Text style={styles.userText}>Name: {user.name}</Text>
            <Text style={styles.userText}>Email: {user.email}</Text>
            <Text style={styles.userText}>Mobile Number: {user.mobilenumber}</Text>
            <Text style={styles.userText}>Age: {user.age}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(user)}>
                <Text style={styles.actionButton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteData(user._id)}>
                <Text style={styles.actionButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        <Button title="Prev" onPress={handlePrevPage} disabled={currentPage === 1} />
        <Text style={styles.pageNumber}>{currentPage} / {totalPages}</Text>
        <Button title="Next" onPress={handleNextPage} disabled={currentPage === totalPages} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedUserId(null);
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Member</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newUserData.name}
            onChangeText={(text) => setNewUserData({ ...newUserData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newUserData.email}
            onChangeText={(text) => setNewUserData({ ...newUserData, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={newUserData.mobilenumber}
            onChangeText={(text) => setNewUserData({ ...newUserData, mobilenumber: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={newUserData.age}
            onChangeText={(text) => setNewUserData({ ...newUserData, age: text })}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            {selectedUserId ? (
              <Button title="Update" onPress={handleUpdateData} />
            ) : (
              <Button title="Add" onPress={handleAddData} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  centeredButton: {
    flex: 1,
    alignItems: 'center',
  },
  logoutButton: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  userContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    color: 'blue',
    fontWeight: 'bold',
    marginRight: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pageNumber: {
    marginHorizontal: 10,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
});

export default HomePage;
