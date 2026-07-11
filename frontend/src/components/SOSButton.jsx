import React from 'react';
import api from '../api';

export default function SOSButton(){
  const sendSOS = async () => {
    try {
      // get profile & coords
      const profileRes = await api.get('/auth/me');
      const user = profileRes.data.user;
      const coords = [77.0, 11.0]; // demo coords. Replace with geolocation.
      const recipients = user.emergencyContacts || [];
      await api.post('/sos/send', {
        userId: user.id,
        message: `SOS from ${user.name}`,
        coordinates: coords,
        recipients
      });
      alert('SOS sent');
    } catch (err) {
      console.error(err);
      alert('Failed to send SOS');
    }
  };
  return (
    <button onClick={sendSOS} className="w-full p-3 rounded bg-red-600 text-white mt-2">
      SOS
    </button>
  )
}
