// frontend/src/pages/MapPage.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Container } from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api";
import "../index.css";

/* ---------------- ICONS ---------------- */
const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
const policeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/483/483361.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
const fireIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1010/1010405.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
const defaultIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

/* ---------------- helper icon chooser ---------------- */
function iconForType(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("hospital") || t.includes("clinic") || t.includes("health")) return hospitalIcon;
  if (t.includes("police")) return policeIcon;
  if (t.includes("fire")) return fireIcon;
  if (t.includes("ambulance") || t.includes("first_aid")) return ambulanceIcon;
  return defaultIcon;
}

/* ---------------- Recenter button (inside MapContainer children) ---------------- */
function RecenterButton({ position }) {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (position) map.flyTo(position, 15, { duration: 0.7 });
      }}
      className="btn btn-gradient"
      style={{
        position: "absolute",
        zIndex: 1000,
        top: 10,
        right: 10,
        padding: "8px 12px",
        borderRadius: 20,
      }}
    >
      Recenter
    </button>
  );
}

/* ---------------- Haversine (m) ---------------- */
function haversine(a, b) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

/* ---------------- main component ---------------- */
export default function MapPage() {
  const [userPos, setUserPos] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // routing & navigation state
  const [destination, setDestination] = useState(null); // [lat, lng]
  const [routeGeo, setRouteGeo] = useState(null); // array of [lat,lng] for polyline
  const [routeSummary, setRouteSummary] = useState(null); // {distance, duration}
  const [steps, setSteps] = useState([]); // array of {distance,maneuver, instruction, location}
  const [navState, setNavState] = useState("idle"); // idle | running | paused
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // map + nav refs
  const mapRef = useRef(null);
  const navMarkerRef = useRef(null);
  const animRef = useRef(null);
  const progressRef = useRef({ idx: 0, segT: 0, traveled: 0 });

  // get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        console.warn("geolocation failed, using fallback", err);
        setUserPos([12.9716, 77.5946]); // fallback Bangalore
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // fetch nearby POIs
  useEffect(() => {
    if (!userPos) return;
    let cancelled = false;
    const fetchNearby = async () => {
      setLoadingPlaces(true);
      try {
        const res = await api.get(`/map/nearby?lat=${userPos[0]}&lng=${userPos[1]}&radius=3000`);
        if (!cancelled) {
          const list = (res.data && res.data.places) || [];
          const normalized = list.map((p) => ({
            ...p,
            type: (p.type || (p.tags && (p.tags.amenity || p.tags.emergency || p.tags.healthcare))) || "unknown",
          }));
          setPlaces(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch nearby:", err);
        if (!cancelled) setPlaces([]);
      } finally {
        if (!cancelled) setLoadingPlaces(false);
      }
    };
    fetchNearby();
    return () => (cancelled = true);
  }, [userPos]);

  /* ---------------- Request route from OSRM ----------------
     OSRM endpoint: https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true
  */
  const fetchRouteFromOSRM = async (start, end) => {
    try {
      const sLon = start[1], sLat = start[0];
      const eLon = end[1], eLat = end[0];
      const url = `https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM response ${res.status}`);
      const data = await res.json();
      if (!data.routes || !data.routes.length) throw new Error("No route returned");
      const route = data.routes[0];
      // geometry coordinates are [lon, lat] pairs
      const coords = route.geometry && route.geometry.coordinates
        ? route.geometry.coordinates.map((c) => [c[1], c[0]])
        : [];

      // build steps from legs -> steps -> maneuver/instruction
      const extractedSteps = [];
      if (route.legs && route.legs.length) {
        route.legs.forEach((leg) => {
          if (leg.steps && leg.steps.length) {
            leg.steps.forEach((st) => {
              extractedSteps.push({
                instruction: st.maneuver && (st.maneuver.instruction || st.maneuver.type) ? (st.maneuver.instruction || st.maneuver.type) : (st.name || st.mode || ""),
                name: st.name || "",
                distance: st.distance || 0,
                duration: st.duration || 0,
                location: st.maneuver && st.maneuver.location ? [st.maneuver.location[1], st.maneuver.location[0]] : null, // [lat,lng]
                maneuver: st.maneuver || null,
              });
            });
          }
        });
      }

      setRouteGeo(coords);
      setRouteSummary({ distance: route.distance || 0, duration: route.duration || 0 });
      setSteps(extractedSteps);
      return { coords, summary: { distance: route.distance, duration: route.duration }, steps: extractedSteps };
    } catch (err) {
      console.error("OSRM route error:", err);
      throw err;
    }
  };

  /* ---------------- start navigation: animate moving marker along routeGeo ---------------- */
  const startNavigation = () => {
    if (!routeGeo || routeGeo.length < 2) {
      alert("No route available to navigate. Please calculate route first.");
      return;
    }

    // remove old nav marker
    if (navMarkerRef.current) {
      try { navMarkerRef.current.remove(); } catch (e) {}
      navMarkerRef.current = null;
    }
    // create nav marker
    const navIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#0E9AA7;box-shadow:0 2px 8px rgba(14,154,167,0.95);border:3px solid white;"></div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const map = mapRef.current;
    if (!map) return;

    navMarkerRef.current = L.marker(routeGeo[0], { icon: navIcon }).addTo(map);

    // compute segment lengths
    const segs = [];
    let totalLen = 0;
    for (let i = 0; i < routeGeo.length - 1; i++) {
      const a = routeGeo[i], b = routeGeo[i + 1];
      const d = haversine(a, b);
      segs.push({ a, b, d });
      totalLen += d;
    }

    // Determine speed m/s using routeSummary duration if available, else a default speed (e.g., 6 m/s ~ 21.6 km/h)
    const speed = routeSummary && routeSummary.duration && routeSummary.duration > 0
      ? Math.max(2, (routeSummary.distance / routeSummary.duration)) // m/s
      : 6;

    // animation state
    let segIndex = 0;
    let segProgress = 0; // meters along current segment
    let lastTs = null;
    progressRef.current = { traveled: 0 };

    setNavState("running");
    // speak initial instruction if exists and voice enabled
    if (voiceEnabled && steps && steps.length) {
      const first = steps[0].instruction || steps[0].name || "Start driving";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(first));
    }

    function frame(ts) {
      if (navState === "paused") {
        lastTs = ts;
        animRef.current = requestAnimationFrame(frame);
        return;
      }
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000; // seconds
      lastTs = ts;
      const move = speed * dt; // meters to move
      let remaining = move;
      while (remaining > 0 && segIndex < segs.length) {
        const seg = segs[segIndex];
        const left = seg.d - segProgress;
        if (remaining < left) {
          segProgress += remaining;
          remaining = 0;
        } else {
          remaining -= left;
          segIndex++;
          segProgress = 0;
        }
      }

      // if reached end
      if (segIndex >= segs.length) {
        navMarkerRef.current.setLatLng(routeGeo[routeGeo.length - 1]);
        map.panTo(routeGeo[routeGeo.length - 1], { animate: true, duration: 0.5 });
        // stop navigation
        setNavState("idle");
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
        // arrival voice
        if (voiceEnabled) window.speechSynthesis.speak(new SpeechSynthesisUtterance("You have arrived at your destination."));
        return;
      }

      // interpolate position on current segment
      const s = segs[segIndex];
      const frac = s.d === 0 ? 0 : segProgress / s.d;
      const lat = s.a[0] + (s.b[0] - s.a[0]) * frac;
      const lng = s.a[1] + (s.b[1] - s.a[1]) * frac;
      navMarkerRef.current.setLatLng([lat, lng]);
      // pan map smoothly to marker
      map.panTo([lat, lng], { animate: true, duration: 0.5 });

      // update progressed distance to trigger step voice when crossing step location
      progressRef.current.traveled += move;

      // simple step detection: find first step whose location distance is > traveled and speak next when reached
      if (steps && steps.length) {
        let cum = 0;
        for (let i = 0; i < steps.length; i++) {
          cum += steps[i].distance || 0;
          if (progressRef.current.traveled >= cum - 2 && progressRef.current.traveled <= cum + 2) {
            // speak this instruction
            const txt = steps[i].instruction || steps[i].name || "";
            if (voiceEnabled && txt) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
            }
            break;
          }
        }
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
  };

  const pauseNavigation = () => { setNavState("paused"); };
  const resumeNavigation = () => { setNavState("running"); };
  const stopNavigation = () => {
    setNavState("idle");
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    if (navMarkerRef.current) {
      try { navMarkerRef.current.remove(); } catch(e) {}
      navMarkerRef.current = null;
    }
  };

  /* ---------------- handle select place: fetch route ---------------- */
  const onSelectPlace = async (place) => {
    if (!userPos) {
      alert("Waiting for your location...");
      return;
    }
    setSelectedPlaceId(place.id);
    setDestination([place.lat, place.lon]);
    setRouteGeo(null);
    setRouteSummary(null);
    setSteps([]);
    stopNavigation();

    try {
      const { coords, summary, steps: extractedSteps } = await fetchRouteFromOSRM(userPos, [place.lat, place.lon]);
      setRouteGeo(coords);
      setRouteSummary(summary);
      setSteps(extractedSteps || []);
      // center map to fit route
      const map = mapRef.current;
      if (map && coords && coords.length) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    } catch (err) {
      alert("Failed to calculate route. Try again.");
    }
  };

  // helper: fly to place but also get route
  const locateAndRoute = (place) => {
    // same as select
    onSelectPlace(place);
  };

  // store map instance
  const handleMapCreated = (mapInstance) => { mapRef.current = mapInstance; };

  // categorize places
  const categorized = useMemo(() => {
    const hospitals = [], police = [], help = [];
    places.forEach(p => {
      const t = (p.type || "").toLowerCase();
      if (t.includes("hospital") || t.includes("clinic") || t.includes("health")) hospitals.push(p);
      else if (t.includes("police")) police.push(p);
      else help.push(p);
    });
    return { hospitals, police, help };
  }, [places]);

  return (
    <div className="peacock-bg text-white py-4" style={{ minHeight: "100vh" }}>
      <Container fluid style={{ maxWidth: 1200 }}>
        <div className="glass p-3">
          <h3 className="text-center mb-2">TRIPSHIELD's Navigation Map</h3>
          <p className="text-center mb-3">Select a place and press Start. Use Voice ON to hear instructions.</p>

          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
            {/* SIDEBAR */}
            <aside style={{ maxHeight: "74vh", overflowY: "auto" }}>
              <div className="glass p-2 mb-3 d-flex gap-2">
                <button className="btn btn-sm btn-gradient" onClick={() => {
                  setPlaces([]); setRouteGeo(null); setDestination(null); setSteps([]); setRouteSummary(null);
                  setUserPos(userPos ? [...userPos] : userPos);
                }}>Refresh</button>
                <button className="btn btn-sm btn-outline-light" onClick={() => setVoiceEnabled(v => !v)}>
                  {voiceEnabled ? "Voice: ON" : "Voice: OFF"}
                </button>
                <div style={{ marginLeft: "auto" }}>
                  {routeSummary ? <small>{(routeSummary.distance/1000).toFixed(2)} km · {Math.ceil(routeSummary.duration/60)} min</small> : <small className="text-muted">No route</small>}
                </div>
              </div>

              <div className="glass p-3 mb-3">
                <h6>Hospitals ({categorized.hospitals.length})</h6>
                {loadingPlaces && <div>Loading...</div>}
                {!loadingPlaces && categorized.hospitals.length === 0 && <div className="text-muted">No hospitals found nearby</div>}
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {categorized.hospitals.map(h => (
                    <li key={h.id} className="py-2 d-flex gap-2 align-items-start">
                      <img src={hospitalIcon.options.iconUrl} width={28} height={28} alt="h" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{h.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>{h.tags && h.tags.phone ? h.tags.phone : ''}</div>
                        <div className="mt-1">
                          <button className="btn btn-sm btn-gradient me-2" onClick={() => onSelectPlace(h)}>Route</button>
                          <button className="btn btn-sm btn-outline-light" onClick={() => locateAndRoute(h)}>Locate</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass p-3 mb-3">
                <h6>Police ({categorized.police.length})</h6>
                {!loadingPlaces && categorized.police.length === 0 && <div className="text-muted">No police found nearby</div>}
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {categorized.police.map(p => (
                    <li key={p.id} className="py-2 d-flex gap-2 align-items-start">
                      <img src={policeIcon.options.iconUrl} width={28} height={28} alt="p" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>{p.tags && p.tags.phone ? p.tags.phone : ''}</div>
                        <div className="mt-1">
                          <button className="btn btn-sm btn-gradient me-2" onClick={() => onSelectPlace(p)}>Route</button>
                          <button className="btn btn-sm btn-outline-light" onClick={() => locateAndRoute(p)}>Locate</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass p-3 mb-3">
                <h6>Help Centres ({categorized.help.length})</h6>
                {!loadingPlaces && categorized.help.length === 0 && <div className="text-muted">No help centres found nearby</div>}
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {categorized.help.map(h => (
                    <li key={h.id} className="py-2 d-flex gap-2 align-items-start">
                      <img src={iconForType(h.type).options.iconUrl} width={28} height={28} alt="hc" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{h.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>{h.type}</div>
                        <div className="mt-1">
                          <button className="btn btn-sm btn-gradient me-2" onClick={() => onSelectPlace(h)}>Route</button>
                          <button className="btn btn-sm btn-outline-light" onClick={() => locateAndRoute(h)}>Locate</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </aside>

            {/* MAP */}
            <div>
              <div style={{ position: "relative" }}>
                <MapContainer
                  whenCreated={handleMapCreated}
                  center={userPos || [12.9716, 77.5946]}
                  zoom={13}
                  style={{ height: "72vh", width: "100%", borderRadius: 12 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

                  <RecenterButton position={userPos} />

                  {/* user marker */}
                  {userPos && <Marker position={userPos}><Popup>You are here</Popup></Marker>}

                  {/* route polyline if exists */}
                  {routeGeo && <Polyline positions={routeGeo} pathOptions={{ color: "#0E9AA7", weight: 6, opacity: 0.95 }} />}

                  {/* place markers */}
                  {places.map(p => (
                    <Marker key={`${p.osmType}_${p.id}`} position={[p.lat, p.lon]} icon={iconForType(p.type)}>
                      <Popup>
                        <div style={{ minWidth: 200 }}>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: 12, opacity: 0.85 }}>{p.type}</div>
                          {p.tags && p.tags.phone && <div style={{ fontSize: 12 }}>📞 {p.tags.phone}</div>}
                          <div className="mt-2">
                            <button className="btn btn-sm btn-gradient me-2" onClick={() => onSelectPlace(p)}>Get Directions</button>
                            <button className="btn btn-sm btn-outline-light" onClick={() => locateAndRoute(p)}>Locate</button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                </MapContainer>
              </div>

              {/* controls + steps */}
              <div className="glass p-3 mt-3">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <strong>Navigation</strong>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{destination ? "Destination set" : "No destination"}</div>
                  </div>

                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button className="btn btn-sm btn-gradient" onClick={() => {
                      if (!routeGeo) { alert("Please set destination and wait for route calculation."); return; }
                      startNavigation();
                    }} disabled={!routeGeo || navState === "running"}>
                      Start
                    </button>
                    <button className="btn btn-sm btn-outline-light" onClick={pauseNavigation} disabled={navState !== "running"}>Pause</button>
                    <button className="btn btn-sm btn-outline-light" onClick={resumeNavigation} disabled={navState !== "paused"}>Resume</button>
                    <button className="btn btn-sm btn-outline-light" onClick={stopNavigation}>Stop</button>
                    <button className="btn btn-sm btn-outline-light ms-2" onClick={() => { setDestination(null); setRouteGeo(null); setRouteSummary(null); setSteps([]); stopNavigation(); }}>Clear</button>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  {routeSummary ? (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>Distance: <strong>{(routeSummary.distance / 1000).toFixed(2)} km</strong></div>
                      <div>ETA: <strong>{Math.ceil(routeSummary.duration / 60)} min</strong></div>
                    </div>
                  ) : (
                    <div className="text-muted">Route summary will appear here.</div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <h6>Turn-by-turn</h6>
                  {steps && steps.length ? (
                    <ol style={{ paddingLeft: 18 }}>
                      {steps.map((s, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 14 }}>{s.instruction || s.name || "Continue"}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>{s.distance ? `${(s.distance/1000).toFixed(2)} km` : ""} {s.duration ? `• ${Math.ceil(s.duration/60)} min` : ""}</div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-muted">Turn instructions will appear after route calculation.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}

/* ---------------- helper: set mapRef when map created ---------------- */
function handleMapCreated(mapInstance) {
  // mapRef is a module-level closure not available here; this utility is used inside JSX via whenCreated prop.
  // We'll set it by calling a function from the React component; but because we keep the component's handleMapCreated,
  // we simply used whenCreated={handleMapCreated} inside the component; ensure it binds correctly in your setup.
  // If needed, replace with an inline arrow from whenCreated={(m) => mapRef.current = m}.
  // (Left here for clarity.)
}
