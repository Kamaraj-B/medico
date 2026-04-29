import AppointmentDetails from "../components/Booking/AppointmentDetails";
import BookingCardList from "../components/Booking/BookingCardList";
import FilterPanel from "../components/Booking/FilterPanel";
import { fetchAppointments } from "../store/slices/appointmentSlice";
import { Box } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AppointmentPage = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  const [filters, setFilters] = useState({
    facility: "All",
    fromDate: "",
    toDate: "",
    doctorName: "",
    patientName: "",
    status: "All",
    mode: "All",
    page: page,
    limit: 10,
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      facility: "All",
      fromDate: "",
      toDate: "",
      doctorName: "",
      patientName: "",
      status: "All",
      mode: "All",
      page: page,
      limit: 10,
    });
  };

  // get appointments state from Redux
  const { list: bookings, pagination } = useSelector((state) => state.appointments);

  const handlePageChange = (event, value) => {
    setPage(value);
    setFilters((prev) => ({ ...prev, page: value }));
  };

  useEffect(() => {
    setHospitals(
      Array.from(new Set(bookings.map((booking) => booking.facilityId.name)))
    );
  }, [bookings]);

  // fetch appointments when page loads
  useEffect(() => {
    const query = {};
    if (filters.facility && filters.facility !== "All")
      query.facility = filters.facility;
    if (filters.status && filters.status !== "All")
      query.status = filters.status;
    if (filters.fromDate) query.fromDate = filters.fromDate;
    if (filters.toDate) query.toDate = filters.toDate;
    if (filters.doctorName) query.doctorName = filters.doctorName;
    if (filters.patientName) query.patientName = filters.patientName;
    if (filters.mode && filters.mode !== "All") query.mode = filters.mode;
    if (filters.page) query.page = filters.page;
    if (filters.limit) query.limit = filters.limit;

    dispatch(fetchAppointments({ query }));
  }, [filters, dispatch]);

  return (
    <Box
      sx={{
        padding: "5px",
        marginBottom: "10px",
        marginTop: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Filter Panel */}
        <FilterPanel
          hospitals={hospitals}
          handleFilterChange={handleFilterChange}
          handleClearFilters={handleClearFilters}
          filters={filters}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" justifyContent="right" alignItems="right" mr={6}>
          <Pagination
            count={pagination.totalPages || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      </Box>
      <Box sx={{ height: "100vh", display: "flex", overflow: "hidden" }}>
        {/* Left Side: Cards */}
        <Box
          sx={{
            width: selected ? "60%" : "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            borderRight: selected ? "1px solid #ccc" : "none",
            transition: "width 0.4s ease",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <BookingCardList
              bookings={bookings}
              onSelect={setSelected}
              selectedId={selected?._id}
            />
          </Box>
        </Box>

        {/* Right Side: Booking Details */}
        <Box
          sx={{
            width: selected ? "40%" : "0%",
            opacity: selected ? 1 : 0,
            visibility: selected ? "visible" : "hidden",
            height: "100%",
            overflowY: "auto",
            p: selected ? 2 : 0,
            transition: "all 0.4s ease",
          }}
          className="hide-scrollbar"
        >
          {selected && (
            <AppointmentDetails booking={selected} setSelected={setSelected} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentPage;
