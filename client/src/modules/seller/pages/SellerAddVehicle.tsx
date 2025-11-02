import React, { useEffect, useState } from 'react';
import SellerCarsAdvanced from './SellerCarsAdvanced';
import { sellerApi } from '../services/sellerApi';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardHeader, CardContent, IconButton, Tooltip, Table, TableHead, TableRow, TableCell, TableBody, Stack, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const SellerAddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<any[]>([]);

  const loadCars = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.cars.getMyCars({ page: 1, limit: 50 });
      setCars(Array.isArray(res?.cars) ? res.cars : []);
    } catch (e) {
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleDelete = async (carId: string) => {
    if (!carId) return;
    try {
      await sellerApi.cars.deleteCar(carId);
      await loadCars();
    } catch {}
  };

  const handleEdit = (carId: string) => {
    if (!carId) return;
    navigate(`/seller/cars/${carId}/edit`);
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SellerCarsAdvanced />

      <Card>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6">My Vehicles</Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh">
                  <span>
                    <IconButton onClick={loadCars} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          }
        />
        <CardContent>
          {cars.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No vehicles yet. Add one using the form above.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Make</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.title || `${c.brand || ''} ${c.model || ''}`}</TableCell>
                    <TableCell>{c.brand || '-'}</TableCell>
                    <TableCell>{c.model || '-'}</TableCell>
                    <TableCell>{c.year || '-'}</TableCell>
                    <TableCell align="right">{typeof c.price === 'number' ? `$${c.price.toLocaleString?.() || c.price}` : '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <span>
                            <IconButton size="small" onClick={() => handleEdit(c.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SellerAddVehicle;


