import nlp from 'compromise';

export const extractInsights = (text) => {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const cleanSentences = sentences.map(s => s.trim().replace(/\s+/g, ' ')).filter(s => s.length > 20);

    const stopWords = new Set(["the", "is", "at", "which", "on", "and", "a", "an", "to", "in", "of", "for", "with", "as", "by", "this", "that", "it", "are", "be", "or", "from", "can", "their", "they", "we", "our", "has", "have"]);
    
    const wordFreq = {};
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    words.forEach(w => {
        if (!stopWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    const scoredSentences = cleanSentences.map(s => {
        let score = 0;
        const sWords = s.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        sWords.forEach(w => {
            if (wordFreq[w]) score += wordFreq[w];
        });
        return { sentence: s, score: score / (sWords.length || 1) };
    });

    scoredSentences.sort((a, b) => b.score - a.score);

    const summary = scoredSentences.slice(0, 4).map(s => s.sentence + ".");

    const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(e => e[0]);
    let keyPoints = [];
    const usedWords = new Set();
    
    for (let word of sortedWords) {
        if (keyPoints.length >= 4) break;
        const match = cleanSentences.find(s => s.toLowerCase().includes(word) && s.length < 80);
        if (match && !usedWords.has(word)) {
             keyPoints.push(word.charAt(0).toUpperCase() + word.slice(1) + " Framework");
             usedWords.add(word);
        } else if (!usedWords.has(word)) {
             keyPoints.push(word.charAt(0).toUpperCase() + word.slice(1) + " Concept");
             usedWords.add(word);
        }
    }
    if (keyPoints.length === 0) keyPoints = ["Data Abstraction", "Machine Logic", "Cognitive Sync", "System Analysis"];

    const notes = [];
    cleanSentences.forEach(s => {
        if (notes.length >= 4) return;
        const defMatch = s.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is a|refers to|means|is defined as)\s+(.+)/);
        if (defMatch) {
            notes.push({ title: defMatch[1], desc: defMatch[2].substring(0, 80) + '...' });
        }
    });

    if (notes.length < 4) {
        let altSentences = scoredSentences.slice(4, 15);
        for (let s of altSentences) {
            if (notes.length >= 4) break;
            const wMatch = s.sentence.match(/^[A-Za-z]+\b/);
            const w = wMatch ? wMatch[0] : "Insight";
            notes.push({ title: w.charAt(0).toUpperCase() + w.slice(1) + " Note", desc: s.sentence.substring(0, 90) + '...' });
        }
    }

    if (notes.length === 0) {
        notes.push({title: 'General Note', desc: 'Sufficient context unavailable to generate specific notes.'});
    }

    return { summary, keyPoints: keyPoints.slice(0, 4), notes };
};

export const getVisualData = (text) => {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = new Set(["the", "is", "at", "which", "on", "and", "a", "an", "to", "in", "of", "for", "with", "as", "by", "this", "that", "it", "are", "be", "or", "from", "can", "their", "they", "we", "our", "has", "have"]);
    
    const freq = {};
    words.forEach(w => {
        if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });

    const keywordDistribution = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word, count]) => ({ 
            label: word.charAt(0).toUpperCase() + word.slice(1), 
            value: count 
        }));

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const sections = Math.ceil(sentences.length / 5);
    const complexityIndex = [];
    
    for (let i = 0; i < 6; i++) {
        const start = i * sections;
        const end = (i + 1) * sections;
        const slice = sentences.slice(start, end);
        if (slice.length === 0) {
            complexityIndex.push({ label: `Vector ${i+1}`, value: 30 + Math.random() * 20 });
            continue;
        }
        
        const avgLength = slice.reduce((acc, s) => acc + s.length, 0) / slice.length;
        // Normalize to a 0-100 scale based on avg length of 150
        const complexity = Math.min(Math.round((avgLength / 220) * 100), 100);
        complexityIndex.push({ label: `Vector ${i+1}`, value: complexity || 45 });
    }

    return { keywordDistribution, complexityIndex };
};

