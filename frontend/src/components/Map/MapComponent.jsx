import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFacilities } from "../../store/slices/facilitySlice";
import InfoWindowCard from "./InfoWindowCard";
import {
  ChecklistRtl as ChecklistRtlIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MedicalInformation as MedicalInformationIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { Box, Typography, Fab, InputBase, Paper } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = { lat: 13.0827, lng: 80.2707 };
const markerIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50% 50% 50% 0;
      background: #1976d2;
      position: relative;
      transform: rotate(-45deg);
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    ">
      <div style="
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        position: absolute;
        top: 4px;
        left: 4px;
      "></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -16],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const MapComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { facility: places, loading } = useSelector((state) => state.facility);

  const [location, setLocation] = useState(defaultCenter);
  const [selectedType, setSelectedType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchText.trim() || searchText.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        setSearchResults(
          data.map((item) => ({
            label: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
          }))
        );
      } catch (error) {
        console.error("Location search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(loc);
    });
  };

  const filteredPlaces =
    selectedType === "all"
      ? places
      : places.filter((place) => place.type === selectedType);

  const validPlaces = useMemo(
    () =>
      filteredPlaces.filter(
        (place) =>
          Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng))
      ),
    [filteredPlaces]
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8 rounded-xl bg-[#f8f9fb] shadow-sm">
      {/* Filters & Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, p: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {[
            { label: "All", icon: <ChecklistRtlIcon />, value: "all" },
            { label: "Hospital", icon: <LocalHospitalIcon />, value: "hospital" },
            { label: "Clinic", icon: <LocalPharmacyIcon />, value: "clinic" },
            { label: "Pharmacy", icon: <MedicalInformationIcon />, value: "pharmacy" },
          ].map(({ label, icon, value }) => (
            <Box key={value} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Fab size="small" color={selectedType === value ? "success" : "default"} onClick={() => setSelectedType(value)}>
                {icon}
              </Fab>
              <Typography variant="caption">{label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ position: "relative", width: { xs: "100%", sm: 280 }, maxWidth: 400 }}>
          <Paper sx={{ display: "flex", alignItems: "center", borderRadius: 2, pl: 2, pr: 2, py: 0.5 }}>
            <LocationOnIcon sx={{ color: "#1976d2", mr: 1 }} />
            <InputBase
              placeholder="Search for a location"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <LocateFixed size={25} onClick={getCurrentLocation} style={{ cursor: "pointer" }} />
          </Paper>
          {searchResults.length > 0 && (
            <Paper sx={{ position: "absolute", top: "105%", left: 0, right: 0, zIndex: 1200, maxHeight: 220, overflowY: "auto" }}>
              {searchResults.map((result) => (
                <Box
                  key={`${result.lat}-${result.lng}`}
                  sx={{ p: 1.25, borderBottom: "1px solid #eee", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                  onClick={() => {
                    setLocation({ lat: result.lat, lng: result.lng });
                    setSearchText(result.label);
                    setSearchResults([]);
                  }}
                >
                  <Typography variant="body2">{result.label}</Typography>
                </Box>
              ))}
            </Paper>
          )}
          {isSearching && (
            <Typography variant="caption" sx={{ ml: 1 }}>
              Searching...
            </Typography>
          )}
        </Box>
      </Box>

      {/* Map */}
      <MapContainer
        center={location}
        zoom={13}
        style={{ width: "100%", height: "60vh", borderRadius: "20px" }}
        scrollWheelZoom
      >
        <RecenterMap center={location} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validPlaces.map((place) => (
          <Marker
            key={place._id}
            position={{ lat: Number(place.lat), lng: Number(place.lng) }}
            icon={markerIcon}
            eventHandlers={{
              click: () => {},
            }}
          >
            <Popup>
              <InfoWindowCard
                marker={place}
                onClose={() => {}}
                onMoreDetails={() => navigate(`/details/${place._id}`)}
                onBookNow={() => navigate(`/booking/${place._id}`)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
