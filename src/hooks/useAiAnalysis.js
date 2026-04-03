import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

const useAiAnalysis = (data) => {
  const [analysis, setAnalysis] = useState({
    riskScore: 0,
    insights: [],
    status: 'initializing',
    timestamp: new Date().toLocaleTimeString()
  });

  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);

  useEffect(() => {
    if (!data) return;

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAnalysis({
        riskScore: 0,
        status: 'stable',
        insights: [{
          type: 'warning',
          text: 'VITE_GEMINI_API_KEY is not configured in .env file. Running in fallback mode.'
        }],
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    // Throttle calls to once every 15 seconds
    const now = Date.now();
    if (now - lastFetchTime.current < 15000 || isFetching.current) {
      return;
    }

    const fetchAnalysis = async () => {
      isFetching.current = true;
      try {
        setAnalysis(prev => ({ ...prev, status: 'computing' }));
        
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
          Analyze the following environmental telemetry data from an industrial digital twin.
          Data:
          - Temperature: ${data.dht11?.temp}°C
          - Humidity: ${data.dht11?.humidity}%
          - CO2 Levels: ${data.co2} ppm
          - Carbon Monoxide (CO): ${data.co} ppm
          - Acoustic Noise: ${data.noise} mV
          - Structural Flow: ${data.flow || 0}
          
          You are an advanced Neural Core AI. Return a structured JSON response identifying anomalies and providing predictive maintenance insights. 
          Respond *only* with the JSON object containing:
          1. "riskScore": A number from 0 to 100 indicating danger.
          2. "status": One of "stable", "warning", or "critical".
          3. "insights": An array of short, impactful string statements (max 3). Each insight must be an object with "type" (one of "success", "warning", "danger") and "text" (the string statement).
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                riskScore: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ['stable', 'warning', 'critical'] },
                insights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ['success', 'warning', 'danger'] },
                      text: { type: Type.STRING }
                    },
                    required: ['type', 'text']
                  }
                }
              },
              required: ['riskScore', 'status', 'insights']
            }
          }
        });

        // Parse response
        if (response.text) {
          const result = JSON.parse(response.text);
          setAnalysis({
            riskScore: result.riskScore,
            status: result.status,
            insights: result.insights,
            timestamp: new Date().toLocaleTimeString()
          });
          lastFetchTime.current = Date.now();
        }
      } catch (error) {
        console.error('AI Analysis Error:', error);
        setAnalysis(prev => ({
          ...prev,
          status: 'stable',
          insights: [{
            type: 'danger',
            text: `Neural communication error: ${error.message || 'Unknown network failure'}`
          }],
          timestamp: new Date().toLocaleTimeString()
        }));
      } finally {
        isFetching.current = false;
      }
    };

    fetchAnalysis();

  }, [data]);

  return analysis;
};

export default useAiAnalysis;
