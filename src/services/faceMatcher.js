/**
 * Utility functions to calculate face feature vector similarities
 */

// Cosine similarity between two vectors
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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
 * Finds the closest matching employee for a scanned face feature embedding
 * @param {Array<number>} scannedEmbedding 
 * @param {Array<Object>} employees - List of employees with faceEmbedding
 * @param {number} threshold - Minimum cosine similarity threshold (default 0.75)
 * @returns {Object|null} Best match employee or null
 */
export const findBestFaceMatch = (scannedEmbedding, employees, threshold = 0.20) => {
    if (!scannedEmbedding || scannedEmbedding.length === 0 || !employees || employees.length === 0) {
        return null;
    }

    let bestMatch = null;
    let highestScore = -1;

    for (const emp of employees) {
        if (!emp.faceEmbedding || emp.faceEmbedding.length === 0) continue;

        const score = cosineSimilarity(scannedEmbedding, emp.faceEmbedding);
        if (score > highestScore && score >= threshold) {
            highestScore = score;
            bestMatch = {
                employee: emp,
                similarity: score
            };
        }
    }

    return bestMatch;
};
