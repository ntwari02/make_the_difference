import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  GridLegacy as Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CloudDownload as CloudDownloadIcon,
  DirectionsCar as CarIcon,
  AttachMoney as PriceIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerCarsExport: React.FC = () => {
  const [exportFormat, setExportFormat] = React.useState('csv');
  const [dateRange, setDateRange] = React.useState('6m');
  const [selectedData, setSelectedData] = React.useState({
    inventory: true,
    sales: true,
    analytics: false,
    bundles: false,
    customers: false
  });

  const [exportHistory, setExportHistory] = React.useState([
    {
      id: 1,
      name: 'Car Inventory Report - October 2025',
      format: 'CSV',
      size: '3.2 MB',
      date: '2025-10-21',
      status: 'completed',
      downloads: 2
    },
    {
      id: 2,
      name: 'Sales Analytics - Q3 2025',
      format: 'Excel',
      size: '6.8 MB',
      date: '2025-10-15',
      status: 'completed',
      downloads: 1
    },
    {
      id: 3,
      name: 'Complete Car Export',
      format: 'CSV',
      size: '12.4 MB',
      date: '2025-10-10',
      status: 'completed',
      downloads: 3
    },
    {
      id: 4,
      name: 'Customer Data Export',
      format: 'JSON',
      size: '4.1 MB',
      date: '2025-10-05',
      status: 'completed',
      downloads: 1
    }
  ]);

  const handleDataSelectionChange = (dataType: keyof typeof selectedData) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  const handleExport = () => {
    // Simulate export process
    const newExport = {
      id: Math.max(...exportHistory.map(e => e.id)) + 1,
      name: `Car Export - ${new Date().toLocaleDateString()}`,
      format: exportFormat.toUpperCase(),
      size: '4.5 MB',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      downloads: 0
    };
    setExportHistory([newExport, ...exportHistory]);
  };

  const getSelectedDataCount = () => {
    return Object.values(selectedData).filter(Boolean).length;
  };

  const getEstimatedSize = () => {
    const baseSize = 2.0; // MB
    const multiplier = getSelectedDataCount();
    return (baseSize * multiplier).toFixed(1);
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ExportIcon sx={{ fontSize: 32, color: 'warning.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Export Car Data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ px: 3 }}
          >
            Refresh Data
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Export your car inventory, sales data, customer information, and analytics in various formats for external analysis and reporting.
        </Alert>

        <Grid container spacing={3}>
          {/* Export Configuration */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Export Configuration
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Export Format</InputLabel>
                      <Select
                        value={exportFormat}
                        label="Export Format"
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="pdf">PDF Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={dateRange}
                        label="Date Range"
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <MenuItem value="1m">Last Month</MenuItem>
                        <MenuItem value="3m">Last 3 Months</MenuItem>
                        <MenuItem value="6m">Last 6 Months</MenuItem>
                        <MenuItem value="1y">Last Year</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Select Data to Export
                </Typography>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedData.inventory}
                            onChange={() => handleDataSelectionChange('inventory')}
                          />
                        }
                        label="Car Inventory"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Vehicle details, prices, mileage, status
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedData.sales}
                            onChange={() => handleDataSelectionChange('sales')}
                          />
                        }
                        label="Sales Data"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Transactions, revenue, sales history
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedData.analytics}
                            onChange={() => handleDataSelectionChange('analytics')}
                          />
                        }
                        label="Analytics Data"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Views, favorites, performance metrics
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedData.bundles}
                            onChange={() => handleDataSelectionChange('bundles')}
                          />
                        }
                        label="Bundle Data"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Car bundles, packages, promotions
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedData.customers}
                            onChange={() => handleDataSelectionChange('customers')}
                          />
                        }
                        label="Customer Data"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Customer information, inquiries, preferences
                      </Typography>
                    </Grid>
                  </Grid>
                </FormGroup>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Export Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Format: {exportFormat.toUpperCase()} | 
                    Data Types: {getSelectedDataCount()} selected | 
                    Estimated Size: {getEstimatedSize()} MB
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    disabled={getSelectedDataCount() === 0}
                    sx={{ px: 4 }}
                  >
                    Export Data
                  </Button>
                  <Button variant="outlined" startIcon={<ScheduleIcon />}>
                    Schedule Export
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Export Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Export Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    <Typography variant="body2">
                      Total Exports: {exportHistory.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudDownloadIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="body2">
                      Total Downloads: {exportHistory.reduce((sum, e) => sum + e.downloads, 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExportIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="body2">
                      Last Export: {exportHistory[0]?.date}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Quick Export Templates
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>
                    Monthly Inventory Report
                  </Button>
                  <Button size="small" variant="outlined" fullWidth>
                    Sales Performance Summary
                  </Button>
                  <Button size="small" variant="outlined" fullWidth>
                    Customer Analytics Report
                  </Button>
                  <Button size="small" variant="outlined" fullWidth>
                    Complete Business Data
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Data Overview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CarIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="body2">
                      Total Cars: 24
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriceIcon sx={{ color: 'success.main' }} />
                    <Typography variant="body2">
                      Total Value: $684k
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: 'info.main' }} />
                    <Typography variant="body2">
                      Total Views: 1,250
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export History */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Export History
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Export Name</TableCell>
                    <TableCell align="center">Format</TableCell>
                    <TableCell align="center">Size</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Downloads</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportHistory.map((exportItem) => (
                    <TableRow key={exportItem.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {exportItem.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={exportItem.format} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {exportItem.size}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {exportItem.date}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Completed"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {exportItem.downloads}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerCarsExport;
