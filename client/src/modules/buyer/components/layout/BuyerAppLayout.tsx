import React from 'react';
import { Outlet } from 'react-router-dom';
import BuyerLayout from './BuyerLayout';

const BuyerAppLayout: React.FC = () => {
  return (
    <BuyerLayout>
      <Outlet />
    </BuyerLayout>
  );
};

export default BuyerAppLayout;


