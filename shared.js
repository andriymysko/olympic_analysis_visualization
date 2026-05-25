/**
 * shared.js - Lògica comuna per a totes les pàgines de la visualització
 */

const DATA_PATHS = {
    medals_imf: 'cleaned/olympic_medal_counts_modern_imf_mergeable.csv',
    countries: 'cleaned/countries_clean.csv',
    cycle_analysis: 'cleaned/sports_spending_medals_cycle_analysis_ready.csv'
};

/**
 * Utilitat estadística per calcular la línia de tendència i R²
 */
function calculateRegression(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0, line: [] };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    points.forEach(p => {
        sumX += p.x; sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
        sumY2 += p.y * p.y;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Pearson correlation
    const r = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r2 = r * r;

    // Generar punts per a la línia (min i max X)
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    
    return {
        slope, intercept, r2,
        line: [
            { x: minX, y: slope * minX + intercept },
            { x: maxX, y: slope * maxX + intercept }
        ]
    };
}

/**
 * Carrega dades genèriques i gestiona errors
 */
async function loadDataset(path) {
    // Si les dades ja estan carregades als bundles
    if (path.includes('medal_counts') && typeof OLYMPIC_DATA !== 'undefined') {
        return OLYMPIC_DATA;
    }
    if (path.includes('cycle_analysis') && typeof CYCLE_DATA !== 'undefined') {
        return CYCLE_DATA;
    }
    
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.warn("No s'ha pogut fer fetch (possiblement CORS local). Intentant carregar via bundle...");
        if (path.includes('medal_counts') && typeof OLYMPIC_DATA !== 'undefined') return OLYMPIC_DATA;
        if (path.includes('cycle_analysis') && typeof CYCLE_DATA !== 'undefined') return CYCLE_DATA;
        console.error("Error crític: No hi ha dades disponibles.", error);
        return [];
    }
}

/**
 * Parser de CSV molt bàsic (substituïble per d3.csv si cal més potència)
 */
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : null;
            return obj;
        }, {});
    });
}

// Global state / Helpers si cal
const OlympicApp = {
    formatCurrency: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val),
    colors: {
        accent: '#22d3ee',
        gold: '#fbbf24',
        silver: '#94a3b8',
        bronze: '#d97706',
        danger: '#ef4444'
    }
};
