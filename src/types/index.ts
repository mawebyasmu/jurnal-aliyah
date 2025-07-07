export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  nip: string;
  department: string;
  subjects: string[];
  phone?: string;
  address?: string;
  joinDate?: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  profileImage?: string;
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
  email?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  birthDate?: string;
  gender: 'male' | 'female';
  profileImage?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  enrollmentDate: string;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  teachingLogId: string;
  status: 'present' | 'sick' | 'permission' | 'absent';
  arrivalTime?: string;
  notes?: string;
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'present' | 'late' | 'absent';
  notes?: string;
  deviceInfo?: {
    userAgent: string;
    ip: string;
  };
  validationResult?: {
    locationValid: boolean;
    timeValid: boolean;
    distance: number;
  };
}

export interface ClassSchedule {
  id: string;
  subject: string;
  class: string;
  time: string;
  day: string;
  room: string;
  teacherId?: string;
  duration?: number;
  type?: 'regular' | 'exam' | 'lab' | 'field';
}

export interface TeachingLog {
  id: string;
  userId: string;
  date: string;
  scheduleId: string;
  subject: string;
  class: string;
  classId: string;
  topic: string;
  materials: string;
  attendance: number;
  totalStudents: number;
  notes: string;
  homework?: string;
  createdAt: string;
  updatedAt?: string;
  studentAttendance?: StudentAttendance[];
  attendanceSummary?: {
    present: number;
    sick: number;
    permission: number;
    absent: number;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  objectives?: string[];
  assessment?: {
    type: string;
    description: string;
    score?: number;
  };
}

export interface Class {
  id: string;
  name: string;
  capacity: number;
  room: string;
  teacherId: string;
  subjects: string[];
  students: Student[];
  academicYear: string;
  grade: string;
  schedule: ClassSchedule[];
}

export interface LocationConfig {
  schoolLatitude: number;
  schoolLongitude: number;
  radiusMeters: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SystemAlert {
  id: string;
  type: 'maintenance' | 'security' | 'performance' | 'feature';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  startTime: string;
  endTime?: string;
  resolved: boolean;
  actions?: Array<{
    label: string;
    url: string;
    type: 'primary' | 'secondary';
  }>;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'stat' | 'list' | 'calendar';
  position: { x: number; y: number; w: number; h: number };
  config: any;
  permissions: string[];
  refreshInterval?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'attendance' | 'teaching' | 'performance' | 'custom';
  parameters: Array<{
    name: string;
    type: 'date' | 'select' | 'multiselect' | 'text';
    required: boolean;
    options?: string[];
  }>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  createdBy: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
  conditions?: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export interface SystemMetrics {
  timestamp: string;
  activeUsers: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  storageUsage: number;
  attendanceRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'scheduled';
  status: 'completed' | 'failed' | 'in_progress';
  checksum: string;
  description?: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'file' | 'database';
  enabled: boolean;
  config: any;
  lastSync?: string;
  status: 'active' | 'error' | 'disabled';
  errorMessage?: string;
}