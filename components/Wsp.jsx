"use client"
import React from 'react';
import { motion } from 'framer-motion';

function Wsp() {
  return (
    <motion.a
      href="https://wa.me/+5493874862962"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[10px] right-[40px] w-[60px] h-[60px] rounded-full bg-green-500 shadow-lg flex justify-center items-center z-10 hover:bg-green-600 transition-colors duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="w-[50px] h-[50px] bg-cover bg-center rounded-full z-10"
        style={{ backgroundImage: "url('/whatsapp.png')" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 5
        }}
      />
    </motion.a>
  );
}

export default Wsp; 
