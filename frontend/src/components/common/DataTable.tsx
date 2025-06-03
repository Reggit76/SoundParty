import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  error?: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  searchPlaceholder?: string;
  canEdit?: (row: any) => boolean;
  canDelete?: (row: any) => boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  isLoading = false,
  error,
  onEdit,
  onDelete,
  searchPlaceholder = 'Поиск...',
  canEdit,
  canDelete,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete) && <TableCell>Действия</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}>
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                    {(onEdit || onDelete) && (
                      <TableCell>
                        {onEdit && (!canEdit || canEdit(row)) && (
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (!canDelete || canDelete(row)) && (
                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
      />
    </Paper>
  );
};

export default DataTable;