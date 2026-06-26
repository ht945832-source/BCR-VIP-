// ============================================================
// BACCARAT PREDICTOR - SIÊU MẠNH V4.0
// 30+ PHƯƠNG PHÁP PHÂN TÍCH - KHÔNG RANDOM
// ============================================================

class AdvancedBaccaratPredictor {
    constructor(tableName) {
        this.tableName = tableName;
        this.session = 0;
        this.history = '';
        this.predictions = [];
        this.winRateHistory = [];
        this.accuracyHistory = [];
        
        // ===== CẤU HÌNH =====
        this.config = {
            recentWindow: 25,
            patternWindow: 20,
            minDataPoints: 5,
            confidenceThreshold: 0.3,
            learningRate: 0.01,
            maxStreakWeight: 1.5,
            zigzagWeight: 1.3,
            markovWeight: 1.4,
            neuralWeight: 1.2,
            correlationWeight: 1.1
        };
        
        // ===== TRỌNG SỐ ĐỘNG (30+ phương pháp) =====
        this.weights = {
            // Nhóm thống kê cơ bản
            frequency: 0.06,
            frequency_weighted: 0.05,
            recent: 0.06,
            recent_weighted: 0.05,
            
            // Nhóm pattern
            streak: 0.05,
            zigzag: 0.04,
            repeat: 0.04,
            pattern_2_2: 0.03,
            pattern_3_3: 0.03,
            pattern_4_4: 0.02,
            pattern_1_2_3: 0.02,
            pattern_2_1_2: 0.02,
            
            // Nhóm Markov
            markov1: 0.05,
            markov2: 0.04,
            markov3: 0.03,
            markov_adaptive: 0.03,
            
            // Nhóm xác suất
            bayesian: 0.04,
            bayesian_adaptive: 0.03,
            posterior: 0.03,
            
            // Nhóm AI
            neural: 0.04,
            neural_deep: 0.03,
            neural_lstm: 0.02,
            
            // Nhóm phân tích chuỗi
            gap: 0.03,
            correlation: 0.03,
            autocorrelation: 0.02,
            cross_correlation: 0.02,
            
            // Nhóm entropy
            entropy: 0.02,
            entropy_adaptive: 0.02,
            information_gain: 0.02,
            
            // Nhóm động lượng
            momentum: 0.02,
            momentum_adaptive: 0.02,
            acceleration: 0.02,
            
            // Nhóm hồi quy
            regression: 0.02,
            regression_adaptive: 0.02,
            polynomial_regression: 0.01,
            
            // Nhóm phân cụm
            cluster: 0.02,
            hierarchical: 0.01,
            density: 0.01,
            
            // Nhóm khác
            pair: 0.02,
            triple: 0.02,
            distribution: 0.02,
            volatility: 0.01,
            harmonic: 0.01,
            fibonacci: 0.01,
            resistance: 0.01,
            support: 0.01,
            pivot: 0.01,
            trendline: 0.01
        };
        
        // ===== MA TRẬN MARKOV =====
        this.markov1 = {
            'B': { 'B': 0, 'P': 0, 'T': 0 },
            'P': { 'B': 0, 'P': 0, 'T': 0 },
            'T': { 'B': 0, 'P': 0, 'T': 0 }
        };
        this.markov2 = {};
        this.markov3 = {};
        
        // ===== THAM SỐ BAYES =====
        this.prior = { 'B': 0.45, 'P': 0.45, 'T': 0.10 };
        this.prior_adaptive = { 'B': 0.45, 'P': 0.45, 'T': 0.10 };
        this.likelihood = {
            'B': { 'B': 0.4, 'P': 0.3, 'T': 0.3 },
            'P': { 'B': 0.3, 'P': 0.4, 'T': 0.3 },
            'T': { 'B': 0.2, 'P': 0.2, 'T': 0.6 }
        };
        this.posterior_history = [];
        
        // ===== NEURAL NETWORK =====
        this.neural = {
            input: { 'B': 0, 'P': 0, 'T': 0 },
            hidden1: { 'B': 0, 'P': 0, 'T': 0 },
            hidden2: { 'B': 0, 'P': 0, 'T': 0 },
            output: { 'B': 0, 'P': 0, 'T': 0 },
            weights1: {
                'B': { 'B': 0.35, 'P': 0.25, 'T': 0.15 },
                'P': { 'B': 0.25, 'P': 0.35, 'T': 0.15 },
                'T': { 'B': 0.15, 'P': 0.15, 'T': 0.35 }
            },
            weights2: {
                'B': { 'B': 0.3, 'P': 0.3, 'T': 0.2 },
                'P': { 'B': 0.3, 'P': 0.3, 'T': 0.2 },
                'T': { 'B': 0.2, 'P': 0.2, 'T': 0.4 }
            },
            bias1: { 'B': 0.1, 'P': 0.1, 'T': 0.1 },
            bias2: { 'B': 0.1, 'P': 0.1, 'T': 0.1 }
        };
        
        // ===== THỐNG KÊ =====
        this.stats = {
            counts: { 'B': 0, 'P': 0, 'T': 0 },
            weighted_counts: { 'B': 0, 'P': 0, 'T': 0 },
            streaks: { 'B': 0, 'P': 0, 'T': 0 },
            maxStreaks: { 'B': 0, 'P': 0, 'T': 0 },
            minStreaks: { 'B': Infinity, 'P': Infinity, 'T': Infinity },
            pairs: {},
            triples: {},
            quadruples: {},
            gaps: { 'B': [], 'P': [], 'T': [] },
            lastPositions: { 'B': -1, 'P': -1, 'T': -1 },
            zigzag: [],
            trend: [],
            volatility: [],
            entropy: [],
            momentum: []
        };
        
        // ===== LỊCH SỬ =====
        this.detailedHistory = [];
        this.predictionResults = [];
        this.performance = {
            byMethod: {},
            bySession: {},
            overall: { correct: 0, total: 0, accuracy: 0 }
        };
        
        // ===== PHÂN TÍCH KỸ THUẬT =====
        this.technical = {
            support: { 'B': [], 'P': [] },
            resistance: { 'B': [], 'P': [] },
            pivot: { 'B': 0, 'P': 0 },
            trendline: { 'B': { slope: 0, intercept: 0 }, 'P': { slope: 0, intercept: 0 } }
        };
        
        // ===== BỘ NHỚ ADAPTIVE =====
        this.adaptive = {
            lastAccuracy: 0,
            weightAdjustment: 0,
            learningRate: 0.01,
            momentumBuffer: [],
            entropyBuffer: [],
            confidenceBuffer: []
        };
        
        // ===== CÁC BIẾN KHÁC =====
        this.cycleCount = 0;
        this.currentTrend = 'neutral';
        this.trendStrength = 0;
        this.patternConfidence = 0;
        this.compositeScore = { 'B': 0, 'P': 0, 'T': 0 };
    }

    // ============================================================
    // NHÓM 1: PHÂN TÍCH TẦN SUẤT (4 phương pháp)
    // ============================================================

    // 1.1 Tần suất cơ bản
    frequencyAnalysis(history) {
        const total = history.length || 1;
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        const pred = this.getMaxKey(counts);
        const confidence = counts[pred] / total;
        return {
            prediction: pred,
            confidence: Math.min(confidence, 0.9),
            counts: counts,
            percentages: {
                'B': (counts['B'] / total) * 100,
                'P': (counts['P'] / total) * 100,
                'T': (counts['T'] / total) * 100
            }
        };
    }

