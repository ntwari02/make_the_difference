import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Divider,
  CircularProgress,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CloudDownload as CloudDownloadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { sparePartsApi } from '../services/sparePartsApi';
import toast from 'react-hot-toast';

interface ExportHistoryItem {
  id: string;
  name: string;
  format: string;
  size: string;
  date: string;
  status: string;
  downloads: number;
  fileUrl?: string;
}

const SellerSparePartsExport: React.FC = () => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
  const [selectedData, setSelectedData] = useState({
    inventory: true,
    sales: false,
    analytics: false,
    bundles: false
  });
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = () => {
    // Load export history from localStorage
    try {
      const stored = localStorage.getItem('sparePartsExportHistory');
      if (stored) {
        setExportHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  };

  const saveExportHistory = (exportItem: ExportHistoryItem) => {
    try {
      const updated = [exportItem, ...exportHistory];
      localStorage.setItem('sparePartsExportHistory', JSON.stringify(updated.slice(0, 50))); // Keep last 50
      setExportHistory(updated.slice(0, 50));
    } catch (error) {
      console.error('Failed to save export history:', error);
    }
  };

  const handleDataSelectionChange = (dataType: string) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType as keyof typeof prev]
    }));
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (getSelectedDataCount() === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }

    try {
      setExporting(true);

      const exportParams = {
        format: exportFormat,
        date_range: dateRange,
        include_inventory: selectedData.inventory,
        include_sales: selectedData.sales,
        include_analytics: selectedData.analytics,
        include_bundles: selectedData.bundles
      };

      const response = await sparePartsApi.exportData(exportParams);

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition'] || '';
      let filename = `spare-parts-export-${new Date().toISOString().split('T')[0]}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        filename += exportFormat === 'csv' ? '.csv' : exportFormat === 'excel' ? '.xlsx' : '.json';
      }

      // Handle blob response for CSV/Excel
      if (exportFormat !== 'json') {
        const blob = new Blob([response.data], {
          type: exportFormat === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        downloadFile(blob, filename);
      } else {
        // Handle JSON response
        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadFile(blob, filename);
      }

      // Calculate file size (approximate)
      const fileSize = exportFormat === 'json' 
        ? JSON.stringify(response.data).length 
        : response.data.size || 0;
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

      // Save to history
      const exportItem: ExportHistoryItem = {
        id: Date.now().toString(),
        name: `Export - ${new Date().toLocaleDateString()}`,
        format: exportFormat.toUpperCase(),
        size: `${sizeInMB} MB`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        downloads: 1
      };

      saveExportHistory(exportItem);

      toast.success(`Export completed successfully. File: ${filename}`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleQuickExport = async (template: 'inventory' | 'complete') => {
    try {
      setExporting(true);

      let exportParams: any = {
        format: 'csv' as const,
        date_range: 'all' as const,
        include_inventory: true,
        include_sales: false,
        include_analytics: false,
        include_bundles: false
      };

      if (template === 'complete') {
        exportParams = {
          format: 'csv' as const,
          date_range: 'all' as const,
          include_inventory: true,
          include_sales: true,
          include_analytics: true,
          include_bundles: true
        };
      }

      const response = await sparePartsApi.exportData(exportParams);
      const filename = `${template}-export-${new Date().toISOString().split('T')[0]}.csv`;
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      downloadFile(blob, filename);

      const fileSize = response.data.size || 0;
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

      const exportItem: ExportHistoryItem = {
        id: Date.now().toString(),
        name: `${template === 'inventory' ? 'Monthly Inventory Report' : 'Complete Business Data'} - ${new Date().toLocaleDateString()}`,
        format: 'CSV',
        size: `${sizeInMB} MB`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        downloads: 1
      };

      saveExportHistory(exportItem);
      toast.success(`Export completed: ${filename}`);
    } catch (error: any) {
      console.error('Quick export failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadHistory = async (exportItem: ExportHistoryItem) => {
    try {
      setExporting(true);
      
      // Determine export settings from history item
      const format = exportItem.format.toLowerCase() as 'csv' | 'excel' | 'json';
      
      // Create a new export with default settings matching the history item
      const exportParams = {
        format,
        date_range: 'all' as const,
        include_inventory: true,
        include_sales: false,
        include_analytics: false,
        include_bundles: false
      };

      const response = await sparePartsApi.exportData(exportParams);
      const filename = `${exportItem.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}${format === 'csv' ? '.csv' : format === 'excel' ? '.xlsx' : '.json'}`;
      
      if (format !== 'json') {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        downloadFile(blob, filename);
      } else {
        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadFile(blob, filename);
      }

      // Update download count
      const updatedHistory = exportHistory.map(item => 
        item.id === exportItem.id 
          ? { ...item, downloads: item.downloads + 1 }
          : item
      );
      setExportHistory(updatedHistory);
      localStorage.setItem('sparePartsExportHistory', JSON.stringify(updatedHistory));

      toast.success(`Export downloaded: ${filename}`);
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to download export');
    } finally {
      setExporting(false);
    }
  };

  const getSelectedDataCount = () => {
    return Object.values(selectedData).filter(Boolean).length;
  };

  const getEstimatedSize = () => {
    // Rough estimate based on selected data types
    const baseSize = 0.5; // MB per data type
    const multiplier = getSelectedDataCount();
    return (baseSize * multiplier).toFixed(1);
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
              aria-label="go back"
            >
              <ArrowBackIcon />
            </IconButton>
            <ExportIcon sx={{ fontSize: 32, color: 'warning.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Export Data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadExportHistory}
            disabled={loadingHistory}
            sx={{ px: 3 }}
          >
            Refresh History
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Export your inventory, sales, and analytics data in various formats for external analysis and reporting.
        </Alert>

        {exporting && <LinearProgress sx={{ mb: 3 }} />}

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
                        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel' | 'json')}
                      >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={dateRange}
                        label="Date Range"
                        onChange={(e) => setDateRange(e.target.value as any)}
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
                        label="Inventory Data"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Parts, stock levels, prices, categories
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
                        Transactions, revenue, customer data
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
                        Performance metrics, trends, insights
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
                        Product bundles, pricing, promotions
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
                    startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                    onClick={handleExport}
                    disabled={exporting || getSelectedDataCount() === 0}
                    sx={{ px: 4 }}
                  >
                    {exporting ? 'Exporting...' : 'Export Data'}
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
                      Last Export: {exportHistory[0]?.date || 'Never'}
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
                  <Button 
                    size="small" 
                    variant="outlined" 
                    fullWidth
                    onClick={() => handleQuickExport('inventory')}
                    disabled={exporting}
                  >
                    Monthly Inventory Report
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    fullWidth
                    onClick={() => handleQuickExport('complete')}
                    disabled={exporting}
                  >
                    Complete Business Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export History */}
        {exportHistory.length > 0 && (
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
                          <Tooltip title="Download (creates new export)">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleDownloadHistory(exportItem)}
                              disabled={exporting}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsExport;
