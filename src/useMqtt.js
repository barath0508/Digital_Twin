import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

// --- Simulation helpers ---
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

const generateSimulatedData = (t) => ({
  node: 'Node1',
  timestamp: new Date().toISOString(),
  dht11: {
    temp: parseFloat((27 + 5 * Math.sin(t / 20)).toFixed(1)),
    humidity: parseFloat((55 + 15 * Math.sin(t / 30 + 1)).toFixed(1)),
  },
  bmp180: { pressure: parseFloat((1013 + 5 * Math.sin(t / 40)).toFixed(2)) },
  mpu6050: {
    ax: parseFloat((0.1 * Math.sin(t / 5)).toFixed(3)),
    ay: parseFloat((-0.3 + 0.2 * Math.cos(t / 7)).toFixed(3)),
    az: parseFloat((9.8 + 0.05 * Math.sin(t / 3)).toFixed(3)),
  },
  noise: randInt(500, 780),
  flow: parseFloat((2 + 1.5 * Math.abs(Math.sin(t / 15))).toFixed(2)),
  co2: randInt(400, 900),
  co: randInt(5, 30),
});

const useMqtt = () => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const connectedRef = useRef(false); // track live status without re-render loops
  const simTickRef = useRef(0);

  useEffect(() => {
    // ----- Simulation interval (runs always; pauses output when MQTT is live) -----
    const simInterval = setInterval(() => {
      if (!connectedRef.current) {
        simTickRef.current += 1;
        setData(generateSimulatedData(simTickRef.current));
      }
    }, 2000);

    // ----- MQTT connection to HiveMQ Cloud -----
    console.log('Connecting to MQTT broker...');
    const client = mqtt.connect(
      'wss://bf0c2aed638d4a048ca7768d70b23253.s1.eu.hivemq.cloud:8883/mqtt',
      {
        clientId: `mqttjs_` + Math.random().toString(16).substr(2, 8),
        username: 'Esp32_C6',
        password: 'Miniproject1',
        protocol: 'wss',
      }
    );

    client.on('connect', () => {
      console.log('Connected to MQTT successfully!');
      connectedRef.current = true;
      setConnected(true);
      client.subscribe('tinyml/anomaly', (err) => {
        if (!err) console.log('Subscribed to tinyml/anomaly');
        else console.error('Subscription error', err);
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'tinyml/anomaly') {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.node === 'Node1') setData(payload);
        } catch (e) {
          console.error('Failed to parse MQTT message:', e);
        }
      }
    });

    client.on('error', (err) => { console.error('MQTT error:', err); client.end(); });
    client.on('close', () => { console.log('MQTT closed.'); connectedRef.current = false; setConnected(false); });
    client.on('offline', () => { console.log('MQTT offline.'); connectedRef.current = false; setConnected(false); });

    return () => {
      clearInterval(simInterval);
      client.end();
    };
  }, []);

  return { data, connected };
};

export default useMqtt;