    // 1.2 Tần suất có trọng số
    frequencyWeightedAnalysis(history) {
        const total = history.length || 1;
        const weighted = { 'B': 0, 'P': 0, 'T': 0 };
        for (let i = 0; i < history.length; i++) {
            const char = history[i];
            const weight = 1 + (i / history.length); // Trọng số tăng dần
            if (weighted[char] !== undefined) weighted[char] += weight;
        }
        const pred = this.getMaxKey(weighted);
        const maxWeight = weighted[pred];
        const totalWeight = Object.values(weighted).reduce((a, b) => a + b, 0);
        const confidence = maxWeight / totalWeight;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.2, 0.9),
            weighted: weighted
        };
    }

    // 1.3 Tần suất theo cửa sổ trượt
    slidingWindowFrequency(history) {
        if (history.length < 10) return this.frequencyAnalysis(history);
        const windows = [];
        const windowSize = Math.min(10, history.length);
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            windows.push(history.substring(i, i + windowSize));
        }
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const win of windows) {
            const result = this.frequencyAnalysis(win);
            counts[result.prediction] += result.confidence;
        }
        const pred = this.getMaxKey(counts);
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const confidence = total > 0 ? counts[pred] / total : 0;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.1, 0.85),
            windowCount: windows.length
        };
    }

    // 1.4 Phân phối chuẩn
    normalDistributionAnalysis(history) {
        if (history.length < 10) return this.frequencyAnalysis(history);
        const total = history.length;
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        const mean = total / 3;
        const variance = Object.values(counts).reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 3;
        const stdDev = Math.sqrt(variance);
        const zScores = {};
        for (const [char, count] of Object.entries(counts)) {
            zScores[char] = (count - mean) / (stdDev || 1);
        }
        // Dự đoán dựa trên độ lệch chuẩn lớn nhất
        let maxZ = -Infinity;
        let pred = 'B';
        for (const [char, z] of Object.entries(zScores)) {
            if (Math.abs(z) > maxZ) {
                maxZ = Math.abs(z);
                pred = char;
            }
        }
        const confidence = Math.min(Math.abs(maxZ) / 2, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            zScores: zScores,
            stdDev: stdDev
        };
    }

    // ============================================================
    // NHÓM 2: XU HƯỚNG (4 phương pháp)
    // ============================================================

    // 2.1 Xu hướng gần nhất
    recentTrendAnalysis(history) {
        const window = Math.min(this.config.recentWindow, history.length);
        const recent = history.slice(-window);
        const total = recent.length || 1;
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        const weighted = { 'B': 0, 'P': 0, 'T': 0 };
        for (let i = 0; i < recent.length; i++) {
            const char = recent[i];
            if (counts[char] !== undefined) {
                counts[char]++;
                weighted[char] += (i + 1) / total;
            }
        }
        const pred = this.getMaxKey(weighted);
        const confidence = weighted[pred] / (total * 0.7);
        return {
            prediction: pred,
            confidence: Math.min(confidence, 0.9),
            counts: counts,
            weighted: weighted,
            window: window
        };
    }

    // 2.2 Xu hướng có trọng số thời gian
    timeWeightedTrend(history) {
        if (history.length < 5) return this.recentTrendAnalysis(history);
        const weighted = { 'B': 0, 'P': 0, 'T': 0 };
        const totalWeight = (history.length * (history.length + 1)) / 2;
        for (let i = 0; i < history.length; i++) {
            const char = history[i];
            const weight = (i + 1) / totalWeight;
            if (weighted[char] !== undefined) weighted[char] += weight;
        }
        const pred = this.getMaxKey(weighted);
        const confidence = weighted[pred] / (0.5);
        return {
            prediction: pred,
            confidence: Math.min(confidence * 0.8, 0.85),
            weighted: weighted
        };
    }

    // 2.3 Xu hướng mũ
    exponentialTrend(history) {
        if (history.length < 5) return this.recentTrendAnalysis(history);
        const alpha = 0.3;
        const weighted = { 'B': 0, 'P': 0, 'T': 0 };
        let totalWeight = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            const char = history[i];
            const weight = Math.pow(1 - alpha, history.length - 1 - i);
            if (weighted[char] !== undefined) {
                weighted[char] += weight;
                totalWeight += weight;
            }
        }
        for (const key of ['B', 'P', 'T']) {
            if (weighted[key] !== undefined) weighted[key] /= totalWeight;
        }
        const pred = this.getMaxKey(weighted);
        const confidence = weighted[pred] / 0.5;
        return {
            prediction: pred,
            confidence: Math.min(confidence, 0.85),
            weighted: weighted,
            alpha: alpha
        };
    }

    // 2.4 Đường xu hướng
    trendlineAnalysis(history) {
        if (history.length < 8) return this.recentTrendAnalysis(history);
        const values = history.split('').map((c, i) => ({
            x: i,
            y: c === 'B' ? 1 : c === 'P' ? -1 : 0
        }));
        const n = values.length;
        const sumX = values.reduce((a, b) => a + b.x, 0);
        const sumY = values.reduce((a, b) => a + b.y, 0);
        const sumXY = values.reduce((a, b) => a + b.x * b.y, 0);
        const sumX2 = values.reduce((a, b) => a + b.x * b.x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const nextX = n;
        const predictionValue = slope * nextX + intercept;
        let pred = 'B';
        let confidence = 0;
        const rSquared = this.calculateRSquared(values, slope, intercept);
        if (Math.abs(predictionValue) > 0.3) {
            pred = predictionValue > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(predictionValue) * rSquared, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            slope: slope,
            intercept: intercept,
            rSquared: rSquared
        };
    }

    // ============================================================
    // NHÓM 3: PATTERN (9 phương pháp)
    // ============================================================

    // 3.1 Phân tích dây (Streak)
    streakAnalysis(history) {
        if (history.length < 2) return { prediction: 'B', confidence: 0 };
        let currentStreak = 1;
        const streaks = { 'B': 0, 'P': 0, 'T': 0 };
        const positions = { 'B': [], 'P': [], 'T': [] };
        for (let i = 1; i < history.length; i++) {
            if (history[i] === history[i-1]) {
                currentStreak++;
            } else {
                if (currentStreak > streaks[history[i-1]]) {
                    streaks[history[i-1]] = currentStreak;
                }
                positions[history[i-1]].push(currentStreak);
                currentStreak = 1;
            }
        }
        if (currentStreak > streaks[history[history.length-1]]) {
            streaks[history[history.length-1]] = currentStreak;
        }
        positions[history[history.length-1]].push(currentStreak);
        const lastChar = history[history.length - 1];
        const lastStreak = streaks[lastChar] || 1;
        // Tính xác suất streak tiếp tục
        const avgStreak = positions[lastChar].reduce((a, b) => a + b, 0) / (positions[lastChar].length || 1);
        const continueProb = lastStreak / (avgStreak || 1);
        let pred = 'B';
        let confidence = 0;
        if (continueProb > 0.7 && lastStreak < 5) {
            pred = lastChar;
            confidence = Math.min(0.4 + lastStreak * 0.05, 0.8);
        } else if (lastStreak >= 5) {
            // Đảo chiều
            const others = ['B', 'P', 'T'].filter(c => c !== lastChar);
            pred = others[0] || 'B';
            confidence = Math.min(0.3 + (lastStreak - 5) * 0.05, 0.7);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.35;
        }
        return {
            prediction: pred,
            confidence: confidence,
            streaks: streaks,
            lastStreak: lastStreak,
            avgStreak: avgStreak,
            continueProb: continueProb
        };
    }

    // 3.2 Phân tích Zigzag
    zigzagAnalysis(history) {
        if (history.length < 3) return { prediction: 'B', confidence: 0 };
        let zigzagCount = 0;
        const zigzagPatterns = [];
        for (let i = 1; i < history.length - 1; i++) {
            if (history[i] !== history[i-1] && history[i] !== history[i+1]) {
                zigzagCount++;
                zigzagPatterns.push(history[i]);
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (zigzagCount >= 3) {
            const lastChar = history[history.length - 1];
            const secondLast = history[history.length - 2];
            if (lastChar !== secondLast) {
                pred = lastChar;
                confidence = Math.min(0.45 + zigzagCount * 0.03, 0.75);
            } else {
                const others = ['B', 'P', 'T'].filter(c => c !== lastChar);
                pred = others[0] || 'B';
                confidence = 0.4 + zigzagCount * 0.02;
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: Math.min(confidence, 0.85),
            zigzagCount: zigzagCount,
            zigzagPatterns: zigzagPatterns
        };
    }

    // 3.3 Pattern lặp lại
    repeatPatternAnalysis(history) {
        if (history.length < 4) return { prediction: 'B', confidence: 0 };
        const maxLen = Math.min(6, Math.floor(history.length / 2));
        let bestPattern = '';
        let bestCount = 0;
        let bestLen = 0;
        for (let len = 2; len <= maxLen; len++) {
            const lastPattern = history.slice(-len);
            let count = 0;
            for (let i = 0; i < history.length - len; i++) {
                if (history.substring(i, i + len) === lastPattern) {
                    count++;
                }
            }
            if (count > bestCount) {
                bestCount = count;
                bestPattern = lastPattern;
                bestLen = len;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (bestCount >= 2) {
            const nextChar = history[history.indexOf(bestPattern) + bestLen];
            if (nextChar) {
                pred = nextChar;
                confidence = Math.min(0.3 + bestCount * 0.06, 0.75);
            }
        }
        if (confidence === 0) {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            pattern: bestPattern,
            count: bestCount,
            length: bestLen
        };
    }

    // 3.4 Pattern 2-2
    twoTwoPattern(history) {
        if (history.length < 6) return { prediction: 'B', confidence: 0 };
        let matchCount = 0;
        const matches = [];
        for (let i = 1; i < Math.min(8, history.length - 1); i += 2) {
            if (history[history.length - i] === history[history.length - i - 1]) {
                matchCount++;
                matches.push(history[history.length - i]);
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (matchCount >= 2) {
            pred = history[history.length - 1];
            confidence = Math.min(0.45 + matchCount * 0.05, 0.75);
            // Kiểm tra pattern 2-2-2-2
            if (matchCount >= 4) {
                confidence = Math.min(confidence + 0.1, 0.85);
                pred = matches[0] === matches[1] ? 'B' : 'P';
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            matchCount: matchCount,
            matches: matches
        };
    }

    // 3.5 Pattern 3-3
    threeThreePattern(history) {
        if (history.length < 8) return { prediction: 'B', confidence: 0 };
        let matchCount = 0;
        const matches = [];
        for (let i = 2; i < Math.min(9, history.length - 1); i += 3) {
            if (history[history.length - i] === history[history.length - i - 1] &&
                history[history.length - i] === history[history.length - i - 2]) {
                matchCount++;
                matches.push(history[history.length - i]);
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (matchCount >= 2) {
            pred = history[history.length - 1];
            confidence = Math.min(0.45 + matchCount * 0.05, 0.75);
            if (matchCount >= 3) {
                confidence = Math.min(confidence + 0.1, 0.85);
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            matchCount: matchCount,
            matches: matches
        };
    }

    // 3.6 Pattern 4-4
    fourFourPattern(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        let matchCount = 0;
        for (let i = 3; i < Math.min(12, history.length - 1); i += 4) {
            if (history[history.length - i] === history[history.length - i - 1] &&
                history[history.length - i] === history[history.length - i - 2] &&
                history[history.length - i] === history[history.length - i - 3]) {
                matchCount++;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (matchCount >= 2) {
            pred = history[history.length - 1];
            confidence = Math.min(0.4 + matchCount * 0.05, 0.7);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            matchCount: matchCount
        };
    }

    // 3.7 Pattern 1-2-3
    pattern123(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        let matchCount = 0;
        for (let i = 0; i < history.length - 6; i++) {
            if (history[i] !== history[i+1] &&
                history[i+1] === history[i+2] &&
                history[i+3] !== history[i+2] &&
                history[i+3] === history[i+4] &&
                history[i+4] === history[i+5]) {
                matchCount++;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (matchCount >= 2) {
            const lastChar = history[history.length - 1];
            const secondLast = history[history.length - 2];
            if (lastChar !== secondLast) {
                pred = lastChar;
                confidence = Math.min(0.4 + matchCount * 0.03, 0.7);
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            matchCount: matchCount
        };
    }

    // 3.8 Pattern 2-1-2
    pattern212(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        let matchCount = 0;
        for (let i = 0; i < history.length - 5; i++) {
            if (history[i] === history[i+1] &&
                history[i+1] !== history[i+2] &&
                history[i+2] === history[i+3] &&
                history[i+3] === history[i+4]) {
                matchCount++;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (matchCount >= 2) {
            const lastChar = history[history.length - 1];
            const secondLast = history[history.length - 2];
            if (lastChar === secondLast) {
                pred = lastChar;
                confidence = Math.min(0.4 + matchCount * 0.03, 0.7);
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            matchCount: matchCount
        };
    }

    // 3.9 Composite Pattern
    compositePatternAnalysis(history) {
        const results = [
            this.streakAnalysis(history),
            this.zigzagAnalysis(history),
            this.repeatPatternAnalysis(history),
            this.twoTwoPattern(history),
            this.threeThreePattern(history),
            this.fourFourPattern(history),
            this.pattern123(history),
            this.pattern212(history)
        ];
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const confidences = { 'B': 0, 'P': 0, 'T': 0 };
        let totalWeight = 0;
        for (const result of results) {
            if (result && result.prediction && result.confidence) {
                const weight = result.confidence;
                scores[result.prediction] += weight * 10;
                confidences[result.prediction] += weight;
                totalWeight += weight;
            }
        }
        let pred = 'B';
        let maxScore = 0;
        for (const char of ['B', 'P', 'T']) {
            if (scores[char] > maxScore) {
                maxScore = scores[char];
                pred = char;
            }
        }
        const confidence = totalWeight > 0 ? confidences[pred] / totalWeight : 0;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.2, 0.85),
            patternCount: results.length
        };
    }

    // ============================================================
    // NHÓM 4: MARKOV (4 phương pháp)
    // ============================================================

    // 4.1 Markov bậc 1
    markov1Analysis(history) {
        if (history.length < 2) return { prediction: 'B', confidence: 0 };
        for (let i = 0; i < history.length - 1; i++) {
            const current = history[i];
            const next = history[i + 1];
            if (this.markov1[current] && this.markov1[current][next] !== undefined) {
                this.markov1[current][next]++;
            }
        }
        const lastChar = history[history.length - 1];
        const transitions = this.markov1[lastChar];
        if (!transitions) return { prediction: 'B', confidence: 0 };
        const total = Object.values(transitions).reduce((a, b) => a + b, 0);
        if (total === 0) return { prediction: 'B', confidence: 0 };
        let maxProb = 0;
        let pred = 'B';
        for (const [char, count] of Object.entries(transitions)) {
            const prob = count / total;
            if (prob > maxProb) {
                maxProb = prob;
                pred = char;
            }
        }
        // Điều chỉnh confidence
        const confidence = Math.min(maxProb * 1.3, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            matrix: transitions,
            total: total
        };
    }

    // 4.2 Markov bậc 2
    markov2Analysis(history) {
        if (history.length < 3) return { prediction: 'B', confidence: 0 };
        for (let i = 0; i < history.length - 2; i++) {
            const key = history[i] + history[i + 1];
            const next = history[i + 2];
            if (!this.markov2[key]) {
                this.markov2[key] = { 'B': 0, 'P': 0, 'T': 0 };
            }
            if (this.markov2[key][next] !== undefined) {
                this.markov2[key][next]++;
            }
        }
        const lastKey = history.slice(-2);
        const transitions = this.markov2[lastKey];
        if (!transitions) return { prediction: 'B', confidence: 0 };
        const total = Object.values(transitions).reduce((a, b) => a + b, 0);
        if (total === 0) return { prediction: 'B', confidence: 0 };
        let maxProb = 0;
        let pred = 'B';
        for (const [char, count] of Object.entries(transitions)) {
            const prob = count / total;
            if (prob > maxProb) {
                maxProb = prob;
                pred = char;
            }
        }
        const confidence = Math.min(maxProb * 1.4, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            matrix: transitions,
            total: total
        };
    }

    // 4.3 Markov bậc 3
    markov3Analysis(history) {
        if (history.length < 4) return { prediction: 'B', confidence: 0 };
        for (let i = 0; i < history.length - 3; i++) {
            const key = history[i] + history[i + 1] + history[i + 2];
            const next = history[i + 3];
            if (!this.markov3[key]) {
                this.markov3[key] = { 'B': 0, 'P': 0, 'T': 0 };
            }
            if (this.markov3[key][next] !== undefined) {
                this.markov3[key][next]++;
            }
        }
        const lastKey = history.slice(-3);
        const transitions = this.markov3[lastKey];
        if (!transitions) return { prediction: 'B', confidence: 0 };
        const total = Object.values(transitions).reduce((a, b) => a + b, 0);
        if (total === 0) return { prediction: 'B', confidence: 0 };
        let maxProb = 0;
        let pred = 'B';
        for (const [char, count] of Object.entries(transitions)) {
            const prob = count / total;
            if (prob > maxProb) {
                maxProb = prob;
                pred = char;
            }
        }
        const confidence = Math.min(maxProb * 1.5, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            matrix: transitions,
            total: total
        };
    }

    // 4.4 Markov Adaptive
    markovAdaptive(history) {
        if (history.length < 5) return this.markov1Analysis(history);
        // Kết hợp cả 3 bậc
        const m1 = this.markov1Analysis(history);
        const m2 = this.markov2Analysis(history);
        const m3 = this.markov3Analysis(history);
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const confidences = { 'B': 0, 'P': 0, 'T': 0 };
        const results = [m1, m2, m3];
        let totalWeight = 0;
        for (const result of results) {
            if (result && result.prediction && result.confidence) {
                const weight = result.confidence;
                scores[result.prediction] += weight * 10;
                confidences[result.prediction] += weight;
                totalWeight += weight;
            }
        }
        let pred = 'B';
        let maxScore = 0;
        for (const char of ['B', 'P', 'T']) {
            if (scores[char] > maxScore) {
                maxScore = scores[char];
                pred = char;
            }
        }
        const confidence = totalWeight > 0 ? confidences[pred] / totalWeight : 0;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.1, 0.9),
            methods: [m1, m2, m3]
        };
    }

    // ============================================================
    // NHÓM 5: XÁC SUẤT BAYES (3 phương pháp)
    // ============================================================

    // 5.1 Bayesian cơ bản
    bayesianAnalysis(history) {
        if (history.length < 5) return { prediction: 'B', confidence: 0.5 };
        const recent = history.slice(-10);
        const posterior = { 'B': 0, 'P': 0, 'T': 0 };
        for (const state of ['B', 'P', 'T']) {
            let likelihood = 0;
            for (const char of recent) {
                if (char === state) likelihood++;
            }
            likelihood = (likelihood / recent.length) || 0.01;
            posterior[state] = this.prior[state] * likelihood;
        }
        const total = Object.values(posterior).reduce((a, b) => a + b, 0);
        if (total === 0) return { prediction: 'B', confidence: 0 };
        let maxPosterior = 0;
        let pred = 'B';
        for (const [char, value] of Object.entries(posterior)) {
            const normalized = value / total;
            if (normalized > maxPosterior) {
                maxPosterior = normalized;
                pred = char;
            }
        }
        const confidence = Math.min(maxPosterior * 1.3, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            posterior: posterior
        };
    }

    // 5.2 Bayesian Adaptive
    bayesianAdaptive(history) {
        if (history.length < 10) return this.bayesianAnalysis(history);
        // Cập nhật prior dựa trên dữ liệu mới
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        const total = history.length;
        this.prior_adaptive = {
            'B': (counts['B'] / total) * 0.7 + 0.15,
            'P': (counts['P'] / total) * 0.7 + 0.15,
            'T': (counts['T'] / total) * 0.7 + 0.033
        };
        const recent = history.slice(-15);
        const posterior = { 'B': 0, 'P': 0, 'T': 0 };
        for (const state of ['B', 'P', 'T']) {
            let likelihood = 0;
            for (const char of recent) {
                if (char === state) likelihood++;
            }
            likelihood = (likelihood / recent.length) || 0.01;
            posterior[state] = this.prior_adaptive[state] * likelihood;
        }
        const totalPost = Object.values(posterior).reduce((a, b) => a + b, 0);
        if (totalPost === 0) return { prediction: 'B', confidence: 0 };
        let maxPost = 0;
        let pred = 'B';
        for (const [char, value] of Object.entries(posterior)) {
            const normalized = value / totalPost;
            if (normalized > maxPost) {
                maxPost = normalized;
                pred = char;
            }
        }
        const confidence = Math.min(maxPost * 1.4, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            posterior: posterior,
            prior: this.prior_adaptive
        };
    }

    // 5.3 Posterior Probability
    posteriorProbability(history) {
        if (history.length < 10) return this.bayesianAnalysis(history);
        const predictions = [];
        const windows = [];
        const windowSize = Math.min(10, history.length);
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            windows.push(history.substring(i, i + windowSize));
        }
        for (const win of windows) {
            const result = this.bayesianAdaptive(win);
            predictions.push(result);
        }
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const confidences = { 'B': 0, 'P': 0, 'T': 0 };
        for (const pred of predictions) {
            if (pred && pred.prediction && pred.confidence) {
                scores[pred.prediction] += pred.confidence * 10;
                confidences[pred.prediction] += pred.confidence;
            }
        }
        let pred = 'B';
        let maxScore = 0;
        for (const char of ['B', 'P', 'T']) {
            if (scores[char] > maxScore) {
                maxScore = scores[char];
                pred = char;
            }
        }
        const totalConf = Object.values(confidences).reduce((a, b) => a + b, 0);
        const confidence = totalConf > 0 ? confidences[pred] / totalConf : 0;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.2, 0.85),
            predictions: predictions
        };
    }

    // ============================================================
    // NHÓM 6: NEURAL NETWORK (3 phương pháp)
    // ============================================================

    // 6.1 Neural Network cơ bản
    neuralAnalysis(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0.5 };
        const nGrams = { 1: {}, 2: {}, 3: {}, 4: {} };
        for (let n = 1; n <= 4; n++) {
            for (let i = 0; i < history.length - n + 1; i++) {
                const gram = history.substring(i, i + n);
                if (!nGrams[n][gram]) {
                    nGrams[n][gram] = { count: 0, next: {} };
                }
                nGrams[n][gram].count++;
                if (i + n < history.length) {
                    const next = history[i + n];
                    if (!nGrams[n][gram].next[next]) {
                        nGrams[n][gram].next[next] = 0;
                    }
                    nGrams[n][gram].next[next]++;
                }
            }
        }
        const last1 = history[history.length - 1];
        const last2 = history.slice(-2);
        const last3 = history.slice(-3);
        const last4 = history.slice(-4);
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const weights = this.neural.weights1;
        // 1-gram
        if (nGrams[1][last1]) {
            const total = nGrams[1][last1].count;
            for (const [next, count] of Object.entries(nGrams[1][last1].next)) {
                const prob = count / total;
                scores[next] += prob * weights['B'][next] * 0.3;
            }
        }
        // 2-gram
        if (nGrams[2][last2]) {
            const total = nGrams[2][last2].count;
            for (const [next, count] of Object.entries(nGrams[2][last2].next)) {
                const prob = count / total;
                scores[next] += prob * weights['P'][next] * 0.5;
            }
        }
        // 3-gram
        if (nGrams[3][last3]) {
            const total = nGrams[3][last3].count;
            for (const [next, count] of Object.entries(nGrams[3][last3].next)) {
                const prob = count / total;
                scores[next] += prob * weights['T'][next] * 0.7;
            }
        }
        // 4-gram
        if (nGrams[4][last4]) {
            const total = nGrams[4][last4].count;
            for (const [next, count] of Object.entries(nGrams[4][last4].next)) {
                const prob = count / total;
                scores[next] += prob * 1.0;
            }
        }
        let maxScore = 0;
        let pred = 'B';
        for (const [char, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                pred = char;
            }
        }
        const confidence = Math.min(maxScore / 2, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            scores: scores,
            nGrams: Object.keys(nGrams[1]).length + Object.keys(nGrams[2]).length
        };
    }

    // 6.2 Deep Neural Network
    deepNeuralAnalysis(history) {
        if (history.length < 15) return this.neuralAnalysis(history);
        // 2 hidden layers
        const input = { 'B': 0, 'P': 0, 'T': 0 };
        const weights = this.neural.weights1;
        const weights2 = this.neural.weights2;
        // Input layer
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        const total = history.length;
        for (const char of ['B', 'P', 'T']) {
            input[char] = counts[char] / total;
        }
        // Hidden layer 1
        const hidden1 = { 'B': 0, 'P': 0, 'T': 0 };
        for (const out of ['B', 'P', 'T']) {
            let sum = 0;
            for (const inChar of ['B', 'P', 'T']) {
                sum += input[inChar] * weights[inChar][out];
            }
            hidden1[out] = this.sigmoid(sum + this.neural.bias1[out]);
        }
        // Hidden layer 2
        const hidden2 = { 'B': 0, 'P': 0, 'T': 0 };
        for (const out of ['B', 'P', 'T']) {
            let sum = 0;
            for (const inChar of ['B', 'P', 'T']) {
                sum += hidden1[inChar] * weights2[inChar][out];
            }
            hidden2[out] = this.sigmoid(sum + this.neural.bias2[out]);
        }
        // Output
        let maxOutput = 0;
        let pred = 'B';
        for (const char of ['B', 'P', 'T']) {
            if (hidden2[char] > maxOutput) {
                maxOutput = hidden2[char];
                pred = char;
            }
        }
        const confidence = Math.min(maxOutput * 1.5, 0.9);
        return {
            prediction: pred,
            confidence: confidence,
            hidden1: hidden1,
            hidden2: hidden2,
            output: hidden2
        };
    }

    // 6.3 LSTM-like Analysis
    lstmAnalysis(history) {
        if (history.length < 20) return this.neuralAnalysis(history);
        // Simulate LSTM with sliding windows
        const windowSize = 10;
        const windows = [];
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            windows.push(history.substring(i, i + windowSize));
        }
        const results = [];
        for (const win of windows) {
            const result = this.deepNeuralAnalysis(win);
            results.push(result);
        }
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const confidences = { 'B': 0, 'P': 0, 'T': 0 };
        for (const result of results) {
            if (result && result.prediction && result.confidence) {
                const weight = result.confidence;
                scores[result.prediction] += weight * 10;
                confidences[result.prediction] += weight;
            }
        }
        let pred = 'B';
        let maxScore = 0;
        for (const char of ['B', 'P', 'T']) {
            if (scores[char] > maxScore) {
                maxScore = scores[char];
                pred = char;
            }
        }
        const totalConf = Object.values(confidences).reduce((a, b) => a + b, 0);
        const confidence = totalConf > 0 ? confidences[pred] / totalConf : 0;
        return {
            prediction: pred,
            confidence: Math.min(confidence * 1.1, 0.85),
            windows: windows.length
        };
    }

    // ============================================================
    // NHÓM 7: PHÂN TÍCH CHUỖI (4 phương pháp)
    // ============================================================

    // 7.1 Gap Analysis
    gapAnalysis(history) {
        const gaps = { 'B': [], 'P': [], 'T': [] };
        const lastPos = { 'B': -1, 'P': -1, 'T': -1 };
        for (let i = 0; i < history.length; i++) {
            const char = history[i];
            if (lastPos[char] !== -1) {
                gaps[char].push(i - lastPos[char] - 1);
            }
            lastPos[char] = i;
        }
        const avgGaps = {};
        const stdGaps = {};
        for (const char of ['B', 'P', 'T']) {
            if (gaps[char].length > 0) {
                avgGaps[char] = gaps[char].reduce((a, b) => a + b, 0) / gaps[char].length;
                const variance = gaps[char].reduce((a, b) => a + Math.pow(b - avgGaps[char], 2), 0) / gaps[char].length;
                stdGaps[char] = Math.sqrt(variance);
            } else {
                avgGaps[char] = 2;
                stdGaps[char] = 1;
            }
        }
        const currentGap = {};
        for (const char of ['B', 'P', 'T']) {
            currentGap[char] = history.length - 1 - lastPos[char];
        }
        const scores = {};
        for (const char of ['B', 'P', 'T']) {
            if (lastPos[char] === -1) {
                scores[char] = 0.1;
            } else {
                const ratio = currentGap[char] / (avgGaps[char] || 1);
                const zScore = (currentGap[char] - avgGaps[char]) / (stdGaps[char] || 1);
                scores[char] = Math.min(ratio * (1 + Math.abs(zScore) * 0.1), 1);
            }
        }
        let maxScore = 0;
        let pred = 'B';
        for (const [char, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                pred = char;
            }
        }
        const confidence = Math.min(maxScore * 0.8, 0.85);
        return {
            prediction: pred,
            confidence: confidence,
            gaps: currentGap,
            avgGaps: avgGaps,
            stdGaps: stdGaps,
            zScores: {}
        };
    }

    // 7.2 Correlation Analysis
    correlationAnalysis(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0.5 };
        const sequence = history.split('').map(c => {
            if (c === 'B') return 1;
            if (c === 'P') return -1;
            return 0;
        });
        const n = sequence.length;
        const mean = sequence.reduce((a, b) => a + b, 0) / n;
        const variance = sequence.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const correlations = [];
        for (let lag = 1; lag <= Math.min(8, n - 1); lag++) {
            let sum = 0;
            for (let i = 0; i < n - lag; i++) {
                sum += (sequence[i] - mean) * (sequence[i + lag] - mean);
            }
            correlations.push(sum / ((n - lag) * variance));
        }
        const lastValue = sequence[n - 1];
        let predictedValue = lastValue;
        let confidence = 0.5;
        // Phân tích correlation
        let positiveCount = correlations.filter(c => c > 0.2).length;
        let negativeCount = correlations.filter(c => c < -0.2).length;
        if (positiveCount > negativeCount + 1) {
            predictedValue = lastValue;
            confidence = Math.min(0.4 + positiveCount * 0.05, 0.8);
        } else if (negativeCount > positiveCount + 1) {
            predictedValue = -lastValue;
            confidence = Math.min(0.4 + negativeCount * 0.05, 0.8);
        }
        let pred = 'B';
        if (predictedValue > 0) pred = 'B';
        else if (predictedValue < 0) pred = 'P';
        else pred = 'T';
        return {
            prediction: pred,
            confidence: confidence,
            correlations: correlations,
            positiveCount: positiveCount,
            negativeCount: negativeCount
        };
    }

    // 7.3 Autocorrelation
    autocorrelationAnalysis(history) {
        if (history.length < 15) return this.correlationAnalysis(history);
        const result = this.correlationAnalysis(history);
        // Phân tích thêm autocorrelation
        const sequence = history.split('').map(c => {
            if (c === 'B') return 1;
            if (c === 'P') return -1;
            return 0;
        });
        const n = sequence.length;
        const mean = sequence.reduce((a, b) => a + b, 0) / n;
        const acf = [];
        for (let lag = 1; lag <= Math.min(10, n - 1); lag++) {
            let sum = 0;
            for (let i = 0; i < n - lag; i++) {
                sum += (sequence[i] - mean) * (sequence[i + lag] - mean);
            }
            acf.push(sum / ((n - lag) * n));
        }
        // Tìm period
        let period = 0;
        let maxACF = 0;
        for (let i = 0; i < acf.length; i++) {
            if (acf[i] > maxACF && i > 0) {
                maxACF = acf[i];
                period = i + 1;
            }
        }
        if (period > 0 && maxACF > 0.3) {
            const nextIndex = n % period;
            const nextValue = sequence[nextIndex];
            let pred = 'B';
            if (nextValue > 0) pred = 'B';
            else if (nextValue < 0) pred = 'P';
            else pred = 'T';
            const confidence = Math.min(maxACF * 0.8 + 0.2, 0.85);
            return {
                prediction: pred,
                confidence: confidence,
                period: period,
                acf: acf,
                maxACF: maxACF
            };
        }
        return result;
    }

    // 7.4 Cross Correlation
    crossCorrelationAnalysis(history) {
        if (history.length < 20) return this.correlationAnalysis(history);
        // Phân tích tương quan chéo giữa các cửa
        const sequence = history.split('');
        const crossCorr = {};
        for (const c1 of ['B', 'P', 'T']) {
            for (const c2 of ['B', 'P', 'T']) {
                if (c1 !== c2) {
                    const key = c1 + c2;
                    crossCorr[key] = [];
                    for (let lag = 1; lag <= Math.min(5, history.length / 2); lag++) {
                        let count = 0;
                        for (let i = 0; i < history.length - lag; i++) {
                            if (sequence[i] === c1 && sequence[i + lag] === c2) {
                                count++;
                            }
                        }
                        crossCorr[key].push(count / (history.length - lag));
                    }
                }
            }
        }
        // Dự đoán dựa trên cross correlation
        const lastChar = history[history.length - 1];
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of ['B', 'P', 'T']) {
            if (char !== lastChar) {
                const key = lastChar + char;
                if (crossCorr[key]) {
                    const maxCorr = Math.max(...crossCorr[key]);
                    scores[char] = maxCorr * 1.5;
                }
            }
        }
        if (Object.values(scores).reduce((a, b) => a + b, 0) === 0) {
            return this.correlationAnalysis(history);
        }
        let pred = 'B';
        let maxScore = 0;
        for (const [char, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                pred = char;
            }
        }
        const confidence = Math.min(maxScore, 0.8);
        return {
            prediction: pred,
            confidence: confidence,
            crossCorr: crossCorr
        };
    }

    // ============================================================
    // NHÓM 8: ENTROPY (3 phương pháp)
    // ============================================================

    // 8.1 Entropy Analysis
    entropyAnalysis(history) {
        if (history.length < 5) return { prediction: 'B', confidence: 0 };
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        const total = history.length;
        let entropy = 0;
        for (const char of ['B', 'P', 'T']) {
            const prob = counts[char] / total;
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        const maxEntropy = Math.log2(3);
        const predictability = 1 - (entropy / maxEntropy);
        let pred = 'B';
        let confidence = 0;
        if (predictability > 0.6) {
            pred = this.getMaxKey(counts);
            confidence = Math.min(predictability * 0.9, 0.85);
        } else if (predictability > 0.4) {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.4;
        } else {
            // Entropy cao, khó dự đoán
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            entropy: entropy,
            predictability: predictability
        };
    }

    // 8.2 Adaptive Entropy
    adaptiveEntropy(history) {
        if (history.length < 10) return this.entropyAnalysis(history);
        const windows = [];
        const windowSize = Math.min(10, history.length);
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            windows.push(history.substring(i, i + windowSize));
        }
        const entropies = [];
        for (const win of windows) {
            const result = this.entropyAnalysis(win);
            entropies.push(result);
        }
        // Tính entropy trung bình và độ lệch
        const avgEntropy = entropies.reduce((a, b) => a + b.entropy, 0) / entropies.length;
        const lastEntropy = entropies[entropies.length - 1].entropy;
        const entropyDiff = lastEntropy - avgEntropy;
        let pred = 'B';
        let confidence = 0;
        if (entropyDiff < -0.2) {
            // Entropy giảm => dễ dự đoán hơn
            const result = this.frequencyAnalysis(history);
            pred = result.prediction;
            confidence = Math.min(result.confidence * 1.2, 0.85);
        } else if (entropyDiff > 0.2) {
            // Entropy tăng => khó dự đoán
            const result = this.recentTrendAnalysis(history);
            pred = result.prediction;
            confidence = result.confidence * 0.8;
        } else {
            const result = this.compositePatternAnalysis(history);
            pred = result.prediction;
            confidence = result.confidence;
        }
        return {
            prediction: pred,
            confidence: confidence,
            avgEntropy: avgEntropy,
            lastEntropy: lastEntropy,
            entropyDiff: entropyDiff
        };
    }

    // 8.3 Information Gain
    informationGain(history) {
        if (history.length < 10) return this.entropyAnalysis(history);
        // Tính information gain cho từng vị trí
        const gains = [];
        for (let pos = 0; pos < Math.min(5, history.length - 1); pos++) {
            const entropy = this.entropyAnalysis(history).entropy;
            const conditionalEntropy = this.calculateConditionalEntropy(history, pos);
            gains.push(entropy - conditionalEntropy);
        }
        // Dự đoán dựa trên vị trí có information gain cao nhất
        let maxGain = 0;
        let bestPos = 0;
        for (let i = 0; i < gains.length; i++) {
            if (gains[i] > maxGain) {
                maxGain = gains[i];
                bestPos = i + 1;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (maxGain > 0.1) {
            const lastChar = history[history.length - 1];
            const prevChar = history[history.length - 1 - bestPos];
            if (lastChar === prevChar) {
                pred = lastChar;
                confidence = Math.min(0.4 + maxGain, 0.8);
            } else {
                const others = ['B', 'P', 'T'].filter(c => c !== lastChar);
                pred = others[0] || 'B';
                confidence = Math.min(0.3 + maxGain, 0.7);
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            gains: gains,
            bestPosition: bestPos,
            maxGain: maxGain
        };
    }

    // ============================================================
    // NHÓM 9: ĐỘNG LƯỢNG (3 phương pháp)
    // ============================================================

    // 9.1 Momentum Analysis
    momentumAnalysis(history) {
        if (history.length < 5) return { prediction: 'B', confidence: 0 };
        const recent = history.slice(-5);
        let momentum = 0;
        const values = recent.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        for (let i = 1; i < values.length; i++) {
            momentum += values[i] - values[i - 1];
        }
        let pred = 'B';
        let confidence = 0;
        if (Math.abs(momentum) > 2) {
            pred = momentum > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(momentum) / 6, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            momentum: momentum,
            values: values
        };
    }

    // 9.2 Adaptive Momentum
    adaptiveMomentum(history) {
        if (history.length < 10) return this.momentumAnalysis(history);
        const momentums = [];
        for (let i = 5; i < history.length; i++) {
            const subHistory = history.substring(0, i);
            const result = this.momentumAnalysis(subHistory);
            momentums.push(result.momentum);
        }
        const avgMomentum = momentums.reduce((a, b) => a + b, 0) / momentums.length;
        const lastMomentum = momentums[momentums.length - 1] || 0;
        const momentumDiff = lastMomentum - avgMomentum;
        let pred = 'B';
        let confidence = 0;
        if (Math.abs(momentumDiff) > 1) {
            pred = momentumDiff > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(momentumDiff) / 4, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            avgMomentum: avgMomentum,
            lastMomentum: lastMomentum,
            momentumDiff: momentumDiff
        };
    }

    // 9.3 Acceleration
    accelerationAnalysis(history) {
        if (history.length < 10) return this.momentumAnalysis(history);
        const values = history.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        const velocities = [];
        for (let i = 1; i < values.length; i++) {
            velocities.push(values[i] - values[i - 1]);
        }
        const accelerations = [];
        for (let i = 1; i < velocities.length; i++) {
            accelerations.push(velocities[i] - velocities[i - 1]);
        }
        const lastAcceleration = accelerations[accelerations.length - 1] || 0;
        const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / (accelerations.length || 1);
        let pred = 'B';
        let confidence = 0;
        if (Math.abs(lastAcceleration) > Math.abs(avgAcceleration) * 1.5) {
            // Gia tốc đang tăng
            const lastValue = values[values.length - 1];
            pred = lastValue > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(lastAcceleration) / 3, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            acceleration: lastAcceleration,
            avgAcceleration: avgAcceleration,
            velocities: velocities
        };
    }

    // ============================================================
    // NHÓM 10: HỒI QUY (3 phương pháp)
    // ============================================================

    // 10.1 Linear Regression
    regressionAnalysis(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        const values = history.split('').map((c, i) => ({
            x: i,
            y: c === 'B' ? 1 : c === 'P' ? -1 : 0
        }));
        const n = values.length;
        const sumX = values.reduce((a, b) => a + b.x, 0);
        const sumY = values.reduce((a, b) => a + b.y, 0);
        const sumXY = values.reduce((a, b) => a + b.x * b.y, 0);
        const sumX2 = values.reduce((a, b) => a + b.x * b.x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const nextX = n;
        const predictionValue = slope * nextX + intercept;
        let pred = 'B';
        let confidence = 0;
        const rSquared = this.calculateRSquared(values, slope, intercept);
        if (Math.abs(predictionValue) > 0.2 && rSquared > 0.3) {
            pred = predictionValue > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(predictionValue) * rSquared, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            slope: slope,
            intercept: intercept,
            rSquared: rSquared,
            predictionValue: predictionValue
        };
    }

    // 10.2 Adaptive Regression
    adaptiveRegression(history) {
        if (history.length < 15) return this.regressionAnalysis(history);
        const results = [];
        const windowSize = Math.min(10, history.length);
        for (let i = windowSize; i < history.length; i++) {
            const subHistory = history.substring(0, i);
            const result = this.regressionAnalysis(subHistory);
            results.push(result);
        }
        const avgSlope = results.reduce((a, b) => a + b.slope, 0) / results.length;
        const lastSlope = results[results.length - 1]?.slope || 0;
        const slopeDiff = lastSlope - avgSlope;
        let pred = 'B';
        let confidence = 0;
        if (Math.abs(slopeDiff) > 0.1) {
            pred = slopeDiff > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(slopeDiff) * 2, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            avgSlope: avgSlope,
            lastSlope: lastSlope,
            slopeDiff: slopeDiff
        };
    }

    // 10.3 Polynomial Regression
    polynomialRegression(history) {
        if (history.length < 15) return this.regressionAnalysis(history);
        const values = history.split('').map((c, i) => ({
            x: i,
            y: c === 'B' ? 1 : c === 'P' ? -1 : 0
        }));
        const n = values.length;
        // Bậc 2
        const sumX = values.reduce((a, b) => a + b.x, 0);
        const sumX2 = values.reduce((a, b) => a + b.x * b.x, 0);
        const sumX3 = values.reduce((a, b) => a + b.x * b.x * b.x, 0);
        const sumX4 = values.reduce((a, b) => a + b.x * b.x * b.x * b.x, 0);
        const sumY = values.reduce((a, b) => a + b.y, 0);
        const sumXY = values.reduce((a, b) => a + b.x * b.y, 0);
        const sumX2Y = values.reduce((a, b) => a + b.x * b.x * b.y, 0);
        // Giải hệ phương trình bậc 2
        const det = n * sumX2 * sumX4 + sumX * sumX3 * sumX2 + sumX2 * sumX * sumX3 -
                   sumX2 * sumX2 * sumX2 - sumX * sumX * sumX4 - n * sumX3 * sumX3;
        if (det === 0) return this.regressionAnalysis(history);
        const a = (sumY * (sumX2 * sumX4 - sumX3 * sumX3) +
                  sumX * (sumX3 * sumX2Y - sumX4 * sumXY) +
                  sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y)) / det;
        const b = (n * (sumX3 * sumX2Y - sumX4 * sumXY) +
                  sumX * (sumY * sumX4 - sumX2 * sumX2Y) +
                  sumX2 * (sumX2 * sumXY - sumY * sumX3)) / det;
        const c = (n * (sumX2 * sumX2Y - sumX3 * sumXY) +
                  sumX * (sumX3 * sumY - sumX2 * sumXY) +
                  sumX2 * (sumXY * sumX2 - sumX * sumX2Y)) / det;
        const nextX = n;
        const predictionValue = a + b * nextX + c * nextX * nextX;
        let pred = 'B';
        let confidence = 0;
        if (Math.abs(predictionValue) > 0.3) {
            pred = predictionValue > 0 ? 'B' : 'P';
            confidence = Math.min(Math.abs(predictionValue), 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            a: a,
            b: b,
            c: c,
            predictionValue: predictionValue
        };
    }

    // ============================================================
    // NHÓM 11: PHÂN CỤM (3 phương pháp)
    // ============================================================

    // 11.1 Cluster Analysis
    clusterAnalysis(history) {
        if (history.length < 8) return { prediction: 'B', confidence: 0 };
        const clusters = { 'B': [], 'P': [], 'T': [] };
        let currentCluster = [];
        let currentChar = history[0];
        for (const char of history) {
            if (char === currentChar) {
                currentCluster.push(char);
            } else {
                if (currentCluster.length > 0) {
                    clusters[currentChar].push(currentCluster.length);
                }
                currentChar = char;
                currentCluster = [char];
            }
        }
        if (currentCluster.length > 0) {
            clusters[currentChar].push(currentCluster.length);
        }
        const avgSizes = {};
        const stdSizes = {};
        for (const char of ['B', 'P', 'T']) {
            if (clusters[char].length > 0) {
                avgSizes[char] = clusters[char].reduce((a, b) => a + b, 0) / clusters[char].length;
                const variance = clusters[char].reduce((a, b) => a + Math.pow(b - avgSizes[char], 2), 0) / clusters[char].length;
                stdSizes[char] = Math.sqrt(variance);
            } else {
                avgSizes[char] = 0;
                stdSizes[char] = 0;
            }
        }
        let pred = 'B';
        let maxSize = 0;
        for (const [char, size] of Object.entries(avgSizes)) {
            if (size > maxSize) {
                maxSize = size;
                pred = char;
            }
        }
        const confidence = Math.min(maxSize / 4, 0.8);
        return {
            prediction: pred,
            confidence: confidence,
            avgSizes: avgSizes,
            stdSizes: stdSizes,
            clusters: clusters
        };
    }

    // 11.2 Hierarchical Clustering
    hierarchicalCluster(history) {
        if (history.length < 12) return this.clusterAnalysis(history);
        // Phân tích hierarchical
        const windows = [];
        const windowSize = Math.min(8, history.length);
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            windows.push(history.substring(i, i + windowSize));
        }
        const results = [];
        for (const win of windows) {
            const result = this.clusterAnalysis(win);
            results.push(result);
        }
        const avgConfidence = results.reduce((a, b) => a + b.confidence, 0) / results.length;
        const predictions = results.map(r => r.prediction);
        const counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const pred of predictions) {
            if (counts[pred] !== undefined) counts[pred]++;
        }
        let pred = 'B';
        let maxCount = 0;
        for (const [char, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                pred = char;
            }
        }
        const confidence = Math.min(maxCount / results.length * 1.2, 0.85);
        return {
            prediction: pred,
            confidence: confidence,
            clusterCount: results.length,
            distribution: counts
        };
    }

    // 11.3 Density-based Clustering
    densityCluster(history) {
        if (history.length < 10) return this.clusterAnalysis(history);
        // Tìm mật độ xuất hiện
        const density = {};
        const windowSize = 5;
        for (let i = 0; i < history.length - windowSize + 1; i++) {
            const sub = history.substring(i, i + windowSize);
            const key = sub;
            if (!density[key]) density[key] = 0;
            density[key]++;
        }
        // Tìm vùng mật độ cao
        let maxDensity = 0;
        let densePattern = '';
        for (const [pattern, count] of Object.entries(density)) {
            if (count > maxDensity) {
                maxDensity = count;
                densePattern = pattern;
            }
        }
        let pred = 'B';
        let confidence = 0;
        if (densePattern && maxDensity > 2) {
            const lastChar = densePattern[densePattern.length - 1];
            pred = lastChar;
            confidence = Math.min(maxDensity / 5, 0.8);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            maxDensity: maxDensity,
            densePattern: densePattern
        };
    }

    // ============================================================
    // NHÓM 12: PHÂN TÍCH KỸ THUẬT (4 phương pháp)
    // ============================================================

    // 12.1 Support & Resistance
    supportResistance(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        const values = history.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        // Tìm support (điểm thấp) và resistance (điểm cao)
        const supports = [];
        const resistances = [];
        for (let i = 2; i < values.length - 2; i++) {
            if (values[i] < values[i-1] && values[i] < values[i-2] &&
                values[i] < values[i+1] && values[i] < values[i+2]) {
                supports.push({ index: i, value: values[i] });
            }
            if (values[i] > values[i-1] && values[i] > values[i-2] &&
                values[i] > values[i+1] && values[i] > values[i+2]) {
                resistances.push({ index: i, value: values[i] });
            }
        }
        const lastValue = values[values.length - 1];
        let pred = 'B';
        let confidence = 0;
        if (supports.length > 0 && resistances.length > 0) {
            const lastSupport = supports[supports.length - 1];
            const lastResistance = resistances[resistances.length - 1];
            if (lastValue <= lastSupport.value + 0.2) {
                // Gần support -> bounce up
                pred = 'B';
                confidence = 0.6;
            } else if (lastValue >= lastResistance.value - 0.2) {
                // Gần resistance -> bounce down
                pred = 'P';
                confidence = 0.6;
            } else {
                pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
                confidence = 0.3;
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.25;
        }
        return {
            prediction: pred,
            confidence: confidence,
            supports: supports,
            resistances: resistances
        };
    }

    // 12.2 Pivot Points
    pivotAnalysis(history) {
        if (history.length < 10) return this.supportResistance(history);
        const values = history.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        const n = values.length;
        const high = Math.max(...values);
        const low = Math.min(...values);
        const close = values[n - 1];
        const pivot = (high + low + close) / 3;
        const r1 = 2 * pivot - low;
        const s1 = 2 * pivot - high;
        let pred = 'B';
        let confidence = 0;
        if (close > pivot) {
            pred = 'B';
            confidence = Math.min((close - pivot) / (r1 - pivot || 1), 0.7);
        } else if (close < pivot) {
            pred = 'P';
            confidence = Math.min((pivot - close) / (pivot - s1 || 1), 0.7);
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            pivot: pivot,
            r1: r1,
            s1: s1,
            close: close
        };
    }

    // 12.3 Fibonacci Retracement
    fibonacciAnalysis(history) {
        if (history.length < 10) return { prediction: 'B', confidence: 0 };
        const values = history.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        const high = Math.max(...values);
        const low = Math.min(...values);
        const diff = high - low;
        const levels = {
            '0.236': high - diff * 0.236,
            '0.382': high - diff * 0.382,
            '0.5': high - diff * 0.5,
            '0.618': high - diff * 0.618,
            '0.786': high - diff * 0.786
        };
        const lastValue = values[values.length - 1];
        let pred = 'B';
        let confidence = 0;
        // Xác định vị trí hiện tại
        let currentLevel = 0;
        for (const [level, value] of Object.entries(levels)) {
            if (Math.abs(lastValue - value) < 0.1) {
                currentLevel = parseFloat(level);
                break;
            }
        }
        if (currentLevel > 0) {
            if (currentLevel < 0.5) {
                // Ở dưới 0.5 -> tăng
                pred = 'B';
                confidence = 0.6;
            } else if (currentLevel > 0.5) {
                // Ở trên 0.5 -> giảm
                pred = 'P';
                confidence = 0.6;
            }
        } else {
            pred = this.getMaxKeyCounts(history, ['B', 'P', 'T']);
            confidence = 0.3;
        }
        return {
            prediction: pred,
            confidence: confidence,
            levels: levels,
            currentLevel: currentLevel,
            lastValue: lastValue
        };
    }

    // 12.4 Harmonic Patterns
    harmonicPattern(history) {
        if (history.length < 12) return this.supportResistance(history);
        // Tìm harmonic patterns (AB=CD, Gartley, etc.)
        const values = history.split('').map(c => c === 'B' ? 1 : c === 'P' ? -1 : 0);
        const peaks = [];
        const troughs = [];
        for (let i = 2; i < values.length - 2; i++) {
            if (values[i] > values[i-1] && values[i] > values[i-2] &&
                values[i] > values[i+1] && values[i] > values[i+2]) {
                peaks.push({ index: i, value: values[i] });
            }
            if (values[i] < values[i-1] && values[i] < values[i-2] &&
                values[i] < values[i+1] && values[i] < values[i+2]) {
                troughs.push({ index: i, value: values[i] });
            }
        }
        // Tìm AB=CD pattern
        if (peaks.length >= 2 && troughs.length >= 2) {
            const lastPeak = peaks[peaks.length - 1];
            const lastTrough = troughs[troughs.length - 1];
            const prevPeak = peaks[peaks.length - 2];
            const prevTrough = troughs[troughs.length - 2];
            const ab = Math.abs(prevPeak.value - prevTrough.value);
            const cd = Math.abs(lastPeak.value - lastTrough.value);
            if (Math.abs(ab - cd) < 0.1) {
                let pred = 'B';
                let confidence = 0;
                if (lastPeak.index > lastTrough.index) {
                    pred = 'P';
                    confidence = 0.65;
                } else {
                    pred = 'B';
                    confidence = 0.65;
                }
                return {
                    prediction: pred,
                    confidence: confidence,
                    pattern: 'AB=CD',
                    ab: ab,
                    cd: cd
                };
            }
        }
        return this.supportResistance(history);
    }

    // ============================================================
    // NHÓM 13: PHÂN TÍCH KHÁC (3 phương pháp)
    // ============================================================

    // 13.1 Pair Analysis
    pairAnalysis(history) {
        if (history.length < 4) return { prediction: 'B', confidence: 0 };
        const pairs = {};
        const chars = ['B', 'P', 'T'];
        for (const c1 of chars) {
            for (const c2 of chars) {
                pairs[c1 + c2] = 0;
            }
        }
        for (let i = 0; i < history.length - 1; i++) {
            const pair = history[i] + history[i + 1];
            if (pairs[pair] !== undefined) pairs[pair]++;
        }
        const lastPair = history.slice(-2);
        const nextCounts = {};
        for (const c of chars) {
            const pair = lastPair + c;
            nextCounts[c] = pairs[pair] || 0;
        }
        let pred = 'B';
        let maxCount = 0;
        for (const [char, count] of Object.entries(nextCounts)) {
            if (count > maxCount) {
                maxCount = count;
                pred = char;
            }
        }
        const confidence = Math.min(maxCount / 5, 0.8);
        return {
            prediction: pred,
            confidence: confidence,
            pairs: pairs,
            lastPair: lastPair
        };
    }

    // 13.2 Triple Analysis
    tripleAnalysis(history) {
        if (history.length < 5) return this.pairAnalysis(history);
        const triples = {};
        const chars = ['B', 'P', 'T'];
        for (const c1 of chars) {
            for (const c2 of chars) {
                for (const c3 of chars) {
                    triples[c1 + c2 + c3] = 0;
                }
            }
        }
        for (let i = 0; i < history.length - 2; i++) {
            const triple = history[i] + history[i + 1] + history[i + 2];
            if (triples[triple] !== undefined) triples[triple]++;
        }
        const lastTriple = history.slice(-3);
        const nextCounts = {};
        for (const c of chars) {
            const triple = lastTriple + c;
            nextCounts[c] = triples[triple] || 0;
        }
        let pred = 'B';
        let maxCount = 0;
        for (const [char, count] of Object.entries(nextCounts)) {
            if (count > maxCount) {
                maxCount = count;
                pred = char;
            }
        }
        const confidence = Math.min(maxCount / 3, 0.8);
        return {
            prediction: pred,
            confidence: confidence,
            triples: triples,
            lastTriple: lastTriple
        };
    }

    // 13.3 Distribution Analysis
    distributionAnalysis(history) {
        if (history.length < 8) return this.pairAnalysis(history);
        const chars = ['B', 'P', 'T'];
        const recent = history.slice(-12);
        const counts = {};
        const expected = {};
        for (const c of chars) {
            counts[c] = (recent.match(new RegExp(c, 'g')) || []).length;
            expected[c] = recent.length / 3;
        }
        const deviations = {};
        for (const c of chars) {
            deviations[c] = Math.abs(counts[c] - expected[c]) / expected[c];
        }
        let pred = 'B';
        let maxDeviation = 0;
        for (const [char, dev] of Object.entries(deviations)) {
            if (dev > maxDeviation) {
                maxDeviation = dev;
                pred = char;
            }
        }
        const confidence = Math.min(maxDeviation * 0.5, 0.8);
        return {
            prediction: pred,
            confidence: confidence,
            deviations: deviations,
            counts: counts,
            expected: expected
        };
    }

    // ============================================================
    // PHƯƠNG PHÁP TỔNG HỢP - 30+ PHƯƠNG PHÁP
    // ============================================================

    comprehensiveAnalysis(history) {
        if (history.length < this.config.minDataPoints) {
            return {
                prediction: 'N/A',
                winRate: 0,
                confidence: 0,
                details: 'Chưa đủ dữ liệu',
                methods: {},
                methodCount: 0
            };
        }

        // ===== THỰC HIỆN TẤT CẢ PHƯƠNG PHÁP =====
        const methods = {
            // Nhóm 1: Tần suất (4)
            frequency: this.frequencyAnalysis(history),
            frequency_weighted: this.frequencyWeightedAnalysis(history),
            sliding_window: this.slidingWindowFrequency(history),
            normal_distribution: this.normalDistributionAnalysis(history),
            
            // Nhóm 2: Xu hướng (4)
            recent: this.recentTrendAnalysis(history),
            time_weighted: this.timeWeightedTrend(history),
            exponential: this.exponentialTrend(history),
            trendline: this.trendlineAnalysis(history),
            
            // Nhóm 3: Pattern (9)
            streak: this.streakAnalysis(history),
            zigzag: this.zigzagAnalysis(history),
            repeat: this.repeatPatternAnalysis(history),
            pattern_2_2: this.twoTwoPattern(history),
            pattern_3_3: this.threeThreePattern(history),
            pattern_4_4: this.fourFourPattern(history),
            pattern_123: this.pattern123(history),
            pattern_212: this.pattern212(history),
            composite_pattern: this.compositePatternAnalysis(history),
            
            // Nhóm 4: Markov (4)
            markov1: this.markov1Analysis(history),
            markov2: this.markov2Analysis(history),
            markov3: this.markov3Analysis(history),
            markov_adaptive: this.markovAdaptive(history),
            
            // Nhóm 5: Bayesian (3)
            bayesian: this.bayesianAnalysis(history),
            bayesian_adaptive: this.bayesianAdaptive(history),
            posterior: this.posteriorProbability(history),
            
            // Nhóm 6: Neural (3)
            neural: this.neuralAnalysis(history),
            deep_neural: this.deepNeuralAnalysis(history),
            lstm: this.lstmAnalysis(history),
            
            // Nhóm 7: Chuỗi (4)
            gap: this.gapAnalysis(history),
            correlation: this.correlationAnalysis(history),
            autocorrelation: this.autocorrelationAnalysis(history),
            cross_correlation: this.crossCorrelationAnalysis(history),
            
            // Nhóm 8: Entropy (3)
            entropy: this.entropyAnalysis(history),
            adaptive_entropy: this.adaptiveEntropy(history),
            information_gain: this.informationGain(history),
            
            // Nhóm 9: Động lượng (3)
            momentum: this.momentumAnalysis(history),
            adaptive_momentum: this.adaptiveMomentum(history),
            acceleration: this.accelerationAnalysis(history),
            
            // Nhóm 10: Hồi quy (3)
            regression: this.regressionAnalysis(history),
            adaptive_regression: this.adaptiveRegression(history),
            polynomial: this.polynomialRegression(history),
            
            // Nhóm 11: Phân cụm (3)
            cluster: this.clusterAnalysis(history),
            hierarchical: this.hierarchicalCluster(history),
            density: this.densityCluster(history),
            
            // Nhóm 12: Kỹ thuật (4)
            support_resistance: this.supportResistance(history),
            pivot: this.pivotAnalysis(history),
            fibonacci: this.fibonacciAnalysis(history),
            harmonic: this.harmonicPattern(history),
            
            // Nhóm 13: Khác (3)
            pair: this.pairAnalysis(history),
            triple: this.tripleAnalysis(history),
            distribution: this.distributionAnalysis(history)
        };

        // ===== TÍNH ĐIỂM =====
        const scores = { 'B': 0, 'P': 0, 'T': 0 };
        const confidences = { 'B': 0, 'P': 0, 'T': 0 };
        const methodResults = {};
        let totalWeight = 0;
        let validMethods = 0;

        for (const [name, result] of Object.entries(methods)) {
            if (result && result.prediction && result.confidence && result.confidence > 0.1) {
                const weight = this.weights[name] || 0.03;
                const pred = result.prediction;
                const conf = Math.min(result.confidence, 0.9);
                
                scores[pred] += weight * 100 * conf;
                confidences[pred] += weight * conf;
                methodResults[name] = { 
                    pred: pred, 
                    conf: Math.round(conf * 100) / 100,
                    weight: Math.round(weight * 100) / 100
                };
                totalWeight += weight;
                validMethods++;
            }
        }

        // ===== CHỌN DỰ ĐOÁN =====
        let maxScore = 0;
        let prediction = 'B';
        let totalConfidence = 0;

        for (const char of ['B', 'P', 'T']) {
            if (scores[char] > maxScore) {
                maxScore = scores[char];
                prediction = char;
                totalConfidence = confidences[char];
            }
        }

        // ===== TÍNH WIN RATE =====
        let winRate = Math.round((totalConfidence / (totalWeight || 1)) * 100);
        winRate = Math.max(25, Math.min(75, winRate));
        
        // Điều chỉnh win rate dựa trên số lượng methods
        if (validMethods > 20) winRate = Math.min(winRate + 5, 80);
        else if (validMethods > 10) winRate = Math.min(winRate + 3, 75);
        else if (validMethods < 5) winRate = Math.max(winRate - 5, 25);

        // ===== LƯU LỊCH SỬ =====
        this.detailedHistory.push({
            session: this.session + 1,
            prediction: prediction,
            winRate: winRate,
            confidence: totalConfidence / (totalWeight || 1),
            methods: methodResults,
            scores: scores,
            validMethods: validMethods,
            totalMethods: Object.keys(methods).length
        });

        return {
            prediction: prediction,
            winRate: winRate,
            confidence: totalConfidence / (totalWeight || 1),
            methods: methodResults,
            scores: scores,
            totalGames: history.length,
            validMethods: validMethods,
            totalMethods: Object.keys(methods).length
        };
    }

    // ============================================================
    // CẬP NHẬT PHIÊN MỚI
    // ============================================================

    newSession(history) {
        this.session++;
        this.history = history;
        
        this.updateStats(history);
        const result = this.comprehensiveAnalysis(history);
        
        const predictionData = {
            session: this.session,
            timestamp: new Date().toISOString(),
            table: this.tableName,
            prediction: result.prediction,
            winRate: result.winRate,
            confidence: result.confidence,
            methods: result.methods,
            totalGames: result.totalGames,
            validMethods: result.validMethods,
            totalMethods: result.totalMethods
        };
        
        this.predictions.push(predictionData);
        this.winRateHistory.push({
            session: this.session,
            winRate: result.winRate,
            prediction: result.prediction
        });
        
        return predictionData;
    }

    // ============================================================
    // THỐNG KÊ
    // ============================================================

    updateStats(history) {
        // Cập nhật counts
        this.stats.counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (const char of history) {
            if (this.stats.counts[char] !== undefined) {
                this.stats.counts[char]++;
            }
        }
        
        // Cập nhật weighted counts
        this.stats.weighted_counts = { 'B': 0, 'P': 0, 'T': 0 };
        for (let i = 0; i < history.length; i++) {
            const char = history[i];
            const weight = (i + 1) / history.length;
            if (this.stats.weighted_counts[char] !== undefined) {
                this.stats.weighted_counts[char] += weight;
            }
        }
        
        // Cập nhật streaks
        let currentStreak = 1;
        for (let i = 1; i < history.length; i++) {
            if (history[i] === history[i-1]) {
                currentStreak++;
            } else {
                const prev = history[i-1];
                if (currentStreak > this.stats.maxStreaks[prev]) {
                    this.stats.maxStreaks[prev] = currentStreak;
                }
                if (currentStreak < this.stats.minStreaks[prev]) {
                    this.stats.minStreaks[prev] = currentStreak;
                }
                currentStreak = 1;
            }
        }
        const last = history[history.length - 1];
        if (currentStreak > this.stats.maxStreaks[last]) {
            this.stats.maxStreaks[last] = currentStreak;
        }
        if (currentStreak < this.stats.minStreaks[last]) {
            this.stats.minStreaks[last] = currentStreak;
        }
        
        // Cập nhật gaps
        const lastPos = { 'B': -1, 'P': -1, 'T': -1 };
        for (let i = 0; i < history.length; i++) {
            const char = history[i];
            if (lastPos[char] !== -1) {
                this.stats.gaps[char].push(i - lastPos[char] - 1);
            }
            lastPos[char] = i;
        }
        this.stats.lastPositions = lastPos;
    }

    getDetailedStats() {
        const total = this.predictions.length;
        if (total === 0) {
            return {
                total: 0,
                avgWinRate: 0,
                accuracy: 0,
                currentSession: 0,
                lastPredictions: [],
                methodPerformance: {},
                stats: this.stats
            };
        }
        
        const avgWinRate = this.winRateHistory.reduce((sum, item) => sum + item.winRate, 0) / total;
        
        // Phân tích hiệu suất theo phương pháp
        const performance = {};
        for (const pred of this.predictions) {
            if (pred.methods) {
                for (const [method, data] of Object.entries(pred.methods)) {
                    if (!performance[method]) {
                        performance[method] = { 
                            used: 0, 
                            avgConfidence: 0, 
                            predictions: {},
                            totalConfidence: 0
                        };
                    }
                    performance[method].used++;
                    performance[method].totalConfidence += data.conf || 0;
                    if (!performance[method].predictions[data.pred]) {
                        performance[method].predictions[data.pred] = 0;
                    }
                    performance[method].predictions[data.pred]++;
                }
            }
        }
        
        for (const method of Object.keys(performance)) {
            if (performance[method].used > 0) {
                performance[method].avgConfidence = performance[method].totalConfidence / performance[method].used;
                delete performance[method].totalConfidence;
            }
        }
        
        const lastPredictions = this.predictions.slice(-10).map(p => ({
            session: p.session,
            prediction: p.prediction,
            winRate: p.winRate
        }));
        
        return {
            total: total,
            avgWinRate: Math.round(avgWinRate),
            currentSession: this.session,
            lastPredictions: lastPredictions,
            methodPerformance: performance,
            stats: this.stats,
            predictions: this.predictions
        };
    }

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================

    getMaxKey(obj) {
        let max = -Infinity;
        let key = 'B';
        for (const [k, v] of Object.entries(obj)) {
            if (v > max) {
                max = v;
                key = k;
            }
        }
        return key;
    }
    
    getMaxKeyCounts(history, keys) {
        const counts = {};
        for (const k of keys) counts[k] = 0;
        for (const char of history) {
            if (counts[char] !== undefined) counts[char]++;
        }
        return this.getMaxKey(counts);
    }

    calculateRSquared(values, slope, intercept) {
        const meanY = values.reduce((a, b) => a + b.y, 0) / values.length;
        let ssTotal = 0;
        let ssResidual = 0;
        for (const v of values) {
            const predicted = slope * v.x + intercept;
            ssTotal += Math.pow(v.y - meanY, 2);
            ssResidual += Math.pow(v.y - predicted, 2);
        }
        return 1 - (ssResidual / (ssTotal || 1));
    }

    calculateConditionalEntropy(history, position) {
        const pairs = {};
        for (let i = position; i < history.length; i++) {
            const key = history[i - position] + history[i];
            if (!pairs[key]) pairs[key] = 0;
            pairs[key]++;
        }
        let entropy = 0;
        const total = Object.values(pairs).reduce((a, b) => a + b, 0);
        for (const count of Object.values(pairs)) {
            const prob = count / total;
            entropy -= prob * Math.log2(prob);
        }
        return entropy;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}

module.exports = AdvancedBaccaratPredictor;