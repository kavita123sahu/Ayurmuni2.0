import { useCallback, useEffect, useMemo, useState } from 'react';
import * as OrderService from '../services/OrderService';
import {
  getActiveGatewayIds,
  mapCustomerPaymentGateways,
  resolveDefaultGateway,
  type PaymentGateway,
  type PaymentGatewayAvailability,
} from '../config/paymentGateways';
import { isPayphiNativeLinked } from '../services/PayphiService';

type Options = {
  /** When API fails, fall back to these ids as active. */
  fallbackGateways?: PaymentGateway[];
};

const DEFAULT_FALLBACK: PaymentGateway[] = ['cashfree', 'razorpay', 'icici'];

/**
 * Live gateway list from `/payments/customer/payment-gateways/`.
 * Only `status === active` can be selected for payment.
 */
export const usePaymentGateways = (options?: Options) => {
  const [gateways, setGateways] = useState<PaymentGatewayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackKey = (options?.fallbackGateways || DEFAULT_FALLBACK).join(',');

  const refresh = useCallback(async () => {
    const fallbackIds = (fallbackKey.split(',').filter(Boolean) as PaymentGateway[]).filter(
      id => id !== 'icici' || isPayphiNativeLinked(),
    );
    setLoading(true);
    setError(null);
    try {
      const res: any = await OrderService.getCustomerPaymentGateways();
      const rows = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res)
            ? res
            : [];

      const mapped = mapCustomerPaymentGateways(rows, {
        payphiNativeLinked: isPayphiNativeLinked(),
      });

      if (mapped.length) {
        setGateways(mapped);
        return mapped;
      }

      // Empty API → fall back so checkout is not blank
      const fallback = fallbackIds.map(
        id =>
          ({
            id,
            status: 'active',
            enabled: true,
            statusLabel: 'Available',
          }) as PaymentGatewayAvailability,
      );
      setGateways(fallback);
      return fallback;
    } catch (e: any) {
      setError(e?.message || 'Unable to load payment gateways');
      const fallback = fallbackIds.map(
        id =>
          ({
            id,
            status: 'active',
            enabled: true,
            statusLabel: 'Available',
          }) as PaymentGatewayAvailability,
      );
      setGateways(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [fallbackKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeGateways = useMemo(
    () => getActiveGatewayIds(gateways),
    [gateways],
  );

  const defaultGateway = useMemo(
    () => resolveDefaultGateway(null, activeGateways),
    [activeGateways],
  );

  return {
    gateways,
    activeGateways,
    defaultGateway,
    loading,
    error,
    refresh,
  };
};
