import { User, AttendanceRecord, TeachingLog, ClassSchedule, Student, StudentAttendance, Class } from '../types';

export interface SystemSettings {
  attendance: {
    maxDistance: number;
    timeWindow: { start: string; end: string };
    lateThreshold: string;
    preventMultipleCheckin: boolean;
    geofencing: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
  school: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    mission: string;
    vision: string;
    academicYear: string;
    branches: Array<{
      id: string;
      name: string;
      address: string;
    }>;
  };
  schedule: {
    schoolHours: { start: string; end: string };
    breakPeriods: Array<{
      id: string;
      name: string;
      start: string;
      end: string;
    }>;
    holidays: Array<{
      id: string;
      name: string;
      date: string;
      type: 'holiday' | 'event' | 'exam';
    }>;
  };
  system: {
    backupFrequency: string;
    dataRetention: number;
    mobileAppEnabled: boolean;
    twoFactorAuth: boolean;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

class DataService {
  private static instance: DataService;
  private listeners: Map<string, Function[]> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Event system for real-time updates
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Cache management
  private setCache(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Settings Management
  getSettings(): SystemSettings {
    const cached = this.getCache('settings');
    if (cached) return cached;

    const settings = localStorage.getItem('systemSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.setCache('settings', parsed);
      return parsed;
    }
    
    // Default settings
    const defaultSettings: SystemSettings = {
      attendance: {
        maxDistance: 500,
        timeWindow: { start: '06:30', end: '07:30' },
        lateThreshold: '07:15',
        preventMultipleCheckin: true,
        geofencing: {
          latitude: -6.2088,
          longitude: 106.8456,
          radius: 500
        }
      },
      school: {
        name: 'SMA Negeri 1 Jakarta',
        logo: '',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        phone: '021-12345678',
        email: 'info@sman1jakarta.sch.id',
        mission: 'Mencerdaskan kehidupan bangsa melalui pendidikan berkualitas',
        vision: 'Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter',
        academicYear: '2024/2025',
        branches: []
      },
      schedule: {
        schoolHours: { start: '07:00', end: '15:30' },
        breakPeriods: [
          { id: '1', name: 'Istirahat 1', start: '09:30', end: '09:45' },
          { id: '2', name: 'Istirahat 2', start: '12:00', end: '12:30' }
        ],
        holidays: []
      },
      system: {
        backupFrequency: 'daily',
        dataRetention: 365,
        mobileAppEnabled: true,
        twoFactorAuth: false
      }
    };
    
    this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    this.setCache('settings', settings);
    this.emit('settingsUpdated', settings);
    this.auditLog('UPDATE', 'settings', 'System settings updated', settings);
  }

  // User Management with Enhanced Features
  getUsers(): User[] {
    const cached = this.getCache('users');
    if (cached) return cached;

    const users = localStorage.getItem('users');
    if (users) {
      const parsed = JSON.parse(users);
      this.setCache('users', parsed);
      return parsed;
    }
    
    // Default users with enhanced data
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Dr. Sarah Wijaya',
        email: 'sarah.wijaya@sekolah.sch.id',
        role: 'teacher',
        nip: '196505121990032001',
        department: 'Matematika',
        subjects: ['Matematika', 'Statistika'],
        phone: '081234567890',
        address: 'Jl. Pendidikan No. 45, Jakarta',
        joinDate: '2020-01-15',
        status: 'active'
      },
      {
        id: '2',
        name: 'Ahmad Fauzi, M.Pd',
        email: 'ahmad.fauzi@sekolah.sch.id',
        role: 'admin',
        nip: '197203151998021001',
        department: 'Administrasi',
        subjects: [],
        phone: '081234567891',
        address: 'Jl. Admin No. 12, Jakarta',
        joinDate: '2019-08-01',
        status: 'active'
      },
      {
        id: '3',
        name: 'Prof. Budi Santoso',
        email: 'budi.santoso@sekolah.sch.id',
        role: 'teacher',
        nip: '197801151999031002',
        department: 'Fisika',
        subjects: ['Fisika', 'Kimia'],
        phone: '081234567892',
        address: 'Jl. Sains No. 78, Jakarta',
        joinDate: '2018-03-10',
        status: 'active'
      },
      {
        id: '4',
        name: 'Dra. Siti Nurhaliza',
        email: 'siti.nurhaliza@sekolah.sch.id',
        role: 'teacher',
        nip: '198205101998032001',
        department: 'Bahasa Indonesia',
        subjects: ['Bahasa Indonesia', 'Sastra'],
        phone: '081234567893',
        address: 'Jl. Bahasa No. 23, Jakarta',
        joinDate: '2021-07-20',
        status: 'active'
      }
    ];
    
    this.saveUsers(defaultUsers);
    return defaultUsers;
  }

  saveUsers(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
    this.setCache('users', users);
    this.emit('usersUpdated', users);
  }

  addUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    users.push(newUser);
    this.saveUsers(users);
    this.auditLog('CREATE', 'user', `User created: ${newUser.name}`, newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    const oldUser = { ...users[index] };
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    this.auditLog('UPDATE', 'user', `User updated: ${users[index].name}`, { old: oldUser, new: users[index] });
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    this.saveUsers(users);
    this.auditLog('DELETE', 'user', `User deleted: ${deletedUser.name}`, deletedUser);
    return true;
  }

  // Student Management
  getStudents(): Student[] {
    const cached = this.getCache('students');
    if (cached) return cached;

    const students = localStorage.getItem('students');
    if (students) {
      const parsed = JSON.parse(students);
      this.setCache('students', parsed);
      return parsed;
    }
    
    const defaultStudents: Student[] = [
      {
        id: '1',
        name: 'Ahmad Rizki Pratama',
        nis: '2024001',
        classId: '1',
        email: 'ahmad.rizki@student.sch.id',
        phone: '081234567801',
        parentName: 'Budi Pratama',
        parentPhone: '081234567802',
        birthDate: '2007-03-15',
        gender: 'male',
        status: 'active',
        enrollmentDate: '2024-07-15'
      },
      {
        id: '2',
        name: 'Siti Nurhaliza Putri',
        nis: '2024002',
        classId: '1',
        email: 'siti.nurhaliza@student.sch.id',
        phone: '081234567803',
        parentName: 'Hasan Putri',
        parentPhone: '081234567804',
        birthDate: '2007-05-20',
        gender: 'female',
        status: 'active',
        enrollmentDate: '2024-07-15'
      },
      {
        id: '3',
        name: 'Muhammad Fajar Sidiq',
        nis: '2024003',
        classId: '1',
        email: 'fajar.sidiq@student.sch.id',
        phone: '081234567805',
        parentName: 'Sidiq Rahman',
        parentPhone: '081234567806',
        birthDate: '2007-01-10',
        gender: 'male',
        status: 'active',
        enrollmentDate: '2024-07-15'
      },
      {
        id: '4',
        name: 'Dewi Sartika Maharani',
        nis: '2024004',
        classId: '1',
        email: 'dewi.sartika@student.sch.id',
        phone: '081234567807',
        parentName: 'Maharani Dewi',
        parentPhone: '081234567808',
        birthDate: '2007-08-25',
        gender: 'female',
        status: 'active',
        enrollmentDate: '2024-07-15'
      },
      {
        id: '5',
        name: 'Andi Kurniawan',
        nis: '2024005',
        classId: '1',
        email: 'andi.kurniawan@student.sch.id',
        phone: '081234567809',
        parentName: 'Kurniawan Andi',
        parentPhone: '081234567810',
        birthDate: '2007-11-30',
        gender: 'male',
        status: 'active',
        enrollmentDate: '2024-07-15'
      }
    ];
    
    this.saveStudents(defaultStudents);
    return defaultStudents;
  }

  saveStudents(students: Student[]): void {
    localStorage.setItem('students', JSON.stringify(students));
    this.setCache('students', students);
    this.emit('studentsUpdated', students);
  }

  addStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: Date.now().toString()
    };
    students.push(newStudent);
    this.saveStudents(students);
    this.auditLog('CREATE', 'student', `Student created: ${newStudent.name}`, newStudent);
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const oldStudent = { ...students[index] };
    students[index] = { ...students[index], ...updates };
    this.saveStudents(students);
    this.auditLog('UPDATE', 'student', `Student updated: ${students[index].name}`, { old: oldStudent, new: students[index] });
    return students[index];
  }

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex === -1) return false;
    
    const deletedStudent = students[studentIndex];
    students.splice(studentIndex, 1);
    this.saveStudents(students);
    this.auditLog('DELETE', 'student', `Student deleted: ${deletedStudent.name}`, deletedStudent);
    return true;
  }

  getStudentsByClass(classId: string): Student[] {
    const students = this.getStudents();
    return students.filter(student => student.classId === classId && student.status === 'active');
  }

  // Enhanced Class Management
  getClasses(): Class[] {
    const cached = this.getCache('classes');
    if (cached) return cached;

    const classes = localStorage.getItem('classes');
    if (classes) {
      const parsed = JSON.parse(classes);
      this.setCache('classes', parsed);
      return parsed;
    }
    
    const defaultClasses: Class[] = [
      { 
        id: '1', 
        name: 'XII IPA 1', 
        capacity: 36, 
        room: 'R.12', 
        teacherId: '1', 
        subjects: ['Matematika'], 
        students: [],
        academicYear: '2024/2025',
        grade: 'XII',
        schedule: [
          { id: '1', subject: 'Matematika', class: 'XII IPA 1', time: '07:00-08:30', day: 'Senin', room: 'R.12' },
          { id: '2', subject: 'Matematika', class: 'XII IPA 1', time: '08:30-10:00', day: 'Rabu', room: 'R.12' }
        ]
      },
      { 
        id: '2', 
        name: 'XII IPA 2', 
        capacity: 35, 
        room: 'R.13', 
        teacherId: '3', 
        subjects: ['Fisika'], 
        students: [],
        academicYear: '2024/2025',
        grade: 'XII',
        schedule: [
          { id: '3', subject: 'Fisika', class: 'XII IPA 2', time: '10:15-11:45', day: 'Senin', room: 'R.13' }
        ]
      },
      { 
        id: '3', 
        name: 'XII IPS 1', 
        capacity: 34, 
        room: 'R.15', 
        teacherId: '4', 
        subjects: ['Bahasa Indonesia'], 
        students: [],
        academicYear: '2024/2025',
        grade: 'XII',
        schedule: [
          { id: '4', subject: 'Bahasa Indonesia', class: 'XII IPS 1', time: '13:00-14:30', day: 'Selasa', room: 'R.15' }
        ]
      }
    ];
    
    this.saveClasses(defaultClasses);
    return defaultClasses;
  }

  saveClasses(classes: Class[]): void {
    localStorage.setItem('classes', JSON.stringify(classes));
    this.setCache('classes', classes);
    this.emit('classesUpdated', classes);
  }

  addClass(classData: Omit<Class, 'id'>): Class {
    const classes = this.getClasses();
    const newClass: Class = {
      ...classData,
      id: Date.now().toString()
    };
    classes.push(newClass);
    this.saveClasses(classes);
    this.auditLog('CREATE', 'class', `Class created: ${newClass.name}`, newClass);
    return newClass;
  }

  updateClass(id: string, updates: Partial<Class>): Class | null {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const oldClass = { ...classes[index] };
    classes[index] = { ...classes[index], ...updates };
    this.saveClasses(classes);
    this.auditLog('UPDATE', 'class', `Class updated: ${classes[index].name}`, { old: oldClass, new: classes[index] });
    return classes[index];
  }

  deleteClass(id: string): boolean {
    const classes = this.getClasses();
    const classIndex = classes.findIndex(c => c.id === id);
    if (classIndex === -1) return false;
    
    const deletedClass = classes[classIndex];
    classes.splice(classIndex, 1);
    this.saveClasses(classes);
    this.auditLog('DELETE', 'class', `Class deleted: ${deletedClass.name}`, deletedClass);
    return true;
  }

  // Enhanced Subject Management
  getSubjects(): Subject[] {
    const cached = this.getCache('subjects');
    if (cached) return cached;

    const subjects = localStorage.getItem('subjects');
    if (subjects) {
      const parsed = JSON.parse(subjects);
      this.setCache('subjects', parsed);
      return parsed;
    }
    
    const defaultSubjects: Subject[] = [
      { id: '1', name: 'Matematika', code: 'MTK', credits: 4, department: 'MIPA', description: 'Matematika Wajib untuk SMA' },
      { id: '2', name: 'Fisika', code: 'FIS', credits: 3, department: 'MIPA', description: 'Fisika untuk jurusan IPA' },
      { id: '3', name: 'Kimia', code: 'KIM', credits: 3, department: 'MIPA', description: 'Kimia untuk jurusan IPA' },
      { id: '4', name: 'Bahasa Indonesia', code: 'BIN', credits: 4, department: 'Bahasa', description: 'Bahasa Indonesia Wajib' },
      { id: '5', name: 'Bahasa Inggris', code: 'BIG', credits: 3, department: 'Bahasa', description: 'Bahasa Inggris Wajib' },
      { id: '6', name: 'Sejarah', code: 'SEJ', credits: 3, department: 'IPS', description: 'Sejarah Indonesia dan Dunia' }
    ];
    
    this.saveSubjects(defaultSubjects);
    return defaultSubjects;
  }

  saveSubjects(subjects: Subject[]): void {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    this.setCache('subjects', subjects);
    this.emit('subjectsUpdated', subjects);
  }

  addSubject(subject: Omit<Subject, 'id'>): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString()
    };
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    this.auditLog('CREATE', 'subject', `Subject created: ${newSubject.name}`, newSubject);
    return newSubject;
  }

  updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const oldSubject = { ...subjects[index] };
    subjects[index] = { ...subjects[index], ...updates };
    this.saveSubjects(subjects);
    this.auditLog('UPDATE', 'subject', `Subject updated: ${subjects[index].name}`, { old: oldSubject, new: subjects[index] });
    return subjects[index];
  }

  deleteSubject(id: string): boolean {
    const subjects = this.getSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex === -1) return false;
    
    const deletedSubject = subjects[subjectIndex];
    subjects.splice(subjectIndex, 1);
    this.saveSubjects(subjects);
    this.auditLog('DELETE', 'subject', `Subject deleted: ${deletedSubject.name}`, deletedSubject);
    return true;
  }

  // Student Attendance Management
  getStudentAttendance(): StudentAttendance[] {
    const cached = this.getCache('studentAttendance');
    if (cached) return cached;

    const attendance = localStorage.getItem('studentAttendance');
    const parsed = attendance ? JSON.parse(attendance) : [];
    this.setCache('studentAttendance', parsed);
    return parsed;
  }

  saveStudentAttendance(attendance: StudentAttendance[]): void {
    localStorage.setItem('studentAttendance', JSON.stringify(attendance));
    this.setCache('studentAttendance', attendance);
    this.emit('studentAttendanceUpdated', attendance);
  }

  addStudentAttendance(attendance: Omit<StudentAttendance, 'id' | 'timestamp'>): StudentAttendance {
    const attendanceRecords = this.getStudentAttendance();
    const newAttendance: StudentAttendance = {
      ...attendance,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    attendanceRecords.push(newAttendance);
    this.saveStudentAttendance(attendanceRecords);
    this.auditLog('CREATE', 'studentAttendance', `Student attendance recorded`, newAttendance);
    return newAttendance;
  }

  updateStudentAttendance(id: string, updates: Partial<StudentAttendance>): StudentAttendance | null {
    const attendanceRecords = this.getStudentAttendance();
    const index = attendanceRecords.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    const oldAttendance = { ...attendanceRecords[index] };
    attendanceRecords[index] = { ...attendanceRecords[index], ...updates };
    this.saveStudentAttendance(attendanceRecords);
    this.auditLog('UPDATE', 'studentAttendance', `Student attendance updated`, { old: oldAttendance, new: attendanceRecords[index] });
    return attendanceRecords[index];
  }

  getStudentAttendanceByTeachingLog(teachingLogId: string): StudentAttendance[] {
    const attendance = this.getStudentAttendance();
    return attendance.filter(a => a.teachingLogId === teachingLogId);
  }

  // Attendance Management with Real-time Updates
  getAttendanceRecords(): AttendanceRecord[] {
    const cached = this.getCache('attendance');
    if (cached) return cached;

    const records = localStorage.getItem('attendanceRecords');
    const parsed = records ? JSON.parse(records) : [];
    this.setCache('attendance', parsed);
    return parsed;
  }

  saveAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    this.setCache('attendance', records);
    this.emit('attendanceUpdated', records);
  }

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now().toString()
    };
    records.push(newRecord);
    this.saveAttendanceRecords(records);
    this.auditLog('CREATE', 'attendance', `Attendance recorded`, newRecord);
    return newRecord;
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const records = this.getAttendanceRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const oldRecord = { ...records[index] };
    records[index] = { ...records[index], ...updates };
    this.saveAttendanceRecords(records);
    this.auditLog('UPDATE', 'attendance', `Attendance updated`, { old: oldRecord, new: records[index] });
    return records[index];
  }

  // Teaching Logs Management
  getTeachingLogs(): TeachingLog[] {
    const cached = this.getCache('teachingLogs');
    if (cached) return cached;

    const logs = localStorage.getItem('teachingLogs');
    const parsed = logs ? JSON.parse(logs) : [];
    this.setCache('teachingLogs', parsed);
    return parsed;
  }

  saveTeachingLogs(logs: TeachingLog[]): void {
    localStorage.setItem('teachingLogs', JSON.stringify(logs));
    this.setCache('teachingLogs', logs);
    this.emit('teachingLogsUpdated', logs);
  }

  addTeachingLog(log: Omit<TeachingLog, 'id'>): TeachingLog {
    const logs = this.getTeachingLogs();
    const newLog: TeachingLog = {
      ...log,
      id: Date.now().toString()
    };
    logs.push(newLog);
    this.saveTeachingLogs(logs);
    this.auditLog('CREATE', 'teachingLog', `Teaching log created`, newLog);
    return newLog;
  }

  updateTeachingLog(id: string, updates: Partial<TeachingLog>): TeachingLog | null {
    const logs = this.getTeachingLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    const oldLog = { ...logs[index] };
    logs[index] = { ...logs[index], ...updates };
    this.saveTeachingLogs(logs);
    this.auditLog('UPDATE', 'teachingLog', `Teaching log updated`, { old: oldLog, new: logs[index] });
    return logs[index];
  }

  // Enhanced Analytics and Reports
  getAttendanceStats(dateRange?: { start: string; end: string }) {
    const cacheKey = `attendanceStats_${dateRange?.start || 'all'}_${dateRange?.end || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const records = this.getAttendanceRecords();
    const users = this.getUsers().filter(u => u.role === 'teacher');
    
    let filteredRecords = records;
    if (dateRange) {
      filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    const totalTeachers = users.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const lateCount = filteredRecords.filter(r => r.status === 'late').length;
    const uniqueAttendees = new Set(filteredRecords.map(r => r.userId)).size;
    const absentCount = totalTeachers - uniqueAttendees;

    const stats = {
      total: totalTeachers,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      attendanceRate: totalTeachers > 0 ? ((presentCount + lateCount) / (totalTeachers * this.getWorkingDaysInRange(dateRange)) * 100) : 0,
      records: filteredRecords,
      trends: this.calculateAttendanceTrends(filteredRecords),
      departmentStats: this.calculateDepartmentStats(users, filteredRecords)
    };

    this.setCache(cacheKey, stats, 60000); // Cache for 1 minute
    return stats;
  }

  private getWorkingDaysInRange(dateRange?: { start: string; end: string }): number {
    if (!dateRange) return 30; // Default assumption
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    let workingDays = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Exclude weekends
        workingDays++;
      }
    }
    
    return workingDays || 1;
  }

  private calculateAttendanceTrends(records: AttendanceRecord[]) {
    const dailyStats: { [key: string]: { present: number; late: number; absent: number } } = {};
    
    records.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { present: 0, late: 0, absent: 0 };
      }
      dailyStats[date][record.status]++;
    });
    
    return Object.entries(dailyStats).map(([date, data]) => ({
      date,
      ...data,
      total: data.present + data.late + data.absent,
      rate: ((data.present + data.late) / (data.present + data.late + data.absent)) * 100
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateDepartmentStats(users: User[], records: AttendanceRecord[]) {
    const departments: { [key: string]: { teachers: number; present: number; late: number; total: number } } = {};
    
    users.forEach(user => {
      if (!departments[user.department]) {
        departments[user.department] = { teachers: 0, present: 0, late: 0, total: 0 };
      }
      departments[user.department].teachers++;
      
      const userRecords = records.filter(r => r.userId === user.id);
      departments[user.department].present += userRecords.filter(r => r.status === 'present').length;
      departments[user.department].late += userRecords.filter(r => r.status === 'late').length;
      departments[user.department].total += userRecords.length;
    });
    
    return Object.entries(departments).map(([name, data]) => ({
      name,
      ...data,
      attendanceRate: data.total > 0 ? ((data.present + data.late) / data.total * 100) : 0
    }));
  }

  // Advanced Export Functionality
  exportData(type: 'attendance' | 'teaching' | 'users' | 'students' | 'all', format: 'csv' | 'json' | 'excel' = 'csv', dateRange?: { start: string; end: string }) {
    const data: any = {};
    
    if (type === 'attendance' || type === 'all') {
      let attendanceData = this.getAttendanceRecords();
      if (dateRange) {
        attendanceData = attendanceData.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= new Date(dateRange.start) && recordDate <= new Date(dateRange.end);
        });
      }
      data.attendance = attendanceData;
    }
    
    if (type === 'teaching' || type === 'all') {
      data.teaching = this.getTeachingLogs();
    }
    
    if (type === 'users' || type === 'all') {
      data.users = this.getUsers();
    }

    if (type === 'students' || type === 'all') {
      data.students = this.getStudents();
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // Enhanced CSV format with proper headers
    if (type === 'attendance') {
      return this.convertToCSV(data.attendance, [
        { key: 'id', label: 'ID' },
        { key: 'userId', label: 'User ID' },
        { key: 'date', label: 'Tanggal' },
        { key: 'checkInTime', label: 'Waktu Masuk' },
        { key: 'checkOutTime', label: 'Waktu Keluar' },
        { key: 'status', label: 'Status' },
        { key: 'notes', label: 'Catatan' }
      ]);
    }

    if (type === 'users') {
      return this.convertToCSV(data.users, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nama' },
        { key: 'email', label: 'Email' },
        { key: 'nip', label: 'NIP' },
        { key: 'department', label: 'Departemen' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' }
      ]);
    }

    if (type === 'students') {
      return this.convertToCSV(data.students, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nama' },
        { key: 'nis', label: 'NIS' },
        { key: 'classId', label: 'Kelas ID' },
        { key: 'gender', label: 'Jenis Kelamin' },
        { key: 'status', label: 'Status' }
      ]);
    }

    return JSON.stringify(data, null, 2);
  }

  private convertToCSV(data: any[], headers: Array<{ key: string; label: string }>): string {
    const csvHeaders = headers.map(h => h.label).join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = this.getNestedValue(row, header.key);
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  // Audit Logging System
  private auditLog(action: string, resource: string, description: string, details?: any) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId: this.getCurrentUserId(),
      action,
      resource,
      details: { description, data: details },
      timestamp: new Date().toISOString(),
      ipAddress: 'localhost' // In production, get real IP
    };
    
    logs.push(newLog);
    
    // Keep only last 10000 logs
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }
    
    localStorage.setItem('auditLogs', JSON.stringify(logs));
    this.emit('auditLogAdded', newLog);
  }

  getAuditLogs(): AuditLog[] {
    const logs = localStorage.getItem('auditLogs');
    return logs ? JSON.parse(logs) : [];
  }

  private getCurrentUserId(): string {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).id : 'system';
  }

  // Backup and Restore with Validation
  createBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      checksum: this.generateChecksum(),
      data: {
        settings: this.getSettings(),
        users: this.getUsers(),
        students: this.getStudents(),
        classes: this.getClasses(),
        subjects: this.getSubjects(),
        attendance: this.getAttendanceRecords(),
        studentAttendance: this.getStudentAttendance(),
        teachingLogs: this.getTeachingLogs(),
        auditLogs: this.getAuditLogs()
      }
    };
    
    this.auditLog('CREATE', 'backup', 'System backup created');
    return JSON.stringify(backup, null, 2);
  }

  restoreBackup(backupData: string): { success: boolean; message: string } {
    try {
      const backup = JSON.parse(backupData);
      
      // Validate backup structure
      if (!backup.data || !backup.version) {
        return { success: false, message: 'Invalid backup format' };
      }

      // Version compatibility check
      if (backup.version !== '2.0' && backup.version !== '1.0') {
        return { success: false, message: 'Incompatible backup version' };
      }
      
      // Restore data with validation
      if (backup.data.settings && this.validateSettings(backup.data.settings)) {
        this.saveSettings(backup.data.settings);
      }
      
      if (backup.data.users && Array.isArray(backup.data.users)) {
        this.saveUsers(backup.data.users);
      }

      if (backup.data.students && Array.isArray(backup.data.students)) {
        this.saveStudents(backup.data.students);
      }
      
      if (backup.data.classes && Array.isArray(backup.data.classes)) {
        this.saveClasses(backup.data.classes);
      }
      
      if (backup.data.subjects && Array.isArray(backup.data.subjects)) {
        this.saveSubjects(backup.data.subjects);
      }
      
      if (backup.data.attendance && Array.isArray(backup.data.attendance)) {
        this.saveAttendanceRecords(backup.data.attendance);
      }

      if (backup.data.studentAttendance && Array.isArray(backup.data.studentAttendance)) {
        this.saveStudentAttendance(backup.data.studentAttendance);
      }
      
      if (backup.data.teachingLogs && Array.isArray(backup.data.teachingLogs)) {
        this.saveTeachingLogs(backup.data.teachingLogs);
      }
      
      this.clearCache(); // Clear all cache after restore
      this.emit('dataRestored', backup);
      this.auditLog('RESTORE', 'backup', 'System backup restored', { version: backup.version });
      
      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      this.auditLog('ERROR', 'backup', 'Backup restore failed', { error: error.message });
      return { success: false, message: `Backup restore failed: ${error.message}` };
    }
  }

  private validateSettings(settings: any): boolean {
    return settings && 
           settings.attendance && 
           settings.school && 
           settings.schedule && 
           settings.system;
  }

  private generateChecksum(): string {
    const data = {
      users: this.getUsers().length,
      students: this.getStudents().length,
      attendance: this.getAttendanceRecords().length,
      classes: this.getClasses().length,
      subjects: this.getSubjects().length
    };
    return btoa(JSON.stringify(data));
  }

  // Enhanced Validation
  validateAttendanceLocation(userLat: number, userLng: number): { valid: boolean; distance: number; message: string } {
    const settings = this.getSettings();
    const { latitude, longitude, radius } = settings.attendance.geofencing;
    
    const distance = this.calculateDistance(userLat, userLng, latitude, longitude);
    const valid = distance <= radius;
    
    return {
      valid,
      distance: Math.round(distance),
      message: valid 
        ? `Dalam radius sekolah (${Math.round(distance)}m dari pusat)`
        : `Di luar radius sekolah (${Math.round(distance)}m dari pusat, maksimal ${radius}m)`
    };
  }

  validateAttendanceTime(): { valid: boolean; status: 'early' | 'ontime' | 'late' | 'closed'; message: string } {
    const settings = this.getSettings();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const { start, end } = settings.attendance.timeWindow;
    const lateThreshold = settings.attendance.lateThreshold;
    
    if (currentTime < start) {
      return { valid: false, status: 'early', message: `Belum waktunya absen. Mulai: ${start}` };
    }
    
    if (currentTime > end) {
      return { valid: false, status: 'closed', message: `Waktu absen sudah berakhir. Berakhir: ${end}` };
    }
    
    if (currentTime <= lateThreshold) {
      return { valid: true, status: 'ontime', message: 'Tepat waktu' };
    }
    
    return { valid: true, status: 'late', message: 'Terlambat' };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Performance Monitoring
  getSystemHealth(): { status: 'healthy' | 'warning' | 'critical'; metrics: any } {
    const users = this.getUsers();
    const students = this.getStudents();
    const attendance = this.getAttendanceRecords();
    const logs = this.getAuditLogs();
    
    const metrics = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      totalAttendanceRecords: attendance.length,
      recentAttendance: attendance.filter(r => 
        new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      auditLogSize: logs.length,
      cacheSize: this.cache.size,
      lastBackup: localStorage.getItem('lastBackup') || 'Never'
    };
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (metrics.auditLogSize > 8000) status = 'warning';
    if (metrics.auditLogSize > 9500) status = 'critical';
    if (metrics.cacheSize > 100) status = 'warning';
    
    return { status, metrics };
  }

  // Enhanced Logging with Levels
  log(level: 'info' | 'warning' | 'error', message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getCurrentUserId()
    };
    
    console.log(`[${level.toUpperCase()}] ${message}`, data);
    
    // Store logs in localStorage (in production, send to server)
    const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('systemLogs', JSON.stringify(logs));
    this.emit('systemLogAdded', logEntry);
  }

  getSystemLogs(level?: string, limit: number = 100): any[] {
    const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    let filtered = logs;
    
    if (level) {
      filtered = logs.filter((log: any) => log.level === level);
    }
    
    return filtered.slice(-limit).reverse();
  }
}

export const dataService = DataService.getInstance();