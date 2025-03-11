
// Mock API service for MediVault
import { toast } from "sonner";

// Base API URL - would be replaced with actual backend URL in production
const API_BASE_URL = 'https://api.medivault.example.com';

// Mock JWT token storage
let authToken: string | null = localStorage.getItem('medivault_auth_token');

// Mock user session - initialize from localStorage if available
let currentUser: User | null = null;

// Initialize current user from localStorage if available
const initializeUserFromStorage = () => {
  const storedUser = localStorage.getItem('medivault_current_user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Clear invalid data
      localStorage.removeItem('medivault_current_user');
    }
  }
};

// Initialize user on load
initializeUserFromStorage();

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  phone?: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other';
  file_url: string;
  created_at: string;
  updated_at: string;
  extracted_text?: string;
  is_shared: boolean;
}

export interface QRCode {
  id: string;
  record_id: string;
  created_at: string;
  expires_at: string;
  accessed_by: string[];
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  reminders: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string;
  date: string;
  time: string;
  reason: string;
  location: string;
  notes?: string;
  reminder_set: boolean;
  created_at: string;
}

export interface EmergencyProfile {
  user_id: string;
  blood_group: string;
  allergies: string[];
  conditions: string[];
  emergency_contacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  medications: string[];
}

// Helper function for API requests
const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  data?: any
): Promise<any> => {
  // Simulate network request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, use localStorage data or mock data
  return mockApiResponse(endpoint, method, data);
};

// Mock API response function
const mockApiResponse = (endpoint: string, method: string, data?: any): any => {
  // Authentication endpoints
  if (endpoint.startsWith('/auth')) {
    return handleAuthEndpoints(endpoint, method, data);
  }
  
  // Health records endpoints
  if (endpoint.startsWith('/records')) {
    return handleRecordsEndpoints(endpoint, method, data);
  }
  
  // QR code endpoints
  if (endpoint.startsWith('/qr')) {
    return handleQREndpoints(endpoint, method, data);
  }
  
  // Medications endpoints
  if (endpoint.startsWith('/medications')) {
    return handleMedicationsEndpoints(endpoint, method, data);
  }
  
  // Appointments endpoints
  if (endpoint.startsWith('/appointments')) {
    return handleAppointmentsEndpoints(endpoint, method, data);
  }
  
  // Emergency profile endpoints
  if (endpoint.startsWith('/emergency')) {
    return handleEmergencyEndpoints(endpoint, method, data);
  }
  
  // Insights endpoints
  if (endpoint.startsWith('/insights')) {
    return handleInsightsEndpoints(endpoint, method, data);
  }
  
  throw new Error('Endpoint not found');
};

