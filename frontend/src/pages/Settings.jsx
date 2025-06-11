// frontend/src/pages/Settings.jsx
import React from 'react';
import { Card } from 'antd';
import { motion } from 'framer-motion';

function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
      style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <Card>
        <p>Settings page under construction.</p>
      </Card>
    </motion.div>
  );
}

export default Settings;