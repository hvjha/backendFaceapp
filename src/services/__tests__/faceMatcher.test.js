import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    cosineSimilarity,
    euclideanDistance,
    calculateConfidenceRating,
    findBestFaceMatch
} from '../faceMatcher.js';

describe('faceMatcher Service Tests', () => {
    it('should return 1 for identical normalized vectors in cosineSimilarity', () => {
        const vec = [0.5, 0.5, 0.5, 0.5];
        const sim = cosineSimilarity(vec, vec);
        assert.equal(Math.round(sim * 1000) / 1000, 1);
    });

    it('should return 0 for orthogonal vectors', () => {
        const vecA = [1, 0];
        const vecB = [0, 1];
        const sim = cosineSimilarity(vecA, vecB);
        assert.equal(sim, 0);
    });

    it('should return 0 for empty or invalid vectors', () => {
        assert.equal(cosineSimilarity(null, [1, 2]), 0);
        assert.equal(cosineSimilarity([], [1, 2]), 0);
        assert.equal(euclideanDistance(null, [1, 2]), Infinity);
    });

    it('should calculate euclidean distance correctly', () => {
        const vecA = [0, 0];
        const vecB = [3, 4];
        assert.equal(euclideanDistance(vecA, vecB), 5);
    });

    it('should classify confidence ratings accurately', () => {
        assert.equal(calculateConfidenceRating(0.90), 'High');
        assert.equal(calculateConfidenceRating(0.70), 'Medium');
        assert.equal(calculateConfidenceRating(0.45), 'Low');
        assert.equal(calculateConfidenceRating(0.20), 'Very Low');
    });

    it('should find the best matching employee above threshold', () => {
        const targetEmbedding = [0.1, 0.2, 0.3, 0.4];
        const employees = [
            { _id: '1', name: 'Alice', faceEmbedding: [0.1, 0.2, 0.3, 0.4] },
            { _id: '2', name: 'Bob', faceEmbedding: [-0.1, -0.2, -0.3, -0.4] }
        ];

        const match = findBestFaceMatch(targetEmbedding, employees, 0.50);
        assert.notEqual(match, null);
        assert.equal(match.employee._id, '1');
        assert.equal(match.confidence, 'High');
    });

    it('should return null if no employee meets the similarity threshold', () => {
        const targetEmbedding = [1, 0, 0, 0];
        const employees = [
            { _id: '1', name: 'Alice', faceEmbedding: [0, 1, 0, 0] }
        ];

        const match = findBestFaceMatch(targetEmbedding, employees, 0.50);
        assert.equal(match, null);
    });
});