// Handler for authentication endpoints
const handleAuthEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Mock signup
  if (endpoint === '/auth/signup' && method === 'POST') {
    const { name, email, password, role } = data;
    
    // Check if email already exists in our "database"
    const users = JSON.parse(localStorage.getItem('medivault_users') || '[]');
    if (users.some((user: any) => user.email === email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: role || 'patient',
      created_at: new Date().toISOString()
    };
    
    // Add to our "database"
    users.push(newUser);
    localStorage.setItem('medivault_users', JSON.stringify(users));
    
    // Create mock token
    authToken = `mock_token_${newUser.id}`;
    localStorage.setItem('medivault_auth_token', authToken);
    
    // Store current user in localStorage for persistence
    currentUser = newUser;
    localStorage.setItem('medivault_current_user', JSON.stringify(newUser));
    
    return { user: newUser, token: authToken };
  }
  
  // Mock login
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = data;
    
    // Get users from our "database"
    const users = JSON.parse(localStorage.getItem('medivault_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real system, we would verify the password hash here
    // For mock purposes, we're just accepting any password
    
    // Create mock token
    authToken = `mock_token_${user.id}`;
    localStorage.setItem('medivault_auth_token', authToken);
    
    // Store current user in localStorage for persistence
    currentUser = user;
    localStorage.setItem('medivault_current_user', JSON.stringify(user));
    
    return { user, token: authToken };
  }
  
  // Mock 2FA verification
  if (endpoint === '/auth/verify-2fa' && method === 'POST') {
    const { code } = data;
    
    // For demo purposes, accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Get stored user from localStorage
      const storedUser = localStorage.getItem('medivault_current_user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
      
      return { verified: true };
    }
    
    throw new Error('Invalid verification code');
  }
  
  // Mock logout
  if (endpoint === '/auth/logout' && method === 'POST') {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('medivault_auth_token');
    localStorage.removeItem('medivault_current_user');
    return { success: true };
  }
  
  throw new Error('Auth endpoint not found');
};

// Handler for health records endpoints
const handleRecordsEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken || !currentUser) {
    console.error("Unauthorized: No auth token or current user", { authToken, currentUser });
    throw new Error('Unauthorized');
  }
  
  // Get records from our "database"
  const records = JSON.parse(localStorage.getItem('medivault_records') || '[]');
  
  // Get all records for the current user
  if (endpoint === '/records' && method === 'GET') {
    return records.filter((record: HealthRecord) => record.user_id === currentUser?.id);
  }
  
  // Get a specific record
  if (endpoint.match(/^\/records\/[\w-]+$/) && method === 'GET') {
    const recordId = endpoint.split('/').pop();
    const record = records.find((r: HealthRecord) => r.id === recordId);
    
    if (!record) throw new Error('Record not found');
    if (record.user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    return record;
  }
  
  // Upload a new record
  if (endpoint === '/records/upload' && method === 'POST') {
    const { title, description, category, file_url } = data;
    
    const newRecord: HealthRecord = {
      id: `record_${Date.now()}`,
      user_id: currentUser?.id || '',
      title,
      description,
      category,
      file_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_shared: false,
      // Mock OCR text extraction
      extracted_text: category === 'prescription' 
        ? 'PRESCRIPTION\nPatient: John Doe\nMedication: Amoxicillin\nDosage: 500mg\nFrequency: 3 times daily\nDoctor: Dr. Smith'
        : 'Sample extracted text from document'
    };
    
    records.push(newRecord);
    localStorage.setItem('medivault_records', JSON.stringify(records));
    
    return newRecord;
  }
  
  // Update a record
  if (endpoint.match(/^\/records\/[\w-]+$/) && method === 'PUT') {
    const recordId = endpoint.split('/').pop();
    const recordIndex = records.findIndex((r: HealthRecord) => r.id === recordId);
    
    if (recordIndex === -1) throw new Error('Record not found');
    if (records[recordIndex].user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    const { title, description, category } = data;
    
    // Update the record
    records[recordIndex] = {
      ...records[recordIndex],
      title: title || records[recordIndex].title,
      description: description || records[recordIndex].description,
      category: category || records[recordIndex].category,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('medivault_records', JSON.stringify(records));
    
    return records[recordIndex];
  }
  
  // Delete a record
  if (endpoint.match(/^\/records\/[\w-]+$/) && method === 'DELETE') {
    const recordId = endpoint.split('/').pop();
    const recordIndex = records.findIndex((r: HealthRecord) => r.id === recordId);
    
    if (recordIndex === -1) throw new Error('Record not found');
    if (records[recordIndex].user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    // Remove the record
    const deletedRecord = records.splice(recordIndex, 1)[0];
    localStorage.setItem('medivault_records', JSON.stringify(records));
    
    return { success: true, deleted: deletedRecord };
  }
  
  throw new Error('Records endpoint not found');
};

// Handler for QR code endpoints
const handleQREndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken) throw new Error('Unauthorized');
  
  // Get QR codes from our "database"
  const qrCodes = JSON.parse(localStorage.getItem('medivault_qrcodes') || '[]');
  
  // Generate a QR code for a record
  if (endpoint.match(/^\/qr\/generate\/[\w-]+$/) && method === 'GET') {
    const recordId = endpoint.split('/').pop();
    
    // Get records from our "database"
    const records = JSON.parse(localStorage.getItem('medivault_records') || '[]');
    const record = records.find((r: HealthRecord) => r.id === recordId);
    
    if (!record) throw new Error('Record not found');
    if (record.user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    // Create a new QR code
    const newQRCode: QRCode = {
      id: `qr_${Date.now()}`,
      record_id: recordId,
      created_at: new Date().toISOString(),
      // Expires in 24 hours
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      accessed_by: []
    };
    
    qrCodes.push(newQRCode);
    localStorage.setItem('medivault_qrcodes', JSON.stringify(qrCodes));
    
    return {
      qr_code: newQRCode,
      qr_url: `https://api.medivault.example.com/qr/access/${newQRCode.id}`
    };
  }
  
  // Access a record via QR code
  if (endpoint.match(/^\/qr\/access\/[\w-]+$/) && method === 'GET') {
    const qrCodeId = endpoint.split('/').pop();
    const qrCode = qrCodes.find((qr: QRCode) => qr.id === qrCodeId);
    
    if (!qrCode) throw new Error('QR code not found');
    
    // Check if QR code has expired
    if (new Date(qrCode.expires_at) < new Date()) {
      throw new Error('QR code has expired');
    }
    
    // Get the record linked to this QR code
    const records = JSON.parse(localStorage.getItem('medivault_records') || '[]');
    const record = records.find((r: HealthRecord) => r.id === qrCode.record_id);
    
    if (!record) throw new Error('Record not found');
    
    // Log access
    qrCode.accessed_by.push(currentUser?.id || 'anonymous');
    localStorage.setItem('medivault_qrcodes', JSON.stringify(qrCodes));
    
    return {
      record,
      access_log: {
        accessed_at: new Date().toISOString(),
        accessed_by: currentUser?.id || 'anonymous'
      }
    };
  }
  
  // Revoke QR code access
  if (endpoint.match(/^\/qr\/revoke\/[\w-]+$/) && method === 'POST') {
    const qrCodeId = endpoint.split('/').pop();
    const qrCodeIndex = qrCodes.findIndex((qr: QRCode) => qr.id === qrCodeId);
    
    if (qrCodeIndex === -1) throw new Error('QR code not found');
    
    // Get the record linked to this QR code
    const records = JSON.parse(localStorage.getItem('medivault_records') || '[]');
    const record = records.find((r: HealthRecord) => r.id === qrCodes[qrCodeIndex].record_id);
    
    if (!record) throw new Error('Record not found');
    if (record.user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    // Remove the QR code
    const deletedQRCode = qrCodes.splice(qrCodeIndex, 1)[0];
    localStorage.setItem('medivault_qrcodes', JSON.stringify(qrCodes));
    
    return { success: true, revoked: deletedQRCode };
  }
  
  throw new Error('QR code endpoint not found');
};

// Handler for medications endpoints
const handleMedicationsEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken) throw new Error('Unauthorized');
  
  // Get medications from our "database"
  const medications = JSON.parse(localStorage.getItem('medivault_medications') || '[]');
  
  // Add a new medication
  if (endpoint === '/medications/add' && method === 'POST') {
    const { name, dosage, frequency, start_date, end_date, notes, reminders } = data;
    
    const newMedication: Medication = {
      id: `med_${Date.now()}`,
      user_id: currentUser?.id || '',
      name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      reminders: reminders || false,
      created_at: new Date().toISOString()
    };
    
    medications.push(newMedication);
    localStorage.setItem('medivault_medications', JSON.stringify(medications));
    
    return newMedication;
  }
  
  // Get all medications for the current user
  if (endpoint === '/medications' && method === 'GET') {
    return medications.filter((med: Medication) => med.user_id === currentUser?.id);
  }
  
  // Delete a medication
  if (endpoint.match(/^\/medications\/[\w-]+$/) && method === 'DELETE') {
    const medicationId = endpoint.split('/').pop();
    const medicationIndex = medications.findIndex((m: Medication) => m.id === medicationId);
    
    if (medicationIndex === -1) throw new Error('Medication not found');
    if (medications[medicationIndex].user_id !== currentUser?.id) throw new Error('Unauthorized');
    
    // Remove the medication
    const deletedMedication = medications.splice(medicationIndex, 1)[0];
    localStorage.setItem('medivault_medications', JSON.stringify(medications));
    
    return { success: true, deleted: deletedMedication };
  }
  
  throw new Error('Medications endpoint not found');
};

// Handler for appointments endpoints
const handleAppointmentsEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken) throw new Error('Unauthorized');
  
  // Get appointments from our "database"
  const appointments = JSON.parse(localStorage.getItem('medivault_appointments') || '[]');
  
  // Create a new appointment
  if (endpoint === '/appointments/create' && method === 'POST') {
    const { doctor_name, date, time, reason, location, notes, reminder_set } = data;
    
    const newAppointment: Appointment = {
      id: `appt_${Date.now()}`,
      user_id: currentUser?.id || '',
      doctor_name,
      date,
      time,
      reason,
      location,
      notes,
      reminder_set: reminder_set || false,
      created_at: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    localStorage.setItem('medivault_appointments', JSON.stringify(appointments));
    
    return newAppointment;
  }
  
  // Get all appointments for the current user
  if (endpoint === '/appointments' && method === 'GET') {
    return appointments.filter((appt: Appointment) => appt.user_id === currentUser?.id);
  }
  
  // Google Calendar sync (mock)
  if (endpoint === '/appointments/google-sync' && method === 'POST') {
    return { success: true, message: 'Appointments synced with Google Calendar' };
  }
  
  throw new Error('Appointments endpoint not found');
};

