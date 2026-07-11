// frontend/src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button, Pagination, Spinner } from 'react-bootstrap';
import api from '../api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import RegionCard from '../components/RegionCard';
import { toast } from 'react-toastify';

const COLORS = ['#0E9AA7', '#046D63', '#0FB7C8', '#00796b', '#00bcd4', '#8e24aa'];

export default function AnalyticsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [safest, setSafest] = useState([]);
  const [unsafe, setUnsafe] = useState([]);

  /** Load paginated incidents */
  useEffect(() => {
    loadIncidents();
  }, [page, q, typeFilter, severityFilter]);

  /** Load analytics + region level data */
  useEffect(() => {
    loadAnalytics();
    loadRegions();
  }, []);

  /** INCIDENT TABLE LOADING */
  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/incidents', {
        params: { page, limit, q, type: typeFilter, severity: severityFilter }
      });
      setIncidents(res.data.incidents || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  /** PIE + TREND ANALYTICS */
  const loadAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics/type');

      // FIX: ensure name + value fields exist for recharts
      const mapped = (res.data || []).map(d => ({
        name: d.name || d._id || "Unknown",
        value: d.count || 0
      }));

      setPieData(mapped);

      // Trend
      const trendRes = await api.get('/admin/analytics/trend');
      const trendMapped = (trendRes.data || []).map(d => ({
        date: d._id,
        count: d.count
      }));
      setTrendData(trendMapped);

    } catch (err) {
      console.error(err);
    }
  };

  /** SAFEST + UNSAFE REGIONS */
  const loadRegions = async () => {
    try {
      const res = await api.get('/admin/analytics/regions');

      setSafest(res.data.safest || []);
      setUnsafe(res.data.mostUnsafe || res.data.unsafe || []);

    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Custom tooltip showing name & value cleanly
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-2 rounded" style={{ color: "#fff" }}>
          <strong>{payload[0].payload.name}</strong>
          <br />
          {payload[0].value} incidents
        </div>
      );
    }
    return null;
  };

  return (
    <Container fluid className="py-4">
      <h2 className="text-white mb-3">Analytics Dashboard</h2>

      <Row className="mb-3">
        {/* FILTER SIDEBAR */}
        <Col md={3}>
          <div className="glass p-3">
            <h5 className="text-white">Filters</h5>

            <Form.Group className="mb-2">
              <Form.Label className="text-white-50 small">Search</Form.Label>
              <Form.Control value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search description or type" />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="text-white-50 small">Type</Form.Label>
              <Form.Control value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                placeholder="Type" />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="text-white-50 small">Severity</Form.Label>
              <Form.Control value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
                placeholder="Severity" />
            </Form.Group>

            <div className="d-grid mt-2">
              <Button onClick={() => { setPage(1); loadIncidents(); }} className="btn btn-gradient">
                Apply
              </Button>
            </div>
          </div>
        </Col>

        {/* ANALYTICS SECTION */}
        <Col md={9}>
          <Row className="g-3">
            {/* DONUT PIE CHART */}
            <Col md={6}>
              <div className="glass p-3" style={{ height: 280 }}>
                <h6 className="text-white">Incidents by Type</h6>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>

            {/* LINE TREND CHART */}
            <Col md={6}>
              <div className="glass p-3" style={{ height: 280 }}>
                <h6 className="text-white">Trends (last 30 days)</h6>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0E9AA7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          {/* INCIDENT TABLE */}
          <div className="glass mt-3 p-3">
            <h6 className="text-white mb-2">Incident Data</h6>

            {loading ? (
              <div className="text-center py-3"><Spinner /></div>
            ) : (
              <Table responsive bordered hover variant="dark" className="mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Time</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc._id}>
                      <td>{inc.type}</td>
                      <td>{inc.severity}</td>
                      <td>{new Date(inc.time).toLocaleString()}</td>
                      <td>
                        {inc.location?.coordinates
                          ? `${inc.location.coordinates[1].toFixed(4)}, ${inc.location.coordinates[0].toFixed(4)}`
                          : (inc?.meta?.region || 'Unknown')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-white-50">Total: {total}</div>
              <Pagination>
                <Pagination.Prev disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Next disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
              </Pagination>
            </div>
          </div>
        </Col>
      </Row>

      {/* SAFE / UNSAFE REGIONS */}
      <Row className="g-3 mt-3">
        <Col md={6}>
          <div className="glass p-3">
            <h5 className="text-white">5 Safest Regions</h5>
            <div className="d-flex gap-3 flex-wrap">
              {safest.length === 0
                ? <div className="text-white-50">No data</div>
                : safest.map(it => <RegionCard key={it.region} item={it} />)}
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="glass p-3">
            <h5 className="text-white">5 Most Unsafe Regions</h5>
            <div className="d-flex gap-3 flex-wrap">
              {unsafe.length === 0
                ? <div className="text-white-50">No data</div>
                : unsafe.map(it => <RegionCard key={it.region} item={it} />)}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
