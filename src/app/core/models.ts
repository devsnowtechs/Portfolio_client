export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}
export interface Page<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export interface Versioned {
  id: string;
  version: string;
}
export interface Catalogue extends Versioned {
  kind: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  active: boolean;
}
export interface Media extends Versioned {
  fileName: string;
  contentType: string;
  size: number;
  alt: string;
  folder: string;
  width: number | null;
  height: number | null;
  url: string;
  thumbnailUrl: string | null;
  inUse: boolean;
}
export interface Feature {
  text: string;
  group: string;
  highlight: boolean;
  sortOrder: number;
}
export interface ProjectImage {
  media: Media;
  isCover: boolean;
  sortOrder: number;
}
export interface Project extends Versioned {
  title: string;
  slug: string;
  categoryId: string;
  brief: string;
  descriptionHtml: string;
  status: string;
  featured: boolean;
  allowDemo: boolean;
  allowBuy: boolean;
  liveUrl: string | null;
  sourceUrl: string | null;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  features: Feature[];
  images: ProjectImage[];
  technologies: Catalogue[];
  salesCount: number;
  galleryIntervalSeconds: number;
  buyUrl: string | null;
  updatedAt: string;
}
export interface SaveProject {
  version?: string;
  title: string;
  slug: string;
  categoryId: string;
  brief: string;
  descriptionHtml: string;
  featured: boolean;
  allowDemo: boolean;
  allowBuy: boolean;
  liveUrl: string | null;
  sourceUrl: string | null;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  features: Feature[];
  images: { mediaId: string; isCover: boolean; sortOrder: number }[];
  technologyIds: string[];
}
export interface Profile {
  displayName: string;
  title: string;
  introduction: string;
  biographyHtml: string;
  portraitMediaId: string | null;
  showResumeButton: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroMediaId: string | null;
  industries: string[];
  version?: string;
}
export interface Settings {
  brandName: string;
  tagline: string;
  publicEmail: string;
  whatsAppNumber: string;
  socialLinks: Record<string, string>;
  purchaseTemplate: string;
  footer: { title: string; links: { label: string; url: string }[] }[];
  contactMediaId: string | null;
  seoTitle: string;
  seoDescription: string;
  privacyHtml: string;
  // Company profile for the public About Us page, managed in Admin -> Site Settings -> About Us.
  aboutTitle: string;
  aboutHtml: string;
  version?: string;
}
export interface Document<T> {
  content: T;
  version: string;
}
export interface Timeline extends Versioned {
  category: string;
  title: string;
  organisation: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  icon: string;
  visible: boolean;
  sortOrder: number;
}
export interface Skill extends Versioned {
  name: string;
  description: string;
  groupId: string;
  icon: string;
  color: string;
  visible: boolean;
  sortOrder: number;
}
export interface Resume extends Versioned {
  mediaId: string;
  label: string;
  notes: string;
  active: boolean;
  archived: boolean;
  createdAt: string;
}
export interface CustomDetails {
  frontendIds: string[];
  backendIds: string[];
  databaseIds: string[];
  includeDeployment: boolean;
  budget: string;
  timeline: string;
  industry: string;
  projectType: string;
  meetingPreference: string;
}
export interface Enquiry extends Versioned {
  reference: string;
  kind: string;
  status: string;
  name: string;
  email: string;
  subject: string;
  projectId: string | null;
  preferredAt: string | null;
  confirmedAt: string | null;
  read: boolean;
  createdAt: string;
}
export interface EnquiryDetail {
  summary: Enquiry;
  phone: string;
  organisation: string;
  message: string;
  details: CustomDetails;
  timeZone: string;
  meetingUrl: string;
  durationMinutes: number;
  attachments: Media[];
  notes: { id: string; actor: string; text: string; createdAt: string }[];
}
export interface Sale extends Versioned {
  projectId: string;
  reference: string;
  quantity: number;
  refundedQuantity: number;
  status: string;
  soldAt: string;
  notes: string;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}
export interface Audit {
  id: string;
  actor: string;
  module: string;
  action: string;
  record: string;
  changesJson: string;
  success: boolean;
  traceId: string;
  createdAt: string;
}
export interface Delivery {
  id: string;
  kind: string;
  attempts: number;
  availableAt: string;
  deliveredAt: string | null;
  dead: boolean;
  lastError: string | null;
}
export interface Metrics {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  featuredProjects: number;
  demoRequests: number;
  confirmedDemos: number;
  pendingDemos: number;
  contacted: number;
  unreadContacts: number;
  customRequests: number;
  pendingCustomRequests: number;
  siteVisits: number;
  projectViews: number;
  resumeDownloads: number;
  confirmedSales: number;
}
export interface Analytics {
  metrics: Metrics;
  trend: {
    date: string;
    visits: number;
    enquiries: number;
    downloads: number;
  }[];
  trafficSources: { name: string; count: number }[];
  topProjects: { name: string; count: number }[];
  enquiryBreakdown: { name: string; count: number }[];
}
export interface User {
  id: string;
  email: string;
  roles: string[];
  twoFactorEnabled: boolean;
}
export interface Login {
  requiresTwoFactor: boolean;
  challenge: string | null;
  user: User | null;
}
export interface Session {
  id: string;
  device: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}
export const emptyPage = <T>(): Page<T> => ({
  items: [],
  pageNumber: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});