// Handler for emergency profile endpoints
const handleEmergencyEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken) throw new Error('Unauthorized');
  
  // Get emergency profiles from our "database"
  const emergencyProfiles = JSON.parse(localStorage.getItem('medivault_emergency_profiles') || '[]');
  
  // Get emergency profile for the current user
  if (endpoint === '/emergency/profile' && method === 'GET') {
    const profile = emergencyProfiles.find((p: EmergencyProfile) => p.user_id === currentUser?.id);
    
    if (!profile) {
      // Return empty profile if none exists
      return {
        user_id: currentUser?.id || '',
        blood_group: '',
        allergies: [],
        conditions: [],
        emergency_contacts: [],
        medications: []
      };
    }
    
    return profile;
  }
  
  // Update emergency profile
  if (endpoint === '/emergency/update' && method === 'POST') {
    const { blood_group, allergies, conditions, emergency_contacts, medications } = data;
    
    const profileIndex = emergencyProfiles.findIndex(
      (p: EmergencyProfile) => p.user_id === currentUser?.id
    );
    
    if (profileIndex === -1) {
      // Create new profile
      const newProfile: EmergencyProfile = {
        user_id: currentUser?.id || '',
        blood_group,
        allergies,
        conditions,
        emergency_contacts,
        medications
      };
      
      emergencyProfiles.push(newProfile);
      localStorage.setItem('medivault_emergency_profiles', JSON.stringify(emergencyProfiles));
      
      return newProfile;
    } else {
      // Update existing profile
      emergencyProfiles[profileIndex] = {
        ...emergencyProfiles[profileIndex],
        blood_group: blood_group || emergencyProfiles[profileIndex].blood_group,
        allergies: allergies || emergencyProfiles[profileIndex].allergies,
        conditions: conditions || emergencyProfiles[profileIndex].conditions,
        emergency_contacts: emergency_contacts || emergencyProfiles[profileIndex].emergency_contacts,
        medications: medications || emergencyProfiles[profileIndex].medications
      };
      
      localStorage.setItem('medivault_emergency_profiles', JSON.stringify(emergencyProfiles));
      
      return emergencyProfiles[profileIndex];
    }
  }
  
  throw new Error('Emergency profile endpoint not found');
};

