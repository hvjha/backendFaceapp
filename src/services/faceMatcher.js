/**
 * Utility functions to calculate face feature vector similarities and match scores
 */

// Cosine similarity between two vectors
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        const valA = vecA[i];
        const valB = vecB[i];
        dotProduct += valA * valB;
        normA += valA * valA;
        normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return isNaN(sim) ? 0 : sim;
};

// Euclidean distance between two vectors
export const euclideanDistance = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return Infinity;

    let sum = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        const diff = vecA[i] - vecB[i];
        sum += diff * diff;
    }

    return Math.sqrt(sum);
};

/**
 * Returns a confidence qualitative rating ('High', 'Medium', 'Low') based on cosine similarity
 */
export const calculateConfidenceRating = (similarityScore) => {
    if (similarityScore >= 0.85) return 'High';
    if (similarityScore >= 0.65) return 'Medium';
    if (similarityScore >= 0.40) return 'Low';
    return 'Very Low';
};

/**
 * Finds the closest matching employee for a scanned face feature embedding
 * @param {Array<number>} scannedEmbedding 
 * @param {Array<Object>} employees - List of employees with faceEmbedding
 * @param {number} threshold - Minimum cosine similarity threshold (default 0.60 / 60%)
 * @returns {Object|null} Best match employee with score and confidence rating, or null
 */
export const findBestFaceMatch = (scannedEmbedding, employees, threshold = 0.60) => {
    if (!scannedEmbedding || scannedEmbedding.length === 0 || !employees || employees.length === 0) {
        return null;
    }

    let bestMatch = null;
    let highestScore = -1;

    for (const emp of employees) {
        if (!emp.faceEmbedding || !Array.isArray(emp.faceEmbedding) || emp.faceEmbedding.length === 0) continue;

        const score = cosineSimilarity(scannedEmbedding, emp.faceEmbedding);
        if (score > highestScore && score >= threshold) {
            highestScore = score;
            bestMatch = {
                employee: emp,
                similarity: score,
                confidence: calculateConfidenceRating(score),
                percentage: (Math.max(0, score) * 100).toFixed(1) + '%'
            };
        }
    }

    return bestMatch;
};

