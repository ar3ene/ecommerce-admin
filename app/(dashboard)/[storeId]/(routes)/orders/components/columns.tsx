"use client"

import { ColumnDef } from "@tanstack/react-table"

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  amount: string;
  paidAmount: string;
  paidCurrency: string;
  orderCurrency: string;
  isPaid: boolean;
  quantity: number;
  totalPrice?: string;
  products: string;
  createdAt: string;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "产品",
  },
  {
    accessorKey: "phone",
    header: "电话",
  },
  {
    accessorKey: "address",
    header: "地址",
  },
  {
    accessorKey: "quantity",
    header: "订单量",
  },
  {
    accessorKey: "amount",
    header: "人民币金额"
  },
  {
    accessorKey: "paidAmount",
    header: "支付金额"
  },
  {
    accessorKey: "paidCurrency",
    header: "支付货币"
  },
  // {
  //   accessorKey: "totalPrice",
  //   header: "总价",
  // },
  {
    accessorKey: "isPaid",
    header: "支付状态",
  },
];
