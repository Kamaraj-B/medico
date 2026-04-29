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
    <Paper>
      <Box p={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id || index}>
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
      />
    </Paper>
  );
}
