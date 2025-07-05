import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, X, Calendar as CalendarIcon, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { addSchedule, getSchedules, deleteSchedule } from '@/services/firestore';
import { Schedule } from '@/types';

export default function SchedulesScreen() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const schedulesData = await getSchedules();
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      await addSchedule({
        date: selectedDate,
        note: note.trim() || undefined,
        createdBy: user!.id,
        createdAt: new Date(),
      });
      
      setModalVisible(false);
      setNote('');
      setSelectedDate('');
      loadSchedules();
      Alert.alert('Success', 'Schedule created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchedule(scheduleId);
              loadSchedules();
              Alert.alert('Success', 'Schedule deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  const getMarkedDates = () => {
    const marked: any = {};
    schedules.forEach(schedule => {
      marked[schedule.date] = {
        marked: true,
        dotColor: '#667eea',
        selectedColor: '#667eea',
      };
    });
    
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#667eea',
      };
    }
    
    return marked;
  };

  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => schedule.date === date);
  };

  if (user?.role === 'tracking') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedules</Text>
          <Text style={styles.headerSubtitle}>View only access</Text>
        </View>
        
        <View style={styles.content}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: '#667eea',
              todayTextColor: '#667eea',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#667eea',
              selectedDotColor: '#ffffff',
              arrowColor: '#667eea',
              monthTextColor: '#2d4150',
              indicatorColor: '#667eea',
            }}
          />
          
          {selectedDate && (
            <View style={styles.scheduleList}>
              <Text style={styles.selectedDateTitle}>
                Schedules for {selectedDate}
              </Text>
              {getSchedulesForDate(selectedDate).map(schedule => (
                <View key={schedule.id} style={styles.scheduleItem}>
                  <CalendarIcon size={20} color="#667eea" />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleDate}>{schedule.date}</Text>
                    {schedule.note && (
                      <Text style={styles.scheduleNote}>{schedule.note}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedules</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            selectedDayBackgroundColor: '#667eea',
            todayTextColor: '#667eea',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#667eea',
            selectedDotColor: '#ffffff',
            arrowColor: '#667eea',
            monthTextColor: '#2d4150',
            indicatorColor: '#667eea',
          }}
        />

        {selectedDate && (
          <View style={styles.scheduleList}>
            <Text style={styles.selectedDateTitle}>
              Schedules for {selectedDate}
            </Text>
            {getSchedulesForDate(selectedDate).map(schedule => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <CalendarIcon size={20} color="#667eea" />
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleDate}>{schedule.date}</Text>
                  {schedule.note && (
                    <Text style={styles.scheduleNote}>{schedule.note}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSchedule(schedule.id)}
                >
                  <Trash2 size={18} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.allSchedules}>
          <Text style={styles.sectionTitle}>All Schedules</Text>
          {schedules.map(schedule => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <CalendarIcon size={20} color="#667eea" />
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleDate}>{schedule.date}</Text>
                {schedule.note && (
                  <Text style={styles.scheduleNote}>{schedule.note}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSchedule(schedule.id)}
              >
                <Trash2 size={18} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Schedule</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Selected Date:</Text>
              <Text style={styles.selectedDateText}>
                {selectedDate || 'Please select a date from calendar'}
              </Text>

              <Text style={styles.inputLabel}>Note (Optional):</Text>
              <TextInput
                style={styles.textInput}
                value={note}
                onChangeText={setNote}
                placeholder="Enter note for this schedule..."
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddSchedule}
                disabled={loading || !selectedDate}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Creating...' : 'Create Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  addButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scheduleList: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 10,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  scheduleNote: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
  },
  allSchedules: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 15,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});