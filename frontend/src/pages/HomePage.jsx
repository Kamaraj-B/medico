import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import apiService from "../services/api.service";
import { useNavigate } from "react-router-dom";
import AppointmentSections from "../components/Medconnect/AppointmentSections";
import HealthResources from "../components/Medconnect/HealthResources";
import Footer from "../components/Medconnect/Footer";

const quickFilters = [
  { key: "all", label: "All" },
  { key: "hospital", label: "Hospital" },
  { key: "clinic", label: "Clinic" },
  { key: "pharmacy", label: "Pharmacy" },
];
const statsItems = [
  { value: "500+", label: "Specialists" },
  { value: "120", label: "Clinics" },
  { value: "15k+", label: "Active Users" },
  { value: "24/7", label: "Support" },
];

const defaultCenter = { lat: 13.0827, lng: 80.2707 };
const markerIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:#0058be;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"><div style="width:7px;height:7px;border-radius:50%;background:#fff;position:absolute;top:4px;left:4px"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -16],
});
const currentLocationIcon = L.divIcon({
  className: "current-location-marker",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#0ea5e9;border:2px solid #fff;box-shadow:0 0 0 6px rgba(14,165,233,.2)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const FitMarkersBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (!markers?.length) return;
    const bounds = L.latLngBounds(markers.map((m) => [Number(m.lat), Number(m.lng)]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [markers, map]);
  return null;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [facilityType, setFacilityType] = useState("all");
  const [facilities, setFacilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [autoFitMarkers, setAutoFitMarkers] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facRes, appRes] = await Promise.all([
          apiService.get("/facilities"),
          apiService.get("/appointments", { params: { limit: 50, page: 1 } }),
        ]);
        setFacilities(facRes.data || []);
        setAppointments(Array.isArray(appRes.data) ? appRes.data : appRes.data?.items || []);
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };
    loadData();
  }, []);

  const filteredFacilities = useMemo(() => {
    const byType =
      facilityType === "all"
        ? facilities
        : facilities.filter((facility) => facility.type === facilityType);
    const query = searchSpecialty.trim().toLowerCase();
    if (!query) return byType;
    return byType.filter((facility) =>
      `${facility.name || ""} ${facility.type || ""} ${facility.address?.city || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [facilities, facilityType, searchSpecialty]);

  const validMapFacilities = useMemo(
    () =>
      filteredFacilities.filter(
        (f) => Number.isFinite(Number(f.lat)) && Number.isFinite(Number(f.lng))
      ),
    [filteredFacilities]
  );

  useEffect(() => {
    setAutoFitMarkers(true);
  }, [facilityType, searchSpecialty]);

  const handleSearch = async () => {
    setSearchPanelOpen(false);
    if (!searchLocation.trim()) {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(loc);
        setUserLocation(loc);
        setAutoFitMarkers(false);
      });
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await response.json();
      if (data?.length) {
        setMapCenter({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
        setAutoFitMarkers(false);
      }
    } catch (error) {
      console.error("Location search failed:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f8fafc" }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, mt: "64px" }}>
        <Box sx={{ position: "relative", height: { xs: 520, md: 600 }, borderRadius: 4, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15,23,42,.08)" }}>
          <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <MapContainer center={mapCenter} zoom={12} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
              <RecenterMap center={mapCenter} />
              {autoFitMarkers ? <FitMarkersBounds markers={validMapFacilities} /> : null}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validMapFacilities.map((facility) => (
                <Marker
                  key={facility._id}
                  position={{ lat: Number(facility.lat), lng: Number(facility.lng) }}
                  icon={markerIcon}
                >
                  <Popup>
                    <Box sx={{ minWidth: 180 }}>
                      <Typography sx={{ fontWeight: 700 }}>{facility.name}</Typography>
                      <Typography sx={{ fontSize: 13, color: "#64748b", textTransform: "capitalize", mb: 1 }}>
                        {facility.type}
                      </Typography>
                      <Button size="small" variant="contained" sx={searchBtnSx} onClick={() => navigate(`/booking/${facility._id}`)}>
                        Book Now
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              ))}
              {userLocation ? (
                <Marker position={userLocation} icon={currentLocationIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </Box>

          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.32), rgba(15,23,42,0.18))", display: "grid", placeItems: "center", px: 2, pointerEvents: "none" }}>
            {searchPanelOpen ? (
              <Box sx={{ width: "100%", maxWidth: 1080, bgcolor: "rgba(255,255,255,.95)", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(15,23,42,.14)", borderRadius: 3, p: { xs: 2, md: 3 }, pointerEvents: "auto" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
                  <Button onClick={() => setSearchPanelOpen(false)} sx={{ minWidth: 0, width: 34, height: 34, borderRadius: "50%", color: "#475569", p: 0 }}>
                    <CloseOutlinedIcon fontSize="small" />
                  </Button>
                </Box>
                <Typography sx={{ fontFamily: "Manrope", fontSize: { xs: 30, md: 42 }, fontWeight: 800, textAlign: "center", mb: 2.4 }}>
                  Find Care Near You
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2.3}>
                  <TextField
                    placeholder="Specialty, condition, or doctor name"
                    fullWidth
                    value={searchSpecialty}
                    onChange={(e) => setSearchSpecialty(e.target.value)}
                    InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} /> }}
                  />
                  <TextField
                    placeholder="City, state, or zip code"
                    fullWidth
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    InputProps={{ startAdornment: <LocationOnOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} /> }}
                  />
                  <Button variant="contained" sx={searchBtnSx} onClick={handleSearch}>
                    Search
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {quickFilters.map((item) => (
                    <Chip
                      key={item.key}
                      label={item.label}
                      onClick={() => setFacilityType(item.key)}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        bgcolor: facilityType === item.key ? "#dbeafe" : "#fff",
                        color: facilityType === item.key ? "#1d4ed8" : "#334155",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Box sx={{ position: "absolute", top: 16, right: 16, pointerEvents: "auto" }}>
                <Button variant="contained" startIcon={<TuneOutlinedIcon />} onClick={() => setSearchPanelOpen(true)} sx={{ ...searchBtnSx, borderRadius: 999 }}>
                  Open Search
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <AppointmentSections appointments={appointments} />
      <HealthResources />
      <section className="bg-slate-50 py-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-8">
          {statsItems.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-[#0058be]">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Footer />

      <Button
        variant="contained"
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          width: 58,
          minWidth: 58,
          height: 58,
          borderRadius: "50%",
          bgcolor: "#0058be",
          boxShadow: "0 12px 28px rgba(37,99,235,.4)",
        }}
      >
        <ChatOutlinedIcon />
      </Button>
    </Box>
  );
}

const searchBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 1.5,
  px: 3,
  py: 1.15,
  backgroundColor: "#0058be",
  "&:hover": { backgroundColor: "#2170e4" },
};

