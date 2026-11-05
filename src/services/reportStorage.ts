/**
 * Storage service for saving and retrieving OBD2 scan reports using localStorage
 */

import { ScanReport } from '../types/obd';

const STORAGE_KEY = 'obd_doctor_scan_history';
const MAX_REPORTS = 50;

export const reportStorage = {
  getReports(): ScanReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to load scan reports from localStorage', e);
      return [];
    }
  },

  saveReport(report: ScanReport): ScanReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const current = this.getReports();
      // Prepend the new report and keep up to MAX_REPORTS
      const updated = [report, ...current.filter(r => r.id !== report.id)].slice(0, MAX_REPORTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save scan report to localStorage', e);
      return this.getReports();
    }
  },

  deleteReport(id: string): ScanReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const current = this.getReports();
      const updated = current.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete report from localStorage', e);
      return this.getReports();
    }
  },

  clearAllReports(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear reports from localStorage', e);
    }
  }
};
