import { useState } from "react";
import {
  Button,
  SkeletonRegion,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeleton,
} from "@alien6-studio/elea-ui";

const orders = [
  { id: "#1042", status: "Shipped" },
  { id: "#1043", status: "Packed" },
];

export function OrdersRegion() {
  const [fetching, setFetching] = useState(false);

  function reload(duration: number) {
    setFetching(true);
    setTimeout(() => setFetching(false), duration);
  }

  return (
    <>
      <Button disabled={fetching} onClick={() => reload(1500)}>
        Reload slowly
      </Button>
      <Button disabled={fetching} onClick={() => reload(150)}>
        Reload fast
      </Button>
      <SkeletonRegion loading={fetching} label="Loading orders" delay={300}>
        {fetching ? (
          <TableSkeleton rows={2} columns={2} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SkeletonRegion>
    </>
  );
}
