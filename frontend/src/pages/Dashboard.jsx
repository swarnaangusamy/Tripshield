import React, { useEffect, useState } from 'react';
import api from '../api';
import SOSButton from '../components/SOSButton';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [sosList, setSosList] = useState([]);
  useEffect(()=> {
    const fetch = async () => {
      try {
        const profile = await api.get('/auth/me').catch(()=>null);
        setUser(profile?.data?.user || null);
        if (profile?.data?.user) {
          const res = await api.get(`/sos/user/${profile.data.user.id}`);
          setSosList(res.data);
        }
      } catch (err) { console.error(err); }
    };
    fetch();
  }, []);
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-2 glass p-4 rounded">
        <h3 className="text-lg font-semibold">Profile</h3>
        {user ? (
          <div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phoneNumber}</p>
            <Link to="/profile" className="text-sm underline">Edit profile</Link>
          </div>
        ) : <p>Loading...</p>}
        <div className="mt-4">
          <h4 className="font-medium">Emergency Contacts</h4>
          {user?.emergencyContacts?.map((c,i)=>(
            <div key={i} className="p-2 border rounded my-2">
              <p>{c.name} — {c.phoneNumber}</p>
              <p>{c.relationship}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="glass p-4 rounded">
        <h4 className="font-semibold">Quick Actions</h4>
        <div className="mt-2">
          <SOSButton />
          <Link to="/map" className="block mt-2 underline">Open Map</Link>
        </div>

        <div className="mt-4">
          <h5 className="font-medium">Recent SOS</h5>
          {sosList.length === 0 ? <p>No SOS history</p> : sosList.slice(0,5).map(s => (
            <div key={s._id} className="border rounded p-2 my-2">
              <div>{new Date(s.time).toLocaleString()}</div>
              <div>{s.message}</div>
            </div>
          ))}
        </div>
      </aside>

      <div className="col-span-3 glass p-4 rounded mt-4">
        <h4 className="font-semibold">Incident Analytics (preview)</h4>
        {/* Placeholder for charts; implement with Recharts later */}
        <p>Pie chart: incidents by type</p>
      </div>
    </div>
  );
}
