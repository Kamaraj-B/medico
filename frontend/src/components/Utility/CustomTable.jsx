import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TablePagination,
  TextField,
  Box,
} from "@mui/material";
import { useState, useMemo } from "react";

export default function CustomTable({ columns, data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState("");

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Filter logic (case-insensitive match for any column text)
  const filteredData = useMemo(() => {
    if (!filterText) return data;

    const lowercasedFilter = filterText.toLowerCase();

    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.id];
        return (
          typeof value === "string" &&
          value.toLowerCase().includes(lowercasedFilter)
        );
      })
    );
  }, [filterText, data, columns]);

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredData, page, rowsPerPage]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e7ecf5",
        borderRadius: 2.5,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box p={2} sx={{ borderBottom: "1px solid #edf1f8", backgroundColor: "#fcfdff" }}>
        <TextField
          label="Search records"
          variant="outlined"
          size="small"
          fullWidth
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setPage(0);
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    py: 1.4,
                    borderBottom: "1px solid #edf1f8",
                    backgroundColor: "#fafcff",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                hover
                sx={{
                  "&:last-child td": { borderBottom: "none" },
                  "& td": {
                    py: 1.4,
                    fontSize: "0.9rem",
                    color: "#0f172a",
                    borderBottom: "1px solid #f1f5fb",
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {col.render
                      ? col.render(row[col.id], row)
                      : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No matching records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: "1px solid #edf1f8",
          backgroundColor: "#fcfdff",
          "& .MuiTablePagination-toolbar": { minHeight: 52 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.82rem",
            color: "#64748b",
          },
        }}
      />
    </Paper>
  );
}