// Handler for insights endpoints
const handleInsightsEndpoints = (endpoint: string, method: string, data?: any): any => {
  // Ensure the user is authenticated
  if (!authToken) throw new Error('Unauthorized');
  
  // Get health trends
  if (endpoint === '/insights/health-trends' && method === 'GET') {
    // Mock data for health trends
    return {
      blood_pressure: [
        { date: '2023-01-01', systolic: 120, diastolic: 80 },
        { date: '2023-01-15', systolic: 118, diastolic: 78 },
        { date: '2023-02-01', systolic: 122, diastolic: 82 },
        { date: '2023-02-15', systolic: 121, diastolic: 79 },
        { date: '2023-03-01', systolic: 119, diastolic: 77 }
      ],
      blood_sugar: [
        { date: '2023-01-01', value: 95 },
        { date: '2023-01-15', value: 98 },
        { date: '2023-02-01', value: 102 },
        { date: '2023-02-15', value: 97 },
        { date: '2023-03-01', value: 94 }
      ],
      weight: [
        { date: '2023-01-01', value: 70 },
        { date: '2023-01-15', value: 69.5 },
        { date: '2023-02-01', value: 69 },
        { date: '2023-02-15', value: 68.5 },
        { date: '2023-03-01', value: 68 }
      ]
    };
  }
  
  throw new Error('Insights endpoint not found');
};

