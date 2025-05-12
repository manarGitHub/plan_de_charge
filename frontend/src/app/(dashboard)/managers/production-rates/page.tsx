"use client";
import { useGetMonthlyRatesQuery, useUpdateMonthlyRatesMutation } from "@/state/api";
import React, { useState } from "react";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { 
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Slider,
  InputAdornment,
  Box,
  Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Link from "next/link";
import { monthNames } from "@/lib/constants";
import { useAppSelector } from "@/app/redux";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const MonthlyProductionRates = () => {
  const { data: rates, isLoading, isError, refetch } = useGetMonthlyRatesQuery();
  const [updateMonthlyRates, { isLoading: isUpdating }] = useUpdateMonthlyRatesMutation();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Year selection state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const minYear = 2000;
  const maxYear = new Date().getFullYear() + 5;

  const handleRefreshRates = async () => {
    try {
      await updateMonthlyRates({ year: selectedYear }).unwrap();
      setSnackbar({ open: true, message: `Taux pour ${selectedYear} actualisés avec succès !`, severity: 'success' });
      refetch();
    } catch (error) {
      setSnackbar({ open: true, message: `Échec de l'actualisation des taux pour ${selectedYear}`, severity: 'error' });
    }
  };

  const handleYearChange = (event: Event, newValue: number | number[]) => {
    setSelectedYear(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? minYear : Number(event.target.value);
    setSelectedYear(Math.min(Math.max(value, minYear), maxYear));
  };

  const handleBlur = () => {
    if (selectedYear < minYear) {
      setSelectedYear(minYear);
    } else if (selectedYear > maxYear) {
      setSelectedYear(maxYear);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRateColor = (value: number) => {
    if (value < 1) return '#ffcccc';    // Light red
    if (value === 1) return '#ccffcc';  // Light green
    return '#ffb347';                   // Clear vibrant orange
  };

  const columns: GridColDef[] = [
    { 
      field: "userId", 
      headerName: "ID Utilisateur", 
      width: 100 
    },
    { 
      field: "username", 
      headerName: "Nom d'utilisateur", 
      width: 150,
      renderCell: (params) => params.row.user?.username || 'N/A'
    },
    { 
      field: "month", 
      headerName: "Mois", 
      width: 120,
      renderCell: (params) => monthNames[parseInt(params.value) - 1] || params.value
    },
    { 
      field: "availableDays", 
      headerName: "Jours Disponibles", 
      type: "number", 
      width: 150 
    },
    { 
      field: "workingDays", 
      headerName: "Jours Travaillés", 
      type: "number", 
      width: 150 
    },
      // Add new unbilledDays column
  { 
    field: "unbilledDays", 
    headerName: "Jours Non Facturés", 
    type: "number", 
    width: 170 
  },
  // Update productionRate and add occupationRate
  { 
    field: "occupationRate", 
    headerName: "Taux d'Occupation", 
    type: "number", 
    width: 170,
    renderCell: (params: GridRenderCellParams) => (
      <Typography 
        sx={{ 
          backgroundColor: getRateColor(params.value),
          padding: '2px 8px',
          borderRadius: '4px',
          width: '100%',
          textAlign: 'center',
          color: (theme) => theme.palette.mode === 'dark' ? '#333' : 'inherit'
        }}
      >
        {formatPercentage(params.value)}
      </Typography>
    ),
    valueFormatter: (params: { value: number }) => formatPercentage(params.value),
  },
  { 
    field: "productionRate", 
    headerName: "Taux de Production", 
    type: "number", 
    width: 150,
    renderCell: (params: GridRenderCellParams) => (
      <Typography 
        sx={{ 
          backgroundColor: getRateColor(params.value),
          padding: '2px 8px',
          borderRadius: '4px',
          width: '100%',
          textAlign: 'center',
          color: (theme) => theme.palette.mode === 'dark' ? '#333' : 'inherit'
        }}
      >
        {formatPercentage(params.value)}
      </Typography>
    ),
    valueFormatter: (params: { value: number }) => formatPercentage(params.value),
  },
    { 
      field: "createdAt", 
      headerName: "Créé le", 
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString()
    },
    { 
      field: "updatedAt", 
      headerName: "Mis à jour le", 
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString()
    },
  ];

  if (isLoading) return <div>Chargement...</div>;
  if (isError || !rates) return <div>Erreur lors du chargement des taux de production</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name={`Taux de Production Mensuelle - ${selectedYear}`} />
      
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ width: 300 }}>
          <Typography gutterBottom>Sélectionner l'Année</Typography>
          <Slider
            value={selectedYear}
            onChange={handleYearChange}
            min={minYear}
            max={maxYear}
            step={1}
            valueLabelDisplay="auto"
            aria-labelledby="year-slider"
          />
        </Box>
        
        <TextField
          label="Année"
          type="number"
          value={selectedYear}
          onChange={handleInputChange}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon />
              </InputAdornment>
            ),
            inputProps: {
              min: minYear,
              max: maxYear,
            }
          }}
          sx={{ width: 120 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={isUpdating ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefreshRates}
          disabled={isUpdating}
          sx={{ height: 56 }}
        >
          {isUpdating ? 'Actualisation...' : 'Actualiser les Taux'}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          component={Link}
          href="/managers/monthlyproductionDashboard"
          sx={{ height: 56 }}
        >
          Voir le Tableau de Bord
        </Button>
      </Stack>

      {/* Data Grid Section */}
      <Typography variant="h6" gutterBottom>
        Données Détailées
      </Typography>
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rates.filter(rate => 
            new Date(rate.createdAt).getFullYear() === selectedYear || 
            new Date(rate.updatedAt).getFullYear() === selectedYear
          )}
          columns={columns}
          getRowId={(row) => `${row.userId}-${row.month}`}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MonthlyProductionRates;