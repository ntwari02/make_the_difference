import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import BuyerLayout from '../../../modules/buyer/components/layout/BuyerLayout';
import SellerLayout from '../../../modules/seller/components/layout/SellerLayout';
import DealerLayout from '../../../modules/dealer/components/layout/DealerLayout';
import AdminLayout from '../../../modules/admin/components/layout/AdminLayout';

interface RoleAwareLayoutProps {
  children: React.ReactNode;
}

const RoleAwareLayout: React.FC<RoleAwareLayoutProps> = ({ children }) => {
  const role = (useSelector((s: RootState) => s.auth.user?.role) || '').toString().toLowerCase();

  if (role === 'seller') {
    return <SellerLayout>{children}</SellerLayout>;
  }
  if (role === 'dealer') {
    return <DealerLayout>{children}</DealerLayout>;
  }
  if (role === 'admin') {
    return <AdminLayout>{children}</AdminLayout>;
  }
  return <BuyerLayout>{children}</BuyerLayout>;
};

export default RoleAwareLayout;