// Export API methods
export const api = {
  // Auth methods
  signup: async (userData: { name: string; email: string; password: string; role?: 'patient' | 'doctor' }) => {
    try {
      return await apiRequest('/auth/signup', 'POST', userData);
    } catch (error: any) {
      toast.error(`Signup failed: ${error.message}`);
      throw error;
    }
  },
  
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await apiRequest('/auth/login', 'POST', credentials);
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`);
      throw error;
    }
  },
  
  verify2FA: async (code: string) => {
    try {
      return await apiRequest('/auth/verify-2fa', 'POST', { code });
    } catch (error: any) {
      toast.error(`2FA verification failed: ${error.message}`);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      return await apiRequest('/auth/logout', 'POST');
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`);
      throw error;
    }
  },
  
  // Health records methods
  getRecords: async () => {
    try {
      // Check if user is authenticated before making request
      if (!authToken || !currentUser) {
        toast.error("You must be logged in to access records");
        throw new Error('Unauthorized');
      }
      
      return await apiRequest('/records', 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch records: ${error.message}`);
      throw error;
    }
  },
  
  getRecord: async (recordId: string) => {
    try {
      return await apiRequest(`/records/${recordId}`, 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch record: ${error.message}`);
      throw error;
    }
  },
  
  uploadRecord: async (recordData: {
    title: string;
    description: string;
    category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other';
    file_url: string;
  }) => {
    try {
      return await apiRequest('/records/upload', 'POST', recordData);
    } catch (error: any) {
      toast.error(`Failed to upload record: ${error.message}`);
      throw error;
    }
  },
  
  updateRecord: async (
    recordId: string,
    recordData: {
      title?: string;
      description?: string;
      category?: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other';
    }
  ) => {
    try {
      return await apiRequest(`/records/${recordId}`, 'PUT', recordData);
    } catch (error: any) {
      toast.error(`Failed to update record: ${error.message}`);
      throw error;
    }
  },
  
  deleteRecord: async (recordId: string) => {
    try {
      return await apiRequest(`/records/${recordId}`, 'DELETE');
    } catch (error: any) {
      toast.error(`Failed to delete record: ${error.message}`);
      throw error;
    }
  },
  
  // QR code methods
  generateQRCode: async (recordId: string) => {
    try {
      return await apiRequest(`/qr/generate/${recordId}`, 'GET');
    } catch (error: any) {
      toast.error(`Failed to generate QR code: ${error.message}`);
      throw error;
    }
  },
  
  accessViaQRCode: async (qrCodeId: string) => {
    try {
      return await apiRequest(`/qr/access/${qrCodeId}`, 'GET');
    } catch (error: any) {
      toast.error(`Failed to access record via QR code: ${error.message}`);
      throw error;
    }
  },
  
  revokeQRCode: async (qrCodeId: string) => {
    try {
      return await apiRequest(`/qr/revoke/${qrCodeId}`, 'POST');
    } catch (error: any) {
      toast.error(`Failed to revoke QR code: ${error.message}`);
      throw error;
    }
  },
  
  // Medication methods
  addMedication: async (medicationData: {
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    notes?: string;
    reminders?: boolean;
  }) => {
    try {
      return await apiRequest('/medications/add', 'POST', medicationData);
    } catch (error: any) {
      toast.error(`Failed to add medication: ${error.message}`);
      throw error;
    }
  },
  
  getMedications: async () => {
    try {
      return await apiRequest('/medications', 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch medications: ${error.message}`);
      throw error;
    }
  },
  
  deleteMedication: async (medicationId: string) => {
    try {
      return await apiRequest(`/medications/${medicationId}`, 'DELETE');
    } catch (error: any) {
      toast.error(`Failed to delete medication: ${error.message}`);
      throw error;
    }
  },
  
  // Appointment methods
  createAppointment: async (appointmentData: {
    doctor_name: string;
    date: string;
    time: string;
    reason: string;
    location: string;
    notes?: string;
    reminder_set?: boolean;
  }) => {
    try {
      return await apiRequest('/appointments/create', 'POST', appointmentData);
    } catch (error: any) {
      toast.error(`Failed to create appointment: ${error.message}`);
      throw error;
    }
  },
  
  getAppointments: async () => {
    try {
      return await apiRequest('/appointments', 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch appointments: ${error.message}`);
      throw error;
    }
  },
  
  syncWithGoogleCalendar: async () => {
    try {
      return await apiRequest('/appointments/google-sync', 'POST');
    } catch (error: any) {
      toast.error(`Failed to sync with Google Calendar: ${error.message}`);
      throw error;
    }
  },
  
  // Emergency profile methods
  getEmergencyProfile: async () => {
    try {
      return await apiRequest('/emergency/profile', 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch emergency profile: ${error.message}`);
      throw error;
    }
  },
  
  updateEmergencyProfile: async (profileData: {
    blood_group?: string;
    allergies?: string[];
    conditions?: string[];
    emergency_contacts?: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;
    medications?: string[];
  }) => {
    try {
      return await apiRequest('/emergency/update', 'POST', profileData);
    } catch (error: any) {
      toast.error(`Failed to update emergency profile: ${error.message}`);
      throw error;
    }
  },
  
  // Health insights methods
  getHealthTrends: async () => {
    try {
      return await apiRequest('/insights/health-trends', 'GET');
    } catch (error: any) {
      toast.error(`Failed to fetch health trends: ${error.message}`);
      throw error;
    }
  },
  
  // Current user
  getCurrentUser: () => {
    // If currentUser is null, try to get it from localStorage
    if (!currentUser) {
      initializeUserFromStorage();
    }
    return currentUser;
  },
  
  isAuthenticated: () => {
    return !!authToken && !!currentUser;
  }
};

// Initialize with some demo data if none exists
const initializeDemoData = () => {
  // Create a demo user if none exists
  if (!localStorage.getItem('medivault_users')) {
    const demoUsers = [
      {
        id: 'user_1',
        name: 'John Doe',
        email: 'demo@medivault.com',
        role: 'patient',
        created_at: new Date().toISOString()
      },
      {
        id: 'user_2',
        name: 'Dr. Smith',
        email: 'doctor@medivault.com',
        role: 'doctor',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('medivault_users', JSON.stringify(demoUsers));
  }
  
  // Create demo records if none exist
  if (!localStorage.getItem('medivault_records')) {
    const demoRecords = [
      {
        id: 'record_1',
        user_id: 'user_1',
        title: 'Annual Blood Test',
        description: 'Complete blood count and lipid panel',
        category: 'blood_test',
        file_url: '/placeholder.svg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        extracted_text: 'Blood Test Results\nHemoglobin: 14.2 g/dL\nWhite Blood Cell Count: 6500/µL\nCholesterol: 185 mg/dL\nLDL: 110 mg/dL\nHDL: 55 mg/dL',
        is_shared: false
      },
      {
        id: 'record_2',
        user_id: 'user_1',
        title: 'Chest X-Ray',
        description: 'Routine chest examination',
        category: 'xray_mri',
        file_url: '/placeholder.svg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        extracted_text: 'Chest X-Ray Report\nFindings: Normal lung fields. No evidence of consolidation or effusion. Heart size within normal limits.',
        is_shared: false
      }
    ];
    localStorage.setItem('medivault_records', JSON.stringify(demoRecords));
  }
  
  // Create demo medications if none exist
  if (!localStorage.getItem('medivault_medications')) {
    const demoMedications = [
      {
        id: 'med_1',
        user_id: 'user_1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        start_date: new Date().toISOString(),
        notes: 'Take in the morning with food',
        reminders: true,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('medivault_medications', JSON.stringify(demoMedications));
  }
  
  // Create demo appointments if none exist
  if (!localStorage.getItem('medivault_appointments')) {
    const demoAppointments = [
      {
        id: 'appt_1',
        user_id: 'user_1',
        doctor_name: 'Dr. Smith',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00 AM',
        reason: 'Annual checkup',
        location: 'City Medical Center',
        reminder_set: true,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('medivault_appointments', JSON.stringify(demoAppointments));
  }
  
  // Create demo emergency profile if none exists
  if (!localStorage.getItem('medivault_emergency_profiles')) {
    const demoProfiles = [
      {
        user_id: 'user_1',
        blood_group: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Hypertension'],
        emergency_contacts: [
          {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1-555-123-4567'
          }
        ],
        medications: ['Lisinopril 10mg']
      }
    ];
    localStorage.setItem('medivault_emergency_profiles', JSON.stringify(demoProfiles));
  }
};

// Initialize demo data
initializeDemoData();

export default api;
