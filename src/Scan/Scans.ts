export enum Discovery {
  CRAWLER = 'crawler',
  ARCHIVE = 'archive',
  OAS = 'oas'
}

export enum TestType {
  ANGULAR_CSTI = 'angular_csti',
  BACKUP_LOCATIONS = 'backup_locations',
  BROKEN_SAML_AUTH = 'broken_saml_auth',
  BRUTE_FORCE_LOGIN = 'brute_force_login',
  BUSINESS_CONSTRAINT_BYPASS = 'business_constraint_bypass',
  COMMON_FILES = 'common_files',
  COOKIE_SECURITY = 'cookie_security',
  CSRF = 'csrf',
  CVE = 'cve_test',
  DATE_MANIPULATION = 'date_manipulation',
  DEFAULT_LOGIN_LOCATION = 'default_login_location',
  DIRECTORY_LISTING = 'directory_listing',
  DOM_XSS = 'dom_xss',
  EMAIL_INJECTION = 'email_injection',
  EXCESSIVE_DATA_EXPOSURE = 'excessive_data_exposure',
  EXPOSED_COUCH_DB_APIS = 'exposed_couch_db_apis',
  FILE_UPLOAD = 'file_upload',
  FULL_PATH_DISCLOSURE = 'full_path_disclosure',
  GRAPHQL_INTROSPECTION = 'graphql_introspection',
  HEADER_SECURITY = 'header_security',
  HRS = 'hrs',
  HTML_INJECTION = 'html_injection',
  HTTP_METHOD_FUZZING = 'http_method_fuzzing',
  HTTP_RESPONSE_SPLITTING = 'http_response_splitting',
  ID_ENUMERATION = 'id_enumeration',
  IMPROPER_ASSET_MANAGEMENT = 'improper_asset_management',
  INSECURE_TLS_CONFIGURATION = 'insecure_tls_configuration',
  JWT = 'jwt',
  LDAPI = 'ldapi',
  LFI = 'lfi',
  LRRL = 'lrrl',
  MASS_ASSIGNMENT = 'mass_assignment',
  NOSQL = 'nosql',
  OPEN_BUCKETS = 'open_buckets',
  OPEN_DATABASE = 'open_database',
  OSI = 'osi',
  PROTO_POLLUTION = 'proto_pollution',
  RETIRE_JS = 'retire_js',
  RFI = 'rfi',
  S3_TAKEOVER = 'amazon_s3_takeover',
  SECRET_TOKENS = 'secret_tokens',
  SERVER_SIDE_JS_INJECTION = 'server_side_js_injection',
  SQLI = 'sqli',
  SSRF = 'ssrf',
  SSTI = 'ssti',
  UNVALIDATED_REDIRECT = 'unvalidated_redirect',
  VERSION_CONTROL_SYSTEMS = 'version_control_systems',
  WORDPRESS = 'wordpress',
  XPATHI = 'xpathi',
  XSS = 'xss',
  XXE = 'xxe'
}

export const EXPENSIVE_TESTS: readonly TestType[] = [
  TestType.BUSINESS_CONSTRAINT_BYPASS,
  TestType.CVE,
  TestType.DATE_MANIPULATION,
  TestType.EXCESSIVE_DATA_EXPOSURE,
  TestType.ID_ENUMERATION,
  TestType.LRRL,
  TestType.MASS_ASSIGNMENT,
  TestType.RETIRE_JS,
  // not implemented yet by the engine
  TestType.ANGULAR_CSTI,
  TestType.BACKUP_LOCATIONS,
  TestType.EXPOSED_COUCH_DB_APIS,
  TestType.HTTP_RESPONSE_SPLITTING,
  TestType.HRS
];

export const EXCLUSIVE_TESTS: readonly TestType[] = [TestType.LRRL];

export const SCAN_TESTS_TO_RUN_BY_DEFAULT: readonly TestType[] = Object.values(
  TestType
).filter(
  (x: TestType) => ![...EXPENSIVE_TESTS, ...EXCLUSIVE_TESTS].includes(x)
);

export enum Module {
  DAST = 'dast',
  FUZZER = 'fuzzer'
}

export enum AttackParamLocation {
  ARTIFICAL_FRAGMENT = 'artifical-fragment',
  ARTIFICAL_QUERY = 'artifical-query',
  BODY = 'body',
  FRAGMENT = 'fragment',
  HEADER = 'header',
  PATH = 'path',
  QUERY = 'query'
}

export interface Header {
  name: string;
  value: string;
  mergeStrategy: 'replace';
}

export interface RequestExclusion {
  patterns: string[];
  methods: string[];
}

export interface Exclusions {
  params: string[];
  requests: RequestExclusion[];
}

export interface ScanConfig {
  name: string;
  module: Module;
  authObjectId?: string;
  projectId?: string;
  discoveryTypes?: Discovery[];
  tests: TestType[];
  poolSize?: number;
  fileId?: string;
  attackParamLocations?: AttackParamLocation[];
  smart?: boolean;
  extraHosts?: Record<string, string>;
  exclusions?: Exclusions;
  headers?: Record<string, string> | Header[];
  crawlerUrls?: string[];
  hostsFilter?: string[];
  repeaters?: string[];
}

export enum IssueCategory {
  MEDIUM = 'Medium',
  HIGH = 'High',
  LOW = 'Low',
  CRITICAL = 'Critical'
}

export interface CountIssuesBySeverity {
  number: number;
  type: IssueCategory;
}

export enum ScanStatus {
  RUNNING = 'running',
  PENDING = 'pending',
  STOPPED = 'stopped',
  FAILED = 'failed',
  DONE = 'done',
  SCHEDULED = 'scheduled',
  QUEUED = 'queued'
}

export interface ScanState {
  status: ScanStatus;
  issuesBySeverity: CountIssuesBySeverity[];
}

export enum SourceType {
  OPEN_API = 'openapi',
  RAML = 'raml',
  POSTMAN = 'postman',
  HAR = 'har'
}

export interface StorageFile {
  id: string;
  type: SourceType;
}

export interface Scans {
  create(body: ScanConfig): Promise<string>;

  retest(scanId: string): Promise<string>;

  stop(scanId: string): Promise<void>;

  delete(scanId: string): Promise<void>;

  status(scanId: string): Promise<ScanState>;
}

export const Scans: unique symbol = Symbol('Scans');
