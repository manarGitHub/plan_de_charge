// app/monthlyproductionDashboard/page.tsx
"use client";
import { useGetMonthlyRatesQuery } from "@/state/api";
import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Stack,
  TextField,
  Slider,
  InputAdornment,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { monthNames } from "@/lib/constants";

const MonthlyProductionDashboard = () => {
  const { data: rates, isLoading, isError } = useGetMonthlyRatesQuery();
  
  // Year selection state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0); // For tabs
  const minYear = 2000;
  const maxYear = new Date().getFullYear() + 5;

  // Filter rates by selected year and process data for charts
  const processedData = useMemo(() => {
    if (!rates) return { monthlyData: [], userStats: [] };

    // Filter by year (assuming createdAt or updatedAt contains the year)
    const yearRates = rates.filter(rate => 
      new Date(rate.createdAt).getFullYear() === selectedYear || 
      new Date(rate.updatedAt).getFullYear() === selectedYear
    );

    // Aggregate data by month
    const monthlyAggregate: Record<string, {
      month: string;
      totalProduction: number;
      avgProduction: number;
      userCount: number;
    }> = {};

    // User statistics
    const userStatsMap: Record<string, {
      userId: string;
      username: string;
      totalProduction: number;
      avgProduction: number;
      monthCount: number;
    }> = {};

    yearRates.forEach(rate => {
      const monthName = monthNames[parseInt(rate.month) - 1] || `Mois ${rate.month}`;
      
      // Monthly aggregation
      if (!monthlyAggregate[rate.month]) {
        monthlyAggregate[rate.month] = {
          month: monthName,
          totalProduction: 0,
          avgProduction: 0,
          userCount: 0
        };
      }
      
      monthlyAggregate[rate.month].totalProduction += rate.productionRate || 0;
      monthlyAggregate[rate.month].userCount += 1;
      monthlyAggregate[rate.month].avgProduction = 
      monthlyAggregate[rate.month].totalProduction / monthlyAggregate[rate.month].userCount;

      // User statistics
      const username = rate.user?.username || `Utilisateur ${rate.userId}`;
      if (!userStatsMap[rate.userId]) {
        userStatsMap[rate.userId] = {
          userId: rate.userId,
          username,
          totalProduction: 0,
          avgProduction: 0,
          monthCount: 0
        };
      }
      
      userStatsMap[rate.userId].totalProduction += rate.productionRate || 0;
      userStatsMap[rate.userId].monthCount += 1;
      userStatsMap[rate.userId].avgProduction = 
        userStatsMap[rate.userId].totalProduction / userStatsMap[rate.userId].monthCount;
    });

    // Convert to arrays and sort
    const monthlyData = Object.values(monthlyAggregate)
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
      
    const userStats = Object.values(userStatsMap)
      .sort((a, b) => b.avgProduction - a.avgProduction)
      .slice(0, 10); // Top 10 users

    return { monthlyData, userStats };
  }, [rates, selectedYear]);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) return <div>Chargement...</div>;
  if (isError || !rates) return <div>Erreur lors du chargement des taux de production</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name={`Tableau de Bord de Production Mensuelle - ${selectedYear}`} />
      
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
      </Stack>

      {/* Dashboard Section */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Aperçu de la Production - {selectedYear}
          </Typography>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Tendances Mensuelles" />
            <Tab label="Performance des Utilisateurs" />
            <Tab label="Résumé" />
          </Tabs>
          
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" align="center">Taux de Production Mensuelle</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={processedData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgProduction" name="Production Moyenne" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" align="center">Tendances Mensuelles</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processedData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgProduction" name="Production Moyenne" stroke="#8884d8" />
                    <Line type="monotone" dataKey="totalProduction" name="Production Totale" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" align="center">Meilleurs Performeurs</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={processedData.userStats}
                    layout="vertical"
                    margin={{ left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="username" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgProduction" name="Production Moyenne" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" align="center">Répartition des Performances</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={processedData.userStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="avgProduction"
                      nameKey="username"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processedData.userStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Résumé Annuel</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Production Totale</Typography>
                    <Typography variant="h4" color="primary">
                      {processedData.monthlyData.reduce((sum, month) => sum + month.totalProduction, 0).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Production Mensuelle Moyenne</Typography>
                    <Typography variant="h4" color="secondary">
                      {processedData.monthlyData.length > 0 
                        ? (processedData.monthlyData.reduce((sum, month) => sum + month.avgProduction, 0) / 
                           processedData.monthlyData.length).toFixed(2)
                        : 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Utilisateurs Actifs</Typography>
                    <Typography variant="h4">
                      {processedData.userStats.length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Mois les Plus Performants</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...processedData.monthlyData].sort((a, b) => b.avgProduction - a.avgProduction).slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgProduction" name="Production Moyenne" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default MonthlyProductionDashboard;