// Student configuration types and utilities
// Merged from InstiKit model - focusing on simplicity and essential features

export interface RegistrationConfig {
  /** Enable provisional admission workflow */
  enableProvisionalAdmission: boolean;
  /** Registration number prefix (e.g., "REG-" ) */
  registrationPrefix: string;
  /** Number of digits for registration number */
  registrationDigits: number;
  /** Registration number suffix */
  registrationSuffix: string;
  /** Next registration number sequence */
  registrationNextNumber: number;
  /** Admission number prefix (e.g., "ADM-" ) */
  admissionPrefix: string;
  /** Number of digits for admission number */
  admissionDigits: number;
  /** Admission number suffix */
  admissionSuffix: string;
  /** Next admission number sequence */
  admissionNextNumber: number;
}

export interface AttendanceConfig {
  /** Number of past days teachers can mark attendance for */
  daysToMarkAttendanceInPast: number;
  /** Enable QR code based attendance */
  enableQrCodeAttendance: boolean;
  /** Regenerate QR code every N seconds (0 = static) */
  qrCodeRegenerateSeconds: number;
  /** Send notifications to parents on absence */
  notifyParentsOnAbsence: boolean;
  /** Mark timeout after N minutes */
  attendanceTimeoutMinutes: number;
}

export interface StudentIdConfig {
  /** Enable unique ID field for students */
  enableUniqueIdField: boolean;
  /** Label for the unique ID (e.g., "Student ID", "Roll Number") */
  uniqueIdLabel: string;
  /** Require unique ID on registration */
  requireUniqueId: boolean;
  /** Auto-generate unique ID format (empty = manual entry) */
  autoGenerateFormat: string;
}

export interface TransferConfig {
  /** Require approval for student transfers */
  requireApprovalForTransfers: boolean;
  /** Auto-approve transfers within same school group */
  autoApproveInternalTransfers: boolean;
  /** Notify parents on transfer request */
  notifyParentsOnTransferRequest: boolean;
}

export interface StudentServiceConfig {
  /** Service request number prefix */
  serviceRequestPrefix: string;
  /** Service request number digits */
  serviceRequestDigits: number;
  /** Next service request number */
  serviceRequestNextNumber: number;
  /** Available service types */
  availableServiceTypes: string[];
  /** Enable service requests */
  enableServiceRequests: boolean;
}

export interface StudentConfig {
  registration: RegistrationConfig;
  attendance: AttendanceConfig;
  studentId: StudentIdConfig;
  transfers: TransferConfig;
  services: StudentServiceConfig;
  /** Version for tracking changes */
  version: number;
  /** Last updated timestamp */
  updatedAt: string;
}

// Default configuration values
export const defaultStudentConfig: StudentConfig = {
  registration: {
    enableProvisionalAdmission: false,
    registrationPrefix: "REG-",
    registrationDigits: 4,
    registrationSuffix: "",
    registrationNextNumber: 1,
    admissionPrefix: "ADM-",
    admissionDigits: 4,
    admissionSuffix: "",
    admissionNextNumber: 1,
  },
  attendance: {
    daysToMarkAttendanceInPast: 7,
    enableQrCodeAttendance: false,
    qrCodeRegenerateSeconds: 0,
    notifyParentsOnAbsence: false,
    attendanceTimeoutMinutes: 30,
  },
  studentId: {
    enableUniqueIdField: false,
    uniqueIdLabel: "Student ID",
    requireUniqueId: false,
    autoGenerateFormat: "",
  },
  transfers: {
    requireApprovalForTransfers: true,
    autoApproveInternalTransfers: false,
    notifyParentsOnTransferRequest: true,
  },
  services: {
    serviceRequestPrefix: "SR-",
    serviceRequestDigits: 4,
    serviceRequestNextNumber: 1,
    availableServiceTypes: ["Document Request", "Certificate Request", "General Inquiry"],
    enableServiceRequests: false,
  },
  version: 1,
  updatedAt: new Date().toISOString(),
};

// Storage key for SchoolSetting
export const STUDENT_CONFIG_KEY = "student_config";

// Generate next number with prefix/digits/suffix
export function generateNumber(
  prefix: string,
  digits: number,
  suffix: string,
  nextNumber: number
): string {
  const paddedNumber = nextNumber.toString().padStart(digits, "0");
  return `${prefix}${paddedNumber}${suffix}`;
}

// Parse and validate student config from JSON
export function parseStudentConfig(data: unknown): StudentConfig {
  if (!data || typeof data !== "object") {
    return defaultStudentConfig;
  }

  const config = data as Partial<StudentConfig>;

  return {
    registration: {
      ...defaultStudentConfig.registration,
      ...config.registration,
    },
    attendance: {
      ...defaultStudentConfig.attendance,
      ...config.attendance,
    },
    studentId: {
      ...defaultStudentConfig.studentId,
      ...config.studentId,
    },
    transfers: {
      ...defaultStudentConfig.transfers,
      ...config.transfers,
    },
    services: {
      ...defaultStudentConfig.services,
      ...config.services,
    },
    version: config.version ?? defaultStudentConfig.version,
    updatedAt: config.updatedAt ?? new Date().toISOString(),
  };
}
