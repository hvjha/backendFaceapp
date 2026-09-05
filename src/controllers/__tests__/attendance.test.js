import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../attendanceController.js';

describe('Attendance Controller Utilities Tests', () => {
    it('should format date to YYYY-MM-DD string using local time without UTC offset shifting', () => {
        const testDate = new Date(2026, 8, 5, 14, 30, 0); // Sept 5, 2026
        const formatted = formatDate(testDate);
        assert.equal(formatted, '2026-09-05');
    });

    it('should correctly pad single-digit months and days', () => {
        const testDate = new Date(2026, 0, 4, 9, 0, 0); // Jan 4, 2026
        const formatted = formatDate(testDate);
        assert.equal(formatted, '2026-01-04');
    });
});