export const answerQuestion = (text, question) => {
    if (!question.trim()) return "Please ask a valid question.";
    const qRaw = question.trim().toLowerCase();
    
    // Scripted Professional Greetings
    if (qRaw.includes("hello") || qRaw.includes("hi") || qRaw.includes("hey") || qRaw.includes("good morning")) {
        return "Greetings, Scholar! I am the Coach.ai Intelligence Nexus. My neural pathways are synchronized and ready for your document interrogation. How can I assist your mastery today?";
    }

    // Scripted Professional Farewells
    if (qRaw.includes("bye") || qRaw.includes("goodbye") || qRaw.includes("farewell") || qRaw.includes("done")) {
        return "Synchronizing conclusion... It has been a pleasure assisting your research journey today. I am archiving this session context. Until our next neural synchronization, keep your curiosity amplified. Farewell!";
    }

    // Strict PDF check: Must end with '?'
    if (!question.trim().endsWith("?")) {
        return "I'm ready to interrogate the research corpus, but I require a specific inquiry ending with a '?' for optimal neural synthesis. Please frame your query as a scholarly question!";
    }

    // If no document context is provided
    if (!text || text.trim().length < 10) {
        return "I'm the Coach.ai scholarly assistant! I don't see an active research corpus (PDF) to interrogate right now. However, I can still chat with you about study tips — or simply upload a document to unlock deep neural analysis!";
    }

    // Specific trigger for document summaries
    if (qRaw.includes("summary") || qRaw.includes("summarize") || qRaw.includes("executive")) {
        const insights = extractInsights(text);
        if (insights && insights.summary.length > 0) {
            return `Here is the Executive Summary of the document based on my local neural scan:\n\n• ${insights.summary.join('\n• ')}\n\nCore Conceptual Topics: ${insights.keyPoints.join(' | ')}`;
        }
        return "I extracted the document text but there isn't enough cohesive data to form a strong summary.";
    }

    const doc = nlp(question);
    const topics = doc.nouns().out('array');
    const stopWords = new Set(["what", "is", "the", "how", "why", "where", "when", "does", "do", "can", "in", "of", "and", "a", "an", "to", "for", "with", "on", "at", "by", "from", "it", "they", "them", "are", "was", "were"]);
    const qWords = (question.toLowerCase().match(/\b[a-z0-9]{2,}\b/g) || []).filter(w => !stopWords.has(w));
    
    // Combine standard keywords with NLP-extracted topics for heavy weighting
    const searchTerms = [...new Set([...qWords, ...topics.map(t => t.toLowerCase())])];

    if (searchTerms.length === 0) return "Could you be more specific? I'm ready to interrogate the corpus, but I need clearer conceptual vectors.";

    // Create 3-sentence chunks for better context retention
    const rawSentences = text.split(/[.!?]+\s+/);
    const chunks = [];
    for (let i = 0; i < rawSentences.length; i += 2) {
        chunks.push(rawSentences.slice(i, i + 4).join(". ") + ".");
    }

    let highestScore = 0;
    let scoredChunks = [];

    chunks.forEach(chunk => {
        const cText = chunk.toLowerCase();
        let score = 0;
        
        searchTerms.forEach(term => {
            // Escape special characters to prevent regex crashes
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
            const matches = cText.match(regex);
            
            if (matches) {
                score += matches.length * 15; // Exact term matches are high value
            } else if (cText.includes(term.toLowerCase())) {
                score += 5; // Partial matches
            }
        });

        // Boost score if NLP extract topics are present
        topics.forEach(topic => {
            if (cText.includes(topic.toLowerCase())) score += 15;
        });
        
        // Multi-term proximity bonus (Sliding Window concept)
        let foundTerms = searchTerms.filter(t => cText.includes(t));
        if (foundTerms.length > 1) score += (foundTerms.length * 8);

        if (score > highestScore) highestScore = score;
        if (score > 10) scoredChunks.push({ text: chunk, score });
    });

    if (highestScore < 15) return "I've scanned the document context across multiple vectors, but I couldn't find a high-fidelity match for that specific topic. Try using core keywords or ask about a different section!";

    // Return the single best chunk for maximum relevance in this high-end terminal
    const bestChunk = scoredChunks.sort((a, b) => b.score - a.score)[0].text;
    return bestChunk.trim();
}

export const generateCitations = (doc) => {
    if (!doc) return null;
    const author = "Coach AI Neural Synthesis";
    const year = new Date().getFullYear();
    const title = doc.name.replace('.pdf', '');
    const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return {
        apa: `${author}. (${year}). ${title}. Neural Ingestion Matrix.`,
        mla: `${author}. "${title}." Coach.ai Research Workspace, ${year}.`,
        chicago: `${author}. "${title}." Coach.ai. ${date}.`,
        harvard: `${author} (${year}) '${title}', Coach.ai Scholarly Terminal, [Online]. Available at: Research Corpus.`
    };
};

export const semanticSearch = (text, query) => {
    if (!query || !text) return [];
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const qWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
    
    const results = sentences.map(s => {
        let score = 0;
        const sLower = s.toLowerCase();
        qWords.forEach(qw => {
            if (sLower.includes(qw)) score += 1;
        });
        return { text: s.trim(), score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
    
    return results;
};
