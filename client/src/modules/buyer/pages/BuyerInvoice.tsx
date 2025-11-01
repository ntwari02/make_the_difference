import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  GridLegacy as Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { api as coreApi } from '../../../core/services/api/apiClient';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import toast from 'react-hot-toast';

interface InvoiceItem {
  id: string;
  item_id: string;
  item_type: 'car' | 'spare_part';
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string | null;
}

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  order_number: string;
  order_id: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: any;
  };
  seller: {
    business_name: string;
    email: string;
    phone: string;
    address: any;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  status: string;
}

const BuyerInvoice: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await coreApi.get(`/orders/${orderId}/invoice`);
        const invoiceData = (response as any).data?.data || (response as any).data;
        setInvoice(invoiceData);
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        if (err?.response?.status === 403) {
          const errorMessage = err?.response?.data?.message || 'Invoice not available yet. The seller has not sent the invoice.';
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          setError(err.message || 'Failed to load invoice');
          toast.error('Failed to load invoice');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) {
      toast.error('Invoice data not available');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule: any = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule;

      const invoiceElement = document.querySelector('[data-invoice-content]') as HTMLElement;
      if (!invoiceElement) {
        toast.error('Invoice content not found');
        return;
      }

      toast.loading('Generating PDF...');

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `invoice_${invoice.invoice_number || invoice.order_number || orderId || 'unknown'}.pdf`;
      pdf.save(filename);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try printing instead.');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch {
        return address;
      }
    }
    const parts: string[] = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip) parts.push(address.zip);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    const isPending = error?.toLowerCase().includes('not available') || error?.toLowerCase().includes('not sent');
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity={isPending ? 'warning' : 'error'}>
          {error || 'Invoice not found'}
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button onClick={() => navigate('/buyer/orders')}>
            Back to Orders
          </Button>
          {isPending && (
            <Button variant="outlined" onClick={() => navigate('/buyer/orders')}>
              View My Orders
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Orders">
            <IconButton onClick={() => navigate('/buyer/orders')} color="primary">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight={700}>
            Invoice #{invoice.invoice_number}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Print Invoice">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton onClick={handleDownloadPDF} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Invoice Content */}
      <Box data-invoice-content>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Invoice Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  component="img"
                  src="/logo.jpg"
                  alt="Reaglex Logo"
                  sx={{
                    height: 60,
                    width: 60,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Reaglex
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
                    INVOICE
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invoice #: {invoice.invoice_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order #: {invoice.order_number}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDate(invoice.invoice_date)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Seller & Buyer Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  From (Seller)
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {invoice.seller.business_name}
                </Typography>
                {invoice.seller.email && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {invoice.seller.email}
                  </Typography>
                )}
                {invoice.seller.phone && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {invoice.seller.phone}
                  </Typography>
                )}
                {invoice.seller.address && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {formatAddress(invoice.seller.address)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  To (Buyer)
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {invoice.buyer.name}
                </Typography>
                {invoice.buyer.email && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {invoice.buyer.email}
                  </Typography>
                )}
                {invoice.buyer.phone && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {invoice.buyer.phone}
                  </Typography>
                )}
                {invoice.buyer.address && (
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {formatAddress(invoice.buyer.address)}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Order Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Order Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    Payment Method:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.payment_method}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    Payment Status:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    Delivery Method:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.delivery_method.charAt(0).toUpperCase() + invoice.delivery_method.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    Order Status:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Items Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.image && (
                            <Box
                              component="img"
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                            />
                          )}
                          <Typography variant="body2" fontWeight={600}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.sku}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(item.unit_price, invoice.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.total_price, invoice.currency)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 250 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax ({invoice.tax_rate}%):</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(invoice.tax_amount, invoice.currency)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BuyerInvoice;

